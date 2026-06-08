/**
 * VoiceWaveform — Canvas-based voice activity visualization.
 * Renders a dual-tone frequency bar display from a MediaStream.
 */
import { useRef, useEffect } from "react";

interface Props {
  audioStream: MediaStream | null;
  isActive: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const VoiceWaveform = ({
  audioStream,
  isActive,
  width = 200,
  height = 40,
  className = "",
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Draw idle state
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw idle bars
          const barCount = 32;
          const barWidth = canvas.width / barCount;
          for (let i = 0; i < barCount; i++) {
            const h = 2 + Math.sin(i * 0.4) * 2;
            const gradient = ctx.createLinearGradient(0, canvas.height / 2 - h, 0, canvas.height / 2 + h);
            gradient.addColorStop(0, "rgba(0, 229, 255, 0.2)");
            gradient.addColorStop(1, "rgba(139, 92, 246, 0.2)");
            ctx.fillStyle = gradient;
            ctx.fillRect(
              i * barWidth + 1,
              canvas.height / 2 - h,
              barWidth - 2,
              h * 2
            );
          }
        }
      }
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const draw = () => {
        if (!canvasRef.current) return;
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        const centerY = canvas.height / 2;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.4);

          const gradient = ctx.createLinearGradient(
            0, centerY - barHeight,
            0, centerY + barHeight
          );
          gradient.addColorStop(0, "#00E5FF");
          gradient.addColorStop(0.5, "#8B5CF6");
          gradient.addColorStop(1, "#00E5FF");

          ctx.fillStyle = gradient;

          // Draw mirrored bars (up + down from center)
          const x = i * barWidth;
          const w = barWidth - 1;
          ctx.fillRect(x, centerY - barHeight, w, barHeight); // top
          ctx.fillRect(x, centerY, w, barHeight); // bottom
        }
      };

      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        audioCtx.close();
      };
    } catch (e) {
      console.warn("VoiceWaveform: Audio API failed:", e);
    }
  }, [audioStream, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
    />
  );
};
