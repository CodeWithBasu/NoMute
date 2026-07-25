"use client";

import React from "react";
import { Volume2 } from "lucide-react";

export interface ToastItem {
  id: number;
  message: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#121826]/95 backdrop-blur-xl border border-pink-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <Volume2 className="w-5 h-5 text-pink-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
