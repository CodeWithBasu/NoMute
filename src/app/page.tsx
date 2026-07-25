"use client";

import React, { useState, useEffect } from "react";
import { Disc, Heart } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import ToastContainer, { ToastItem } from "@/components/ToastContainer";
import { audioEngine } from "@/lib/audio-engine";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const durationSec = 225; // 3:45

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev >= durationSec) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const triggerToast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      audioEngine.play("waves");
      triggerToast("Audio playback started! Try lowering the volume... 😉");
    } else {
      setIsPlaying(false);
      audioEngine.pause();
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Glowing Ambient Orbs */}
      <div className="fixed -top-28 -left-28 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-float-orb" />
      <div className="fixed -bottom-28 -right-28 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-float-orb delay-1000" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[140px] pointer-events-none animate-float-orb delay-500" />

      {/* Dynamic Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Header Logo Only (No Badges) */}
      <header className="w-full max-w-md flex justify-center items-center py-4 z-10">
        <div className="flex items-center gap-3">
          <Disc className="w-7 h-7 text-purple-400 animate-spin" />
          <span className="font-extrabold text-2xl tracking-tight">
            NoMute<span className="text-cyan-400">.io</span>
          </span>
        </div>
      </header>

      {/* Main Single Centered Premium Player */}
      <main className="w-full max-w-md my-auto z-10">
        <PlayerCard
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onTriggerToast={triggerToast}
          progressSeconds={progressSeconds}
          durationSeconds={durationSec}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-md text-center text-xs text-gray-500 py-3 z-10">
        <p className="flex items-center justify-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> |{" "}
          <a
            href="https://github.com/CodeWithBasu/NoMute"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-400 hover:text-purple-400 transition-colors"
          >
            GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}
