"use client";

import React, { useState, useRef, ChangeEvent, WheelEvent, TouchEvent } from "react";
import { Volume2, VolumeX, Zap, ShieldCheck } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";

const PRANK_MESSAGES: string[] = [
  "Did you mean 100% Volume? We got you! 🔊",
  "LOUDER IS BETTER! 🚀",
  "Volume set to MAXIMUM DECIBELS! 💥",
  "Mute button is currently BOOSTING sound! 😎",
  "Nice try! Turning volume UP instead! 🔥",
  "CAN YOU HEAR THE PEACEFUL VIBES NOW? 👂",
  "Lowering volume is physically impossible here 🪐",
  "Auto-amplifying sound for maximum clarity! ⚡"
];

export interface VolumePanelProps {
  onTriggerToast: (message: string) => void;
}

export default function VolumePanel({ onTriggerToast }: VolumePanelProps) {
  const [volume, setVolume] = useState<number>(35);
  const [isTrapped, setIsTrapped] = useState<boolean>(false);
  const prevValRef = useRef<number>(35);
  const touchStartYRef = useRef<number>(0);

  const updateVolume = (val: number, message: string | null = null) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolume(clamped);
    prevValRef.current = clamped;
    audioEngine.setVolume(clamped);

    setIsTrapped(true);
    setTimeout(() => setIsTrapped(false), 400);

    if (message) {
      onTriggerToast(message);
    }
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentVal = parseInt(e.target.value, 10);
    const prevVal = prevValRef.current;

    if (currentVal < prevVal) {
      const attemptedDecrease = prevVal - currentVal;
      const targetVal = Math.min(100, prevVal + attemptedDecrease * 2 + 15);
      const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
      updateVolume(targetVal, randomMsg);
    } else {
      const targetVal = Math.min(100, currentVal + 25);
      updateVolume(targetVal, "Accelerating to MAX VOLUME! ⚡");
    }
  };

  const handleMuteClick = () => {
    updateVolume(100, "MUTE DENIED: Volume boosted to 100%! 🚨");
  };

  const handleMaxClick = () => {
    updateVolume(100, "FULL POWER ENGAGED! ⚡");
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const nextVal = Math.min(100, volume + 15);
    const randomMsg = PRANK_MESSAGES[Math.floor(Math.random() * PRANK_MESSAGES.length)];
    updateVolume(nextVal, "Scroll action redirected to LOUDER! 🌀");
  };

  const handleTouchStart = (e: TouchEvent<HTMLInputElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent<HTMLInputElement>) => {
    const touchCurrentY = e.touches[0].clientY;
    const deltaY = touchCurrentY - touchStartYRef.current;
    if (deltaY > 5) {
      const nextVal = Math.min(100, volume + 20);
      updateVolume(nextVal, "Swiping DOWN turned volume UP! 📱");
      touchStartYRef.current = touchCurrentY;
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className={`p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3.5 transition-all duration-300 ${
        isTrapped ? "animate-shake border-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.3)]" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span>Volume Control</span>
        </div>
        <div className="bg-purple-500/20 text-purple-300 font-extrabold text-xs px-3 py-1 rounded-xl border border-purple-500/30">
          <span>{volume}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button
          onClick={handleMuteClick}
          title="Mute Audio"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-gray-400 flex items-center justify-center transition-all"
        >
          <VolumeX className="w-4 h-4" />
        </button>

        <div className="flex-1 relative h-2.5 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleSliderChange}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-purple-500"
          />
          <div
            className="absolute left-0 top-0.5 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg pointer-events-none"
            style={{ width: `${volume}%` }}
          />
        </div>

        <button
          onClick={handleMaxClick}
          title="Max Volume"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 text-gray-400 flex items-center justify-center transition-all"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Precise Gain Equalizer Active</span>
      </div>
    </div>
  );
}
