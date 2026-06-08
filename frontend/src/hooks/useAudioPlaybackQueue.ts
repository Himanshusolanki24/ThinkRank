import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type QueueItem =
  | { id: string; kind: "audio"; blob: Blob; label?: string }
  | { id: string; kind: "speech"; text: string; label?: string };

export type AudioPlaybackStatus = "idle" | "speaking" | "paused" | "error";

const stripMarkdownForSpeech = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const useAudioPlaybackQueue = () => {
  const [status, setStatus] = useState<AudioPlaybackStatus>("idle");
  const [currentLabel, setCurrentLabel] = useState<string | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanupCurrent = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (utteranceRef.current) {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
  }, []);

  const processNextRef = useRef<() => void>(() => {});

  const finishCurrent = useCallback(() => {
    cleanupCurrent();
    isProcessingRef.current = false;
    setCurrentLabel(null);
    processNextRef.current();
  }, [cleanupCurrent]);

  const playAudio = useCallback((item: Extract<QueueItem, { kind: "audio" }>) => {
    const url = URL.createObjectURL(item.blob);
    objectUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;
    setStatus("speaking");
    setCurrentLabel(item.label || null);

    audio.onended = finishCurrent;
    audio.onerror = () => {
      setStatus("error");
      finishCurrent();
    };

    audio.play().catch(() => {
      setStatus("error");
      finishCurrent();
    });
  }, [finishCurrent]);

  const playSpeech = useCallback((item: Extract<QueueItem, { kind: "speech" }>) => {
    const cleanText = stripMarkdownForSpeech(item.text);
    if (!cleanText || !("speechSynthesis" in window)) {
      finishCurrent();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.volume = 1;
    utteranceRef.current = utterance;
    setStatus("speaking");
    setCurrentLabel(item.label || null);

    utterance.onend = finishCurrent;
    utterance.onerror = () => {
      setStatus("error");
      finishCurrent();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [finishCurrent]);

  const processNext = useCallback(() => {
    if (isProcessingRef.current) return;

    const next = queueRef.current.shift();
    if (!next) {
      setStatus("idle");
      setCurrentLabel(null);
      return;
    }

    isProcessingRef.current = true;
    if (next.kind === "audio") playAudio(next);
    else playSpeech(next);
  }, [playAudio, playSpeech]);

  useEffect(() => {
    processNextRef.current = processNext;
  }, [processNext]);

  const enqueueAudioBlob = useCallback((blob: Blob, label?: string) => {
    queueRef.current.push({
      id: crypto.randomUUID(),
      kind: "audio",
      blob,
      label,
    });
    processNextRef.current();
  }, []);

  const enqueueBrowserSpeech = useCallback((text: string, label?: string) => {
    queueRef.current.push({
      id: crypto.randomUUID(),
      kind: "speech",
      text,
      label,
    });
    processNextRef.current();
  }, []);

  const stop = useCallback(() => {
    queueRef.current = [];
    cleanupCurrent();
    isProcessingRef.current = false;
    setStatus("idle");
    setCurrentLabel(null);
  }, [cleanupCurrent]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setStatus("paused");
      return;
    }
    if (utteranceRef.current && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => setStatus("speaking")).catch(() => setStatus("error"));
      return;
    }
    if (utteranceRef.current && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setStatus("speaking");
    }
  }, []);

  useEffect(() => stop, [stop]);

  return useMemo(() => ({
    status,
    currentLabel,
    enqueueAudioBlob,
    enqueueBrowserSpeech,
    stop,
    pause,
    resume,
  }), [
    status,
    currentLabel,
    enqueueAudioBlob,
    enqueueBrowserSpeech,
    stop,
    pause,
    resume,
  ]);
};
