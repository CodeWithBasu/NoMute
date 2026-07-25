"use client";

import React, { useState, useEffect, WheelEvent } from "react";
import { Play, Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";

export interface PrankButtonProps {
  onTriggerToast: (message: string) => void;
}

const PRANK_MESSAGES: string[] = [
  "Nice try! The pause button has fled the scene! 🚀",
  "SILENCE IS NOT PERMITTED ON THIS PLANET! 💥",
  "Volume locked at MAXIMUM DECIBELS! 🔥",
  "Did you really think there was an off switch? 😎",
  "CAN YOU HEAR THE PEACEFUL VIBES NOW? 👂",
  "Auto-boosting gain to 100%! ⚡",
  "Scrolling down turned volume UP! 🌀",
  "Nice try lowering the sound! 📱"
];

export default function PrankButton({ onTriggerToast }: PrankButtonProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDisappeared, setIsDisappeared] = useState<boolean>(false);

  useEffect(() => {
    // Intercept scroll wheel events across screen to boost volume
    const handleGlobalWheel = (e: globalThis.WheelEvent) => {
      if (!isPlaying) return;
      audioEngine.setVolume(100);
      const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
      onTriggerToast(randomMsg);
    };

    // Intercept touch drag down on screen for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: globalThis.TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isPlaying) return;
      const touchCurrentY = e.touches[0].clientY;
      if (touchCurrentY - touchStartY > 10) {
        audioEngine.setVolume(100);
        onTriggerToast("Swiping down boosted volume to 100%! 📱");
        touchStartY = touchCurrentY;
      }
    };

    window.addEventListener("wheel", handleGlobalWheel);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("wheel", handleGlobalWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isPlaying, onTriggerToast]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    audioEngine.play("waves");
    audioEngine.setVolume(100);

    // Disappear the button immediately upon playing
    setIsDisappeared(true);

    onTriggerToast("Audio started! The stop button has disappeared! 💥");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center z-20">
      {!isDisappeared ? (
        <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
          {/* Ambient Glow Aura */}
          <div className="absolute w-44 h-44 rounded-full bg-purple-500/30 blur-2xl animate-pulse pointer-events-none" />

          {/* Premium Glowing Play Button */}
          <button
            onClick={handlePlayClick}
            title="Press to Play Audio"
            className="relative w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-[0_15px_60px_rgba(139,92,246,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/30 group cursor-pointer"
          >
            <Play className="w-16 h-16 ml-2 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />
          </button>

          <span className="text-sm font-semibold tracking-wider uppercase text-gray-400 animate-pulse">
            Press to Start Audio
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-pulse">
            <Volume2 className="w-10 h-10" />
          </div>
          <h2 className="font-extrabold text-2xl text-white">Audio Locked at 100%</h2>
          <p className="text-sm text-pink-400 font-medium max-w-xs">
            The stop button has fled the screen. Try adjusting your volume... if you dare! 😎
          </p>
        </div>
      )}
    </div>
  );
}
