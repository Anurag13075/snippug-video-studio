/**
 * Client-Side Transcription & Auto-Clip Pipeline
 * In-browser audio extraction -> server-side Groq Whisper -> overlap deduplication -> IndexedDB caching.
 */

import { extractAudioFromBlob, createWavChunks, type AudioAnalysis } from "./audio-extract";
import { computeFileHash } from "./storage";

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words?: TranscriptWord[];
}

export interface FullTranscript {
  mediaHash: string;
  text: string;
  words: TranscriptWord[];
  segments: TranscriptSegment[];
  duration: number;
}

export interface ClipCandidate {
  id: string;
  start: number;
  end: number;
  duration: number;
  title: string;
  hook: string;
  score: number;
  reason: string;
  topic: string;
  subscores: {
    hook: number;
    story: number;
    payoff: number;
    clarity: number;
    ending: number;
  };
  selected?: boolean;
}

const TRANSCRIPT_STORE = "snippug_transcripts_cache";

async function getCachedTranscript(mediaHash: string): Promise<FullTranscript | null> {
  try {
    const raw = localStorage.getItem(`${TRANSCRIPT_STORE}_${mediaHash}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function setCachedTranscript(mediaHash: string, data: FullTranscript): void {
  try {
    localStorage.setItem(`${TRANSCRIPT_STORE}_${mediaHash}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * Transcribe a video File/Blob with in-browser extraction and Groq Whisper
 */
export async function transcribeVideo(
  videoBlob: Blob,
  onProgress?: (step: string, percent: number) => void,
): Promise<{ transcript: FullTranscript; analysis: AudioAnalysis }> {
  onProgress?.("Extracting audio...", 10);
  const mediaHash = await computeFileHash(videoBlob);

  // Check cache first (zero cost!)
  const cached = await getCachedTranscript(mediaHash);
  const analysis = await extractAudioFromBlob(videoBlob);

  if (cached) {
    onProgress?.("Loaded from local cache", 100);
    return { transcript: cached, analysis };
  }

  onProgress?.("Encoding audio chunks...", 25);
  const chunks = await createWavChunks(analysis.audioBuffer);

  const allWords: TranscriptWord[] = [];
  const allSegments: TranscriptSegment[] = [];
  let fullText = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progressPct = Math.round(30 + ((i + 1) / chunks.length) * 60);
    onProgress?.(`Transcribing part ${i + 1} of ${chunks.length}...`, progressPct);

    const formData = new FormData();
    formData.append("audio", chunk.blob, `chunk_${i}.wav`);

    const res = await fetch("/api/groq/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Transcription request failed" }));
      throw new Error(err.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    const chunkWords: TranscriptWord[] = (data.words || []).map(
      (w: { word: string; start: number; end: number }) => ({
        word: w.word.trim(),
        start: Number((chunk.startTime + w.start).toFixed(2)),
        end: Number((chunk.startTime + w.end).toFixed(2)),
      }),
    );

    // De-duplicate overlap with previous words
    if (allWords.length > 0 && chunkWords.length > 0) {
      const lastWord = allWords[allWords.length - 1];
      const validFrom = lastWord.end - 0.2;
      const deduplicated = chunkWords.filter((w) => w.start >= validFrom);
      allWords.push(...deduplicated);
    } else {
      allWords.push(...chunkWords);
    }

    if (data.text) {
      fullText += (fullText ? " " : "") + data.text.trim();
    }
  }

  // Group words into readable caption segments (4-7 words per segment)
  const segments: TranscriptSegment[] = [];
  const wordsPerSeg = 6;
  for (let i = 0; i < allWords.length; i += wordsPerSeg) {
    const slice = allWords.slice(i, i + wordsPerSeg);
    if (slice.length > 0) {
      segments.push({
        id: `seg_${i}`,
        start: slice[0].start,
        end: slice[slice.length - 1].end,
        text: slice.map((w) => w.word).join(" "),
        words: slice,
      });
    }
  }

  const result: FullTranscript = {
    mediaHash,
    text: fullText,
    words: allWords,
    segments,
    duration: analysis.duration,
  };

  setCachedTranscript(mediaHash, result);
  onProgress?.("Complete", 100);
  return { transcript: result, analysis };
}

/**
 * Generate viral auto-clip candidates from transcript
 */
export async function generateAutoClips(
  transcript: FullTranscript,
  targetCount = 3,
  minDur = 15,
  maxDur = 60,
): Promise<ClipCandidate[]> {
  const res = await fetch("/api/groq/auto-clip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcriptText: transcript.text,
      duration: transcript.duration,
      targetCount,
      minDur,
      maxDur,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Auto-clip request failed" }));
    throw new Error(err.error || "Auto-clip failed");
  }

  const data = await res.json();
  const rawClips = data.clips || [];

  // Strictly validate boundaries against real transcript words
  const validatedClips: ClipCandidate[] = [];

  for (let idx = 0; idx < rawClips.length; idx++) {
    const c = rawClips[idx];
    let start = Math.max(0, Math.min(c.start || 0, transcript.duration - 5));
    let end = Math.min(transcript.duration, Math.max(start + minDur, c.end || start + minDur));

    // Snap to nearest real word boundaries
    if (transcript.words.length > 0) {
      const nearestStartWord = transcript.words.reduce((prev, curr) =>
        Math.abs(curr.start - start) < Math.abs(prev.start - start) ? curr : prev,
      );
      const nearestEndWord = transcript.words.reduce((prev, curr) =>
        Math.abs(curr.end - end) < Math.abs(prev.end - end) ? curr : prev,
      );

      if (nearestEndWord.end > nearestStartWord.start + 5) {
        start = nearestStartWord.start;
        end = nearestEndWord.end;
      }
    }

    validatedClips.push({
      id: `clip_${idx}_${Date.now()}`,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      duration: Number((end - start).toFixed(2)),
      title: c.title || `Viral Clip ${idx + 1}`,
      hook: c.hook || "Must watch moment",
      score: Math.min(100, Math.max(0, Math.round(c.score || 85))),
      reason: c.reason || "High energy hook with clear narrative arc.",
      topic: c.topic || "Highlights",
      subscores: {
        hook: c.subscores?.hook || 88,
        story: c.subscores?.story || 84,
        payoff: c.subscores?.payoff || 90,
        clarity: c.subscores?.clarity || 86,
        ending: c.subscores?.ending || 82,
      },
      selected: true,
    });
  }

  return validatedClips;
}
