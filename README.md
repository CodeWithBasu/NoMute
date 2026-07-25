# 🔊 NoMute - Inverted Volume Ambient Sound Web App (Next.js Edition)

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-61DAFB.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**NoMute** is a modern, high-end ambient sound web application built with **Next.js**, **React**, **Tailwind CSS**, and the **Web Audio API**. It comes with an interactive UX twist: **the volume control only knows one direction — UP!**

Disguised behind a sleek dark-mode glassmorphism interface, visitors are invited to listen to relaxing soundscapes. When they try to lower the volume or click mute, custom physics-driven slider hooks and Web Audio API gain nodes invert their input, boosting the sound level to 100%!

---

## ✨ Features

- ** Next.js & React Architecture**: Built with App Router, Client Components, and hooks for seamless state management.
- ** Tailwind CSS & Glassmorphism Design System**: Modern dark theme with glowing neon gradients, blurred panels, and micro-interactions.
- ** Inverted Volume Trap**:
  - Dragging volume down $\rightarrow$ turns volume **UP**.
  - Clicking Mute $\rightarrow$ Unmutes & sets volume to **MAX (100%)**.
  - Mouse wheel scrolling $\rightarrow$ Redirected to sound level boost.
  - Touch swipe gestures supported on mobile.
- ** Web Audio Spectrum Visualizer**: Real-time canvas spectrum visualizer powered by Web Audio API `AnalyserNode`.
- ** Procedural Audio Synthesizer**: Zero external asset dependencies — generates high quality ambient rain, meditation pads, lofi chords, and synthwave beats directly in the browser!

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Library**: React
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API (`AudioContext`, `GainNode`, `AnalyserNode`)
- **Canvas API**: Real-time canvas spectrum visualization

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
