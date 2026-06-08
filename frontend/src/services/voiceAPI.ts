import { API_BASE_URL } from "@/lib/api";

const BASE = `${API_BASE_URL}/api/voice`;

/** How long to skip server TTS calls after a failure (ms) */
const BACKOFF_DURATION_MS = 60_000;

/** Tracks when the server was last known to be unavailable */
let _serverDownSince: number | null = null;

export interface VoiceInfo {
  id: string;
  persona: string;
  displayName: string;
  provider: "chatterbox";
  description?: string;
  settings?: Record<string, unknown>;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
  persona?: string;
  sessionId?: string;
  messageId?: string;
  format?: "wav";
  stream?: boolean;
}

/**
 * Returns true if the TTS server is known to be down and the backoff period
 * hasn't expired yet. When true the caller should skip the network request
 * and fall back to browser speech directly.
 */
export function isServerTTSDown(): boolean {
  if (_serverDownSince === null) return false;
  if (Date.now() - _serverDownSince > BACKOFF_DURATION_MS) {
    // Backoff expired — allow the next attempt to retry
    _serverDownSince = null;
    return false;
  }
  return true;
}

export async function fetchVoiceAudio(payload: TTSRequest): Promise<Blob> {
  // Skip the network call entirely if we recently learned the server is down
  if (isServerTTSDown()) {
    throw new Error("TTS server unavailable (cached)");
  }

  const response = await fetch(`${BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    // 502 or 503 with fallback hint → mark server as down so we stop retrying
    if (response.status === 502 || response.status === 503) {
      _serverDownSince = Date.now();
      console.warn(
        `[voiceAPI] TTS server unavailable (${response.status}), switching to browser speech for ${BACKOFF_DURATION_MS / 1000}s`
      );
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.error || "Voice generation failed");
    }
    throw new Error("Voice generation failed");
  }

  return response.blob();
}

export async function fetchVoices(): Promise<VoiceInfo[]> {
  const response = await fetch(`${BASE}/voices`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Failed to load voices");
  return data.data.voices;
}
