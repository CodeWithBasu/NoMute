/* ==========================================================================
   NoMute - Main App Integration Controller & Visualizer Canvas Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const albumArt = document.getElementById('album-art');
    const trackIcon = document.getElementById('track-icon');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const trackListContainer = document.getElementById('track-list');
    const progressBarFill = document.getElementById('progress-fill');
    const currentTimeText = document.getElementById('current-time');
    const durationTimeText = document.getElementById('duration-time');
    const bassBoostToggle = document.getElementById('bass-boost-toggle');
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    // App State
    let isPlaying = false;
    let currentTrackIndex = 0;
    let progressTimer = null;
    let currentProgressSeconds = 0;
    let animFrameId = null;

    // Track Playlist Data
    const playlist = [
        {
            title: "Calm Ocean Waves",
            artist: "Deep Meditation • Relaxing Ambience",
            type: "waves",
            icon: "fa-water",
            duration: "3:45",
            durationSec: 225
        },
        {
            title: "Peaceful Zen Meditation",
            artist: "Chakra Harmony • Mindful Waves",
            type: "meditation",
            icon: "fa-om",
            duration: "4:12",
            durationSec: 252
        },
        {
            title: "Midnight Lofi Study Beats",
            artist: "Chill Hop • Focus Atmosphere",
            type: "lofi",
            icon: "fa-headphones",
            duration: "2:50",
            durationSec: 170
        },
        {
            title: "Neon Synthwave Pulse",
            artist: "Retro Wave • Electronic Vibes",
            type: "synth",
            icon: "fa-bolt",
            duration: "3:15",
            durationSec: 195
        }
    ];

    // Render Tracklist Sidebar Items
    function renderTracklist() {
        if (!trackListContainer) return;
        trackListContainer.innerHTML = '';

        playlist.forEach((track, idx) => {
            const item = document.createElement('div');
            item.className = `track-item ${idx === currentTrackIndex ? 'active' : ''}`;
            item.innerHTML = `
                <div class="track-item-icon">
                    <i class="fa-solid ${track.icon}"></i>
                </div>
                <div class="track-item-info">
                    <span class="track-item-title">${track.title}</span>
                    <span class="track-item-sub">${track.artist}</span>
                </div>
                <span class="track-item-sub">${track.duration}</span>
            `;

            item.addEventListener('click', () => {
                switchTrack(idx);
            });

            trackListContainer.appendChild(item);
        });
    }

    // Switch Selected Track
    function switchTrack(index) {
        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];

        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
        if (durationTimeText) durationTimeText.textContent = track.duration;
        if (trackIcon) trackIcon.className = `fa-solid ${track.icon} track-icon`;

        currentProgressSeconds = 0;
        updateProgressUI();
        renderTracklist();

        if (isPlaying) {
            window.audioEngine.play(track.type);
        }
    }

    // Toggle Play/Pause
    function togglePlay() {
        if (!isPlaying) {
            isPlaying = true;
            playIcon.className = 'fa-solid fa-pause';
            albumArt.classList.add('playing');
            window.audioEngine.play(playlist[currentTrackIndex].type);
            startProgressTimer();
            startVisualizer();
            
            if (window.volumeTrapManager) {
                window.volumeTrapManager.showToast("Audio playback started! Try lowering the volume... 😉");
            }
        } else {
            isPlaying = false;
            playIcon.className = 'fa-solid fa-play';
            albumArt.classList.remove('playing');
            window.audioEngine.pause();
            stopProgressTimer();
        }
    }

    // Progress Bar Logic
    function startProgressTimer() {
        stopProgressTimer();
        progressTimer = setInterval(() => {
            currentProgressSeconds++;
            const maxSec = playlist[currentTrackIndex].durationSec;
            if (currentProgressSeconds >= maxSec) {
                currentProgressSeconds = 0;
            }
            updateProgressUI();
        }, 1000);
    }

    function stopProgressTimer() {
        if (progressTimer) clearInterval(progressTimer);
    }

    function updateProgressUI() {
        const maxSec = playlist[currentTrackIndex].durationSec;
        const pct = (currentProgressSeconds / maxSec) * 100;
        if (progressBarFill) progressBarFill.style.width = `${pct}%`;

        const mins = Math.floor(currentProgressSeconds / 60);
        const secs = currentProgressSeconds % 60;
        if (currentTimeText) {
            currentTimeText.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }

    // Bass Boost Toggle
    if (bassBoostToggle) {
        bassBoostToggle.addEventListener('change', (e) => {
            window.audioEngine.setBassBoost(e.target.checked);
            if (window.volumeTrapManager) {
                window.volumeTrapManager.showToast(e.target.checked ? "Bass Boost ENABLED! 🔊" : "Standard Equalizer");
            }
        });
    }

    // Primary Control Buttons
    if (playBtn) playBtn.addEventListener('click', togglePlay);

    document.getElementById('next-btn')?.addEventListener('click', () => {
        const nextIdx = (currentTrackIndex + 1) % playlist.length;
        switchTrack(nextIdx);
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        switchTrack(prevIdx);
    });

    document.getElementById('shuffle-btn')?.addEventListener('click', () => {
        const randomIdx = Math.floor(Math.random() * playlist.length);
        switchTrack(randomIdx);
    });

    document.getElementById('repeat-btn')?.addEventListener('click', () => {
        currentProgressSeconds = 0;
        updateProgressUI();
        if (window.volumeTrapManager) {
            window.volumeTrapManager.showToast("Track restarted! 🔁");
        }
    });

    // Audio Visualizer Canvas Renderer Loop
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function startVisualizer() {
        function draw() {
            if (!isPlaying) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            animFrameId = requestAnimationFrame(draw);

            const freqData = window.audioEngine.getFrequencyData();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / freqData.length) * 1.5;
            let x = 0;

            for (let i = 0; i < freqData.length; i++) {
                const barHeight = (freqData[i] / 255) * canvas.height * 0.85;

                // Gradient for visualizer bars
                const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
                gradient.addColorStop(1, 'rgba(236, 72, 153, 1)');

                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);

                x += barWidth + 2;
            }
        }

        draw();
    }

    // Initialize App
    renderTracklist();
});
