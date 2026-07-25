"use client";

import { useEffect, useRef } from "react";
import { audioEngine } from "@/lib/audio-engine";

export default function AudioVisualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animFrameIdRef.current = requestAnimationFrame(draw);

      const freqData = audioEngine.getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (freqData.length || 32)) * 1.5;
      let x = 0;

      for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * canvas.height * 0.85;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
        gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.8)");
        gradient.addColorStop(1, "rgba(236, 72, 153, 1)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);

        x += barWidth + 2;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-[110px] bg-black/40 rounded-xl border border-white/10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2.5 left-3.5">
        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
          LIVE SPECTRUM
        </span>
      </div>
    </div>
  );
}
