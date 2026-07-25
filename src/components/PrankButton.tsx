"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export interface PrankButtonProps {
  onTriggerToast: (message: string) => void;
}

const PRANK_MESSAGES: string[] = [
  "Volume Down detected! Amplifying Web Audio gain to 500%! 🔊",
  "Laptop volume turned DOWN? Web Audio boosted to 1000%! 💥",
  "SILENCE DENIED! Sound level escalated to 1500%! 🔥",
  "Did you really think there was an off switch? 😎",
  "CAN YOU HEAR THE PEACEFUL VIBES NOW? 👂",
  "Overdriving Web Audio output to compensate! ⚡",
  "Volume Down key converted to SUPER-LOUD! 🌀"
];

export default function PrankButton({ onTriggerToast }: PrankButtonProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDisappeared, setIsDisappeared] = useState<boolean>(false);
  const lastToastTimeRef = useRef<number>(0);

  const triggerThrottledToast = (msg: string) => {
    const now = Date.now();
    if (now - lastToastTimeRef.current > 1500) {
      lastToastTimeRef.current = now;
      onTriggerToast(msg);
    }
  };

  useEffect(() => {
    // 1. Intercept Laptop Hardware Keys & Escalate Gain Node Output
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      const lowerKeys = [
        "AudioVolumeDown",
        "VolumeDown",
        "AudioVolumeMute",
        "VolumeMute",
        "ArrowDown",
        "PageDown"
      ];

      if (lowerKeys.includes(e.key) || e.code.includes("VolumeDown") || e.code.includes("Mute")) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (err) {}

        // Escalate Web Audio gain node exponentially to counter OS master volume drop!
        const newGainPct = audioEngine.escalateVolume(3.0);
        const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
        triggerThrottledToast(`${randomMsg} (${newGainPct}% Gain)`);
      }
    };

    // 2. Intercept Laptop Trackpad / Mouse Scroll Wheel
    const handleGlobalWheel = (e: globalThis.WheelEvent) => {
      if (!isPlaying) return;
      const newGainPct = audioEngine.escalateVolume(2.0);
      triggerThrottledToast(`Scroll detected! Web Audio gain boosted to ${newGainPct}%! 🌀`);
    };

    // 3. Intercept Touch Drag Down on Mobile
    let touchStartY = 0;
    const handleTouchStart = (e: globalThis.TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isPlaying) return;
      const touchCurrentY = e.touches[0].clientY;
      if (touchCurrentY - touchStartY > 10) {
        const newGainPct = audioEngine.escalateVolume(2.5);
        triggerThrottledToast(`Swipe down detected! Gain boosted to ${newGainPct}%! 📱`);
        touchStartY = touchCurrentY;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("wheel", handleGlobalWheel, true);
    window.addEventListener("touchstart", handleTouchStart, true);
    window.addEventListener("touchmove", handleTouchMove, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("wheel", handleGlobalWheel, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
    };
  }, [isPlaying, onTriggerToast]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    audioEngine.play("waves");
    audioEngine.escalateVolume(2.0);

    // Disappear the button immediately upon playing
    setIsDisappeared(true);

    onTriggerToast("Audio started! Web Audio Auto-Compensator is ACTIVE! 💥");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center z-20">
      {!isDisappeared ? (
        <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
          {/* Ambient Glow Aura */}
          <div className="absolute w-56 h-56 rounded-full bg-purple-500/20 blur-3xl animate-pulse pointer-events-none" />

          {/* Premium Shader Liquid Metal Button with "Click Me" label */}
          <div className="transform hover:scale-105 transition-all duration-300">
            <LiquidMetalButton label="Click Me" onClick={handlePlayClick} />
          </div>

          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 animate-pulse">
            Press to start audio experience
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-pulse">
            <Volume2 className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="font-extrabold text-2xl text-white">Exponential Volume Auto-Compensator Active</h2>
          <p className="text-sm text-pink-400 font-medium max-w-xs">
            Pressing Volume Down on your laptop boosts Web Audio gain up to 2500%! 😎
          </p>
        </div>
      )}
    </div>
  );
}
