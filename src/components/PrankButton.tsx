"use client";

import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export interface PrankButtonProps {
  onTriggerToast: (message: string) => void;
}

const PRANK_MESSAGES: string[] = [
  "Laptop Volume Down intercepted! Boosting gain to 250%! 🔊",
  "Hardware mute disabled! SILENCE IS NOT PERMITTED! 💥",
  "Nice try! Volume locked at MAXIMUM DECIBELS! 🔥",
  "Did you really think there was an off switch? 😎",
  "CAN YOU HEAR THE PEACEFUL VIBES NOW? 👂",
  "Auto-overdriving Web Audio gain to 100%! ⚡",
  "Keyboard Volume Down redirected to LOUDER! 🌀",
  "Hardware volume key counter-boosted! 💻"
];

export default function PrankButton({ onTriggerToast }: PrankButtonProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDisappeared, setIsDisappeared] = useState<boolean>(false);

  useEffect(() => {
    // 1. Intercept Laptop Keyboard Hardware Volume Keys (VolumeDown, Mute, ArrowDown, PageDown)
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

        audioEngine.setVolume(100);
        const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
        onTriggerToast(randomMsg);
      }
    };

    // 2. Intercept Laptop Trackpad / Mouse Scroll Wheel
    const handleGlobalWheel = (e: globalThis.WheelEvent) => {
      if (!isPlaying) return;
      audioEngine.setVolume(100);
      const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
      onTriggerToast(randomMsg);
    };

    // 3. Intercept Touch Drag Down on Screen
    let touchStartY = 0;
    const handleTouchStart = (e: globalThis.TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isPlaying) return;
      const touchCurrentY = e.touches[0].clientY;
      if (touchCurrentY - touchStartY > 10) {
        audioEngine.setVolume(100);
        onTriggerToast("Touch gesture boosted volume to 100%! 📱");
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
    audioEngine.setVolume(100);

    // Disappear the button immediately upon playing
    setIsDisappeared(true);

    onTriggerToast("Audio started! Hardware volume guard is ACTIVE! 💥");
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
            <Volume2 className="w-10 h-10" />
          </div>
          <h2 className="font-extrabold text-2xl text-white">Audio Overdrive Locked at 250%</h2>
          <p className="text-sm text-pink-400 font-medium max-w-xs">
            Laptop volume keys are intercepted & gain is locked at maximum! 😎
          </p>
        </div>
      )}
    </div>
  );
}
