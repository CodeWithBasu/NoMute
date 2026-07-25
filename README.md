# 🔊 NoMute - The Inverted Volume Ambient Sound Experience

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Aesthetic: Glassmorphism](https://img.shields.io/badge/Design-Glassmorphism-purple.svg)]()

**NoMute** is a deceptively sleek, high-end ambient sound web application with an interactive UX twist: **the volume control only knows one direction — UP!**

Disguised behind a ultra-modern dark mode glassmorphic UI, visitors are invited to listen to relaxing soundscapes. When they try to lower the volume or mute the track, custom physics-driven slider mechanics and Web Audio API gain nodes invert their input, boosting the sound level to maximum decibels!

---

## ✨ Features

- ** Sleek Glassmorphism Interface**: Dark theme with ambient neon glows, floating blurred panels, and smooth micro-interactions.
- ** Inverted Volume Trap**:
  - Dragging volume down $\rightarrow$ turns volume **UP**.
  - Clicking Mute $\rightarrow$ Unmutes & sets volume to **MAX**.
  - Mouse wheel scrolling $\rightarrow$ Boosts sound level.
  - Physical slider spring physics snapping back to 100%.
- ** Audio Visualizer**: Real-time canvas spectrum visualizer powered by Web Audio API `AnalyserNode`.
- ** Sound Library**: Built-in royalty-free soundscapes + procedural Web Audio synth fallback generator so it plays sound seamlessly anywhere without external asset dependencies.
- ** Responsive & Mobile Ready**: Full touch gesture support for mobile devices.

---

## 🚀 Quick Start

Simply open `index.html` in any modern web browser or host it via GitHub Pages!

```bash
# Clone the repository
git clone https://github.com/CodeWithBasu/NoMute.git

# Navigate into the project
cd NoMute

# Open index.html in browser
```

---

## 🛠️ Built With

- **HTML5 & CSS3** (Custom design system, CSS grid, variables, keyframes)
- **Vanilla JavaScript ES6+**
- **Web Audio API** (`AudioContext`, `GainNode`, `AnalyserNode`)
- **Canvas API** for dynamic visualizer graphics

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
