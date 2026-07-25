"use client";

import { useState, useEffect } from "react";
import { Disc, Waves, Sparkles, Heart, Radio } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import TrackList from "@/components/TrackList";
import ToastContainer from "@/components/ToastContainer";
import { audioEngine } from "@/lib/audio-engine";

const PLAYLIST = [
  {
    title: "Calm Ocean Waves",
    artist: "Deep Meditation • Relaxing Ambience",
    type: "waves",
    icon: Waves,
    duration: "3:45",
    durationSec: 225
  },
  {
    title: "Peaceful Zen Meditation",
    artist: "Chakra Harmony • Mindful Waves",
    type: "meditation",
    icon: Radio,
    duration: "4:12",
    durationSec: 252
  },
  {
    title: "Midnight Lofi Study Beats",
    artist: "Chill Hop • Focus Atmosphere",
    type: "lofi",
    icon: Sparkles,
    duration: "2:50",
    durationSec: 170
  },
  {
    title: "Neon Synthwave Pulse",
    artist: "Retro Wave • Electronic Vibes",
    type: "synth",
    icon: Disc,
    duration: "3:15",
    durationSec: 195
  }
];

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isBassBoost, setIsBassBoost] = useState(true);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [toasts, setToasts] = useState([]);

  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev >= currentTrack.durationSec) return 0;
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const triggerToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      audioEngine.play(currentTrack.type);
      triggerToast("Audio playback started! Try lowering the volume... 😉");
    } else {
      setIsPlaying(false);
      audioEngine.pause();
    }
  };

  const handleSelectTrack = (index) => {
    setCurrentTrackIndex(index);
    setProgressSeconds(0);
    if (isPlaying) {
      audioEngine.play(PLAYLIST[index].type);
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    handleSelectTrack(nextIdx);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    handleSelectTrack(prevIdx);
  };

  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * PLAYLIST.length);
    handleSelectTrack(randomIdx);
  };

  const handleRepeat = () => {
    setProgressSeconds(0);
    triggerToast("Track restarted! 🔁");
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Glowing Background Orbs */}
      <div className="fixed -top-20 -left-20 w-[450px] h-[450px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none animate-float-orb" />
      <div className="fixed -bottom-20 -right-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-float-orb delay-1000" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/20 rounded-full blur-[120px] pointer-events-none animate-float-orb delay-500" />

      {/* Prank Toast Notifications */}
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-[1100px] flex flex-col gap-6 z-10 my-6">
        {/* Navbar */}
        <header className="flex justify-between items-center px-6 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3">
            <Disc className="w-7 h-7 text-purple-400 animate-spin" />
            <span className="font-extrabold text-2xl tracking-tight">
              NoMute<span className="text-cyan-400">.io</span>
            </span>
          </div>
          <div className="flex gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE AUDIO
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> NEXT.JS EDITION
            </span>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
          <PlayerCard
            track={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrevTrack={handlePrevTrack}
            onNextTrack={handleNextTrack}
            onShuffleTrack={handleShuffle}
            onRepeatTrack={handleRepeat}
            onTriggerToast={triggerToast}
            progressSeconds={progressSeconds}
            durationSeconds={currentTrack.durationSec}
          />

          <TrackList
            playlist={PLAYLIST}
            currentTrackIndex={currentTrackIndex}
            onSelectTrack={handleSelectTrack}
            isBassBoost={isBassBoost}
            setIsBassBoost={setIsBassBoost}
            onTriggerToast={triggerToast}
          />
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 py-2">
          <p className="flex items-center justify-center gap-1">
            Built with Next.js, React, Tailwind CSS & <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> |{" "}
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
    </div>
  );
}
