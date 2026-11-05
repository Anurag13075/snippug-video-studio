/**
 * Server-only Groq API proxy with Plan Gating, Rate Limiting & Validation.
 * GROQ_API_KEY is read strictly from server environment variables.
 */

import { GROQ_CONFIG } from "./plans";

// Simple in-memory rate limiter per IP / User
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= GROQ_CONFIG.requestsPerMinute) {
    return false;
  }

  entry.count++;
  return true;
}

export async function handleGroqApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Rate limit guard
  const clientIp = request.headers.get("x-forwarded-for") || "unknown-client";
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }

  const apiKey =
    process.env.GROQ_API_KEY ||
    (typeof process !== "undefined" && process.env ? process.env.GROQ_API_KEY : undefined);

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server configuration: GROQ_API_KEY is not set in environment.",
        mockSupported: false,
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  try {
    /* ── 1. Transcription (Whisper) ── */
    if (path === "/api/groq/transcribe") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const formData = await request.formData();
      const audioFile = formData.get("audio");

      if (!audioFile || !(audioFile instanceof Blob)) {
        return new Response(JSON.stringify({ error: "Missing audio blob in request" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      if (audioFile.size > GROQ_CONFIG.maxAudioChunkSizeBytes) {
        return new Response(
          JSON.stringify({ error: "Audio chunk exceeds maximum allowed size (24MB)" }),
          { status: 413, headers: { "content-type": "application/json" } },
        );
      }

      const groqFormData = new FormData();
      groqFormData.append("file", audioFile, "audio.wav");
      groqFormData.append("model", GROQ_CONFIG.whisperModel);
      groqFormData.append("response_format", "verbose_json");
      groqFormData.append("timestamp_granularities[]", "word");
      groqFormData.append("timestamp_granularities[]", "segment");

      const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: groqFormData,
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error("Groq Whisper API error:", errText);
        return new Response(
          JSON.stringify({ error: `Groq transcription error: ${errText}` }),
          { status: groqRes.status, headers: { "content-type": "application/json" } },
        );
      }

      const data = await groqRes.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    /* ── 2. Auto-Clip Generation (LLM) ── */
    if (path === "/api/groq/auto-clip") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const body = await request.json();
      const { transcriptText, duration, targetCount = 3, minDur = 15, maxDur = 60 } = body;

      if (!transcriptText || typeof duration !== "number") {
        return new Response(JSON.stringify({ error: "Missing transcript or duration" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      const prompt = `You are a world-class viral video editor for TikTok, YouTube Shorts, and Instagram Reels.
Analyze this video transcript and identify the top ${targetCount} most engaging, self-contained clips.

Video Total Duration: ${Math.round(duration)} seconds.
Target Clip Length: between ${minDur} and ${maxDur} seconds.

Transcript:
"${transcriptText.slice(0, 12000)}"

Respond ONLY with a valid JSON object matching this schema:
{
  "clips": [
    {
      "start": number (start time in seconds),
      "end": number (end time in seconds),
      "title": "Punchy 3-6 word title",
      "hook": "The captivating opening line or hook",
      "score": number (0-100 overall viral potential),
      "reason": "One clear sentence why this moment will perform well",
      "topic": "Short topic tag",
      "subscores": {
        "hook": number (0-100),
        "story": number (0-100),
        "payoff": number (0-100),
        "clarity": number (0-100),
        "ending": number (0-100)
      }
    }
  ]
}

Rules:
1. start must be >= 0 and end must be <= ${duration}.
2. (end - start) must be between ${minDur} and ${maxDur} seconds.
3. Hook must happen in the first 3 seconds.
4. No hallucinated times. Output valid JSON only.`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_CONFIG.llmModel,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        return new Response(JSON.stringify({ error: errText }), {
          status: groqRes.status,
          headers: { "content-type": "application/json" },
        });
      }

      const data = await groqRes.json();
      const content = data.choices?.[0]?.message?.content;
      return new Response(content, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    /* ── 3. Post Metadata Generation ── */
    if (path === "/api/groq/metadata") {
      const body = await request.json();
      const { clipText } = body;

      const prompt = `Generate social media post metadata for this clip transcript:
"${(clipText || "").slice(0, 2000)}"

Return a JSON object:
{
  "titles": ["Title 1", "Title 2", "Title 3"],
  "caption": "Engaging social post caption with a call to action",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_CONFIG.fastLlmModel,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      const data = await groqRes.json();
      const content = data.choices?.[0]?.message?.content;
      return new Response(content, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Groq handler error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
