/**
 * Browser-only Audio Extraction, Silence Analysis & WAV Encoding
 * Uses Web Audio API (OfflineAudioContext).
 * Converts input video audio into 16 kHz Mono WAV chunks for Groq Whisper.
 */

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  rmsPeaks: number[]; // 0..1 normalized peaks (10 per second) for real waveform
  silenceRanges: Array<{ start: number; end: number; duration: number }>;
  audioBuffer: AudioBuffer;
}

export interface AudioChunk {
  index: number;
  startTime: number;
  endTime: number;
  blob: Blob;
}

/**
 * Decode audio from video File or Blob using Web Audio API
 */
export async function extractAudioFromBlob(videoBlob: Blob): Promise<AudioAnalysis> {
  const arrayBuffer = await videoBlob.arrayBuffer();
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();

  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    const duration = decoded.duration;
    const channelData = decoded.getChannelData(0); // Take first channel (mono)

    // Calculate RMS peaks (10 buckets per second)
    const samplesPerSec = decoded.sampleRate;
    const bucketSize = Math.floor(samplesPerSec / 10);
    const totalBuckets = Math.floor(channelData.length / bucketSize);
    const rmsPeaks: number[] = new Array(totalBuckets);

    for (let i = 0; i < totalBuckets; i++) {
      let sumSq = 0;
      const start = i * bucketSize;
      const end = start + bucketSize;
      for (let j = start; j < end; j++) {
        sumSq += channelData[j] * channelData[j];
      }
      const rms = Math.sqrt(sumSq / bucketSize);
      rmsPeaks[i] = Math.min(1, rms * 4.5); // normalized for visual display
    }

    // Detect silence ranges (RMS < 0.02 for > 0.4 seconds)
    const silenceRanges: Array<{ start: number; end: number; duration: number }> = [];
    let inSilence = false;
    let silenceStart = 0;

    for (let i = 0; i < totalBuckets; i++) {
      const time = i / 10;
      const isQuiet = rmsPeaks[i] < 0.05;

      if (isQuiet && !inSilence) {
        inSilence = true;
        silenceStart = time;
      } else if (!isQuiet && inSilence) {
        inSilence = false;
        const dur = time - silenceStart;
        if (dur >= 0.5) {
          silenceRanges.push({ start: silenceStart, end: time, duration: dur });
        }
      }
    }

    if (inSilence) {
      const dur = duration - silenceStart;
      if (dur >= 0.5) {
        silenceRanges.push({ start: silenceStart, end: duration, duration: dur });
      }
    }

    return {
      duration,
      sampleRate: decoded.sampleRate,
      rmsPeaks,
      silenceRanges,
      audioBuffer: decoded,
    };
  } finally {
    void ctx.close();
  }
}

/**
 * Resample an AudioBuffer to 16 kHz Mono and slice into WAV chunks
 */
export async function createWavChunks(
  audioBuffer: AudioBuffer,
  maxChunkDurationSec = 60, // 60 seconds (~1.92MB WAV) strictly under Vercel's 4.5MB request limit
  overlapSec = 2,
): Promise<AudioChunk[]> {
  const targetSampleRate = 16000;
  const totalDuration = audioBuffer.duration;
  const chunks: AudioChunk[] = [];

  let curStart = 0;
  let chunkIndex = 0;

  while (curStart < totalDuration) {
    const curEnd = Math.min(totalDuration, curStart + maxChunkDurationSec);
    const chunkDur = curEnd - curStart;

    // Render 16kHz mono using OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(chunkDur * targetSampleRate), targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0, curStart, chunkDur);

    const resampled = await offlineCtx.startRendering();
    const pcmData = resampled.getChannelData(0);
    const wavBlob = encodeWav(pcmData, targetSampleRate);

    chunks.push({
      index: chunkIndex,
      startTime: curStart,
      endTime: curEnd,
      blob: wavBlob,
    });

    if (curEnd >= totalDuration) break;
    curStart = curEnd - overlapSec;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Encode raw float32 PCM samples into standard 16-bit PCM WAV Blob
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sampleRate * 2) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
