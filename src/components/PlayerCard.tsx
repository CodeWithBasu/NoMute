"use client";

import React, { useState, useRef, ChangeEvent, WheelEvent, TouchEvent } from "react";
import { Play, Pause, Waves, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";

export interface PlayerCardProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTriggerToast: (message: string) => void;
  progressSeconds: number;
  durationSeconds: number;
}

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

export default function PlayerCard({
  isPlaying,
  onTogglePlay,
  onTriggerToast,
  progressSeconds,
  durationSeconds
}: PlayerCardProps) {
  const [volume, setVolume] = useState<number>(35);
  const [isTrapped, setIsTrapped] = useState<boolean>(false);
  const prevValRef = useRef<number>(35);
  const touchStartYRef = useRef<number>(0);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPct = durationSeconds > 0 ? (progressSeconds / durationSeconds) * 100 : 0;

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
      className={`bg-[#121826]/75 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center gap-8 relative overflow-hidden transition-all duration-300 ${
        isTrapped ? "animate-shake border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.3)]" : ""
      }`}
    >
      {/* Background Ambient Aura */}
      <div
        className={`absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isPlaying ? "scale-150 bg-pink-500/30" : ""
        }`}
      />

      {/* Album Artwork Display */}
      <div className="flex flex-col items-center gap-4 text-center z-10">
        <div
          className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-xl transition-all duration-500 ${
            isPlaying ? "scale-105 shadow-[0_15px_40px_rgba(236,72,153,0.5)] animate-pulse" : "hover:scale-102"
          }`}
        >
          <Waves className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-white tracking-tight">Calm Ocean Waves</h2>
          <p className="text-sm text-gray-400 mt-1">Deep Meditation • Relaxing Ambience</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex items-center gap-3.5 z-10">
        <span className="text-xs font-medium text-gray-400 min-w-[32px] text-right">
          {formatTime(progressSeconds)}
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-400 min-w-[32px]">
          {formatTime(durationSeconds)}
        </span>
      </div>

      {/* Premium Centered Play/Pause Button */}
      <div className="relative flex items-center justify-center z-10 my-2">
        {isPlaying && (
          <div className="absolute w-24 h-24 rounded-full bg-purple-500/20 animate-ping pointer-events-none" />
        )}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? "Pause Sound" : "Play Sound"}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-[0_12px_40px_rgba(139,92,246,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 group"
        >
          {isPlaying ? (
            <Pause className="w-9 h-9 transition-transform group-hover:scale-105" />
          ) : (
            <Play className="w-9 h-9 ml-1 transition-transform group-hover:scale-105" />
          )}
        </button>
      </div>

      {/* Sleek Minimal Volume Control Bar */}
      <div className="w-full flex items-center gap-3 pt-2 border-t border-white/5 z-10">
        <button
          onClick={handleMuteClick}
          title="Mute Audio"
          className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <VolumeX className="w-4 h-4" />
        </button>

        <div className="flex-1 relative h-2 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleSliderChange}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-purple-500"
          />
          <div
            className="absolute left-0 top-0.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg pointer-events-none"
            style={{ width: `${volume}%` }}
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
          <span>{volume}%</span>
        </div>
      </div>
    </div>
  );
}
