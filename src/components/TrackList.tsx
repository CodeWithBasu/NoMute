"use client";

import React, { ChangeEvent } from "react";
import { Sliders, LucideIcon } from "lucide-react";
import { audioEngine, TrackType } from "@/lib/audio-engine";

export interface Track {
  title: string;
  artist: string;
  type: TrackType;
  icon: LucideIcon;
  duration: string;
  durationSec: number;
}

export interface TrackListProps {
  playlist: Track[];
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
  isBassBoost: boolean;
  setIsBassBoost: (enabled: boolean) => void;
  onTriggerToast: (message: string) => void;
}

export default function TrackList({
  playlist,
  currentTrackIndex,
  onSelectTrack,
  isBassBoost,
  setIsBassBoost,
  onTriggerToast
}: TrackListProps) {
  const handleBassToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setIsBassBoost(enabled);
    audioEngine.setBassBoost(enabled);
    onTriggerToast(enabled ? "Bass Boost ENABLED! 🔊" : "Standard Equalizer Active");
  };

  return (
    <div className="bg-[#121826]/65 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col gap-6">
      <div>
        <h3 className="font-extrabold text-xl text-white flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Soundscape Library</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">Select your preferred relaxation audio</p>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {playlist.map((track, idx) => {
          const Icon = track.icon;
          const isActive = idx === currentTrackIndex;

          return (
            <div
              key={idx}
              onClick={() => onSelectTrack(idx)}
              className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-purple-500/15 border-purple-500/40 text-white"
                  : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-300 hover:translate-x-1"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                  isActive ? "bg-purple-500 text-white" : "bg-white/5 text-cyan-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{track.title}</span>
                <span className="text-[11px] text-gray-400">{track.artist}</span>
              </div>
              <span className="text-[11px] text-gray-500">{track.duration}</span>
            </div>
          );
        })}
      </div>

      {/* Bass Boost Equalizer Panel */}
      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Dynamic Bass Boost</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBassBoost}
              onChange={handleBassToggle}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>
        <span className="text-[11px] text-gray-400">Auto-Enhance Low Frequencies</span>
      </div>
    </div>
  );
}
