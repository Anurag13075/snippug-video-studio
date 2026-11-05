/**
 * Single source of truth for plan limits, features, and Groq model configuration.
 * All limits are enforced server-side.
 */

export interface PlanConfig {
  name: "free" | "pro";
  watermark: boolean;
  maxExportResolution: "1080p" | "4K";
  monthlyTranscriptionMinutes: number;
  maxVideoDurationSec: number;
  maxAutoClipRunsPerMonth: number;
  canTranslate: boolean;
  canEditTranscript: boolean;
  canRemoveFiller: boolean;
  canFaceFollow: boolean;
  hasBrandKit: boolean;
}

export const PLAN_LIMITS: Record<"free" | "pro", PlanConfig> = {
  free: {
    name: "free",
    watermark: true,
    maxExportResolution: "1080p",
    monthlyTranscriptionMinutes: 45,
    maxVideoDurationSec: 1800, // 30 minutes
    maxAutoClipRunsPerMonth: 5,
    canTranslate: false,
    canEditTranscript: true,
    canRemoveFiller: true,
    canFaceFollow: false,
    hasBrandKit: false,
  },
  pro: {
    name: "pro",
    watermark: false,
    maxExportResolution: "4K",
    monthlyTranscriptionMinutes: 600, // 10 hours
    maxVideoDurationSec: 7200, // 2 hours
    maxAutoClipRunsPerMonth: 100,
    canTranslate: true,
    canEditTranscript: true,
    canRemoveFiller: true,
    canFaceFollow: true,
    hasBrandKit: true,
  },
};

export const GROQ_CONFIG = {
  // Current supported Groq models
  whisperModel: "whisper-large-v3-turbo",
  llmModel: "llama-3.3-70b-versatile",
  fastLlmModel: "llama-3.1-8b-instant",
  // Groq & Vercel limits
  maxAudioChunkSizeBytes: 4 * 1024 * 1024, // 4 MB (strictly under Vercel serverless 4.5 MB request limit)
  maxAudioChunkDurationSec: 60, // 60s chunks ensure ~1.92MB WAV payload
  overlapDurationSec: 2, // 2-second overlap for boundary de-duplication
  requestsPerMinute: 30,
  timeoutMs: 45000,
  maxRetries: 3,
};
