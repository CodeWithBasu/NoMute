"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";
import VolumePanel from "./VolumePanel";
import { Track } from "./TrackList";

export interface PlayerCardProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onShuffleTrack: () => void;
  onRepeatTrack: () => void;
  onTriggerToast: (message: string) => void;
  progressSeconds: number;
  durationSeconds: number;
}

export default function PlayerCard({
  track,
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onShuffleTrack,
  onRepeatTrack,
  onTriggerToast,
  progressSeconds,
  durationSeconds
}: PlayerCardProps) {
  const Icon = track.icon;
  const progressPct = durationSeconds > 0 ? (progressSeconds / durationSeconds) * 100 : 0;

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-[#121826]/65 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
      {/* Visualizer Canvas */}
      <AudioVisualizer isPlaying={isPlaying} />

      {/* Track Info */}
      <div className="flex items-center gap-5">
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-all duration-300 ${
            isPlaying ? "scale-105 shadow-[0_15px_35px_rgba(236,72,153,0.5)] animate-pulse" : ""
          }`}
        >
          <Icon className="w-9 h-9 text-white" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-extrabold text-2xl text-white">{track.title}</h2>
          <p className="text-sm text-gray-400">{track.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3.5">
        <span className="text-xs font-semibold text-gray-400 min-w-[35px]">
          {formatTime(progressSeconds)}
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-400 min-w-[35px]">
          {track.duration}
        </span>
      </div>

      {/* Primary Player Controls */}
      <div className="flex justify-center items-center gap-4 py-1">
        <button
          onClick={onShuffleTrack}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        <button
          onClick={onPrevTrack}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(139,92,246,0.5)] hover:scale-108 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
        </button>

        <button
          onClick={onNextTrack}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <button
          onClick={onRepeatTrack}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Inverted Volume Control Panel */}
      <VolumePanel onTriggerToast={onTriggerToast} />
    </div>
  );
}
