import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchVoiceAudio } from "@/services/voiceAPI";
import { useAudioPlaybackQueue } from "@/hooks/useAudioPlaybackQueue";
import { API_BASE_URL } from "@/lib/api";

export type InterviewerVoiceStatus = "idle" | "loading" | "speaking" | "paused" | "error";

interface SpeakOptions {
  voiceId?: string;
  persona?: string;
  sessionId?: string | null;
  messageId?: string;
}

export const useInterviewerVoice = () => {
  const playback = useAudioPlaybackQueue();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  /** null = unknown (still probing), true = reachable, false = unreachable */
  const serverAvailable = useRef<boolean | null>(null);

  // Probe voice health once on mount — silent GET, no error in console
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/voice/health`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          serverAvailable.current = data?.data?.available === true;
        } else {
          serverAvailable.current = false;
        }
      } catch {
        serverAvailable.current = false;
      }
    })();
    return () => controller.abort();
  }, []);

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // If we already know the server is down, skip the network call entirely
    if (serverAvailable.current === false) {
      playback.enqueueBrowserSpeech(cleanText, options.persona);
      return;
    }

    setIsGenerating(true);
    setLastError(null);

    try {
      const audio = await fetchVoiceAudio({
        text: cleanText,
        voiceId: options.voiceId,
        persona: options.persona,
        sessionId: options.sessionId || undefined,
        messageId: options.messageId,
        format: "wav",
      });
      playback.enqueueAudioBlob(audio, options.persona);
    } catch (error) {
      // Mark server as down so subsequent calls skip the network request
      serverAvailable.current = false;
      setLastError(error instanceof Error ? error.message : "Voice generation failed");
      playback.enqueueBrowserSpeech(cleanText, options.persona);
    } finally {
      setIsGenerating(false);
    }
  }, [playback]);

  const stop = useCallback(() => {
    setIsGenerating(false);
    playback.stop();
  }, [playback]);

  const status: InterviewerVoiceStatus = useMemo(() => {
    if (isGenerating) return "loading";
    return playback.status;
  }, [isGenerating, playback.status]);

  return useMemo(() => ({
    status,
    lastError,
    currentLabel: playback.currentLabel,
    speak,
    stop,
    pause: playback.pause,
    resume: playback.resume,
  }), [
    status,
    lastError,
    playback.currentLabel,
    playback.pause,
    playback.resume,
    speak,
    stop,
  ]);
};
