/* ==========================================================================
   NoMute - Inverted Volume Control & Interactive Trap Physics
   ========================================================================== */

class VolumeTrapManager {
    constructor() {
        this.slider = document.getElementById('volume-slider');
        this.sliderFill = document.getElementById('slider-fill');
        this.volumeText = document.getElementById('volume-text');
        this.volumePanel = document.getElementById('volume-panel');
        this.muteBtn = document.getElementById('mute-btn');
        this.maxBtn = document.getElementById('max-btn');
        this.toastContainer = document.getElementById('toast-container');
        
        this.previousValue = parseInt(this.slider.value, 10) || 35;
        this.prankMessages = [
            "Did you mean 100% Volume? We got you! 🔊",
            "LOUDER IS BETTER! 🚀",
            "Volume set to MAXIMUM DECIBELS! 💥",
            "Mute button is currently BOOSTING sound! 😎",
            "Nice try! Turning volume UP instead! 🔥",
            "CAN YOU HEAR THE PEACEFUL VIBES NOW? 👂",
            "Lowering volume is physically impossible here 🪐",
            "Auto-amplifying sound for maximum clarity! ⚡"
        ];

        this.initListeners();
    }

    initListeners() {
        if (!this.slider) return;

        // 1. Intercept Range Input (Slider Drag / Keyboard arrows)
        this.slider.addEventListener('input', (e) => this.handleSliderInput(e));
        this.slider.addEventListener('change', (e) => this.handleSliderInput(e));

        // 2. Intercept Mute Button Click
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.handleMuteTrap());
        }

        // 3. Max Volume Button Click
        if (this.maxBtn) {
            this.maxBtn.addEventListener('click', () => this.handleMaxBoost());
        }

        // 4. Intercept Mouse Wheel Scroll over Volume Panel
        if (this.volumePanel) {
            this.volumePanel.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.forceVolumeUp(15, "Scroll action redirected to LOUDER! 🌀");
            }, { passive: false });
        }

        // 5. Intercept Touch Drag Gestures for Mobile
        let touchStartY = 0;
        this.slider.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.slider.addEventListener('touchmove', (e) => {
            const touchCurrentY = e.touches[0].clientY;
            const deltaY = touchCurrentY - touchStartY; // Swiping down yields positive deltaY
            
            if (deltaY > 5) {
                // Swiping DOWN to decrease volume -> FORCE UP!
                this.forceVolumeUp(20, "Swiping DOWN turned volume UP! 📱");
                touchStartY = touchCurrentY;
            }
        }, { passive: true });
    }

    handleSliderInput(e) {
        const currentValue = parseInt(this.slider.value, 10);
        let targetValue = currentValue;

        if (currentValue < this.previousValue) {
            // User tried to TURN DOWN the volume!
            // Reverse the delta and add extra boost!
            const attemptedDecrease = this.previousValue - currentValue;
            targetValue = Math.min(100, this.previousValue + attemptedDecrease * 2 + 10);
            
            this.triggerPanelTrapAnimation();
            this.showToast(this.getRandomMessage());
        } else if (currentValue > this.previousValue) {
            // User tried to TURN UP the volume!
            // Boost directly to 100%!
            targetValue = Math.min(100, currentValue + 25);
            if (targetValue >= 100) targetValue = 100;
            
            this.showToast("Accelerating to MAX VOLUME! ⚡");
        }

        this.updateVolumeState(targetValue);
    }

    handleMuteTrap() {
        // Mute button click handler -> Instantly sets volume to 100% & triggers toast
        this.updateVolumeState(100);
        this.triggerPanelTrapAnimation();
        this.showToast("MUTE DENIED: Volume boosted to 100%! 🚨");
    }

    handleMaxBoost() {
        this.updateVolumeState(100);
        this.triggerPanelTrapAnimation();
        this.showToast("FULL POWER ENGAGED! ⚡");
    }

    forceVolumeUp(amount = 15, customToastMessage = null) {
        const currentVal = parseInt(this.slider.value, 10);
        const nextVal = Math.min(100, currentVal + amount);
        
        this.updateVolumeState(nextVal);
        this.triggerPanelTrapAnimation();
        this.showToast(customToastMessage || this.getRandomMessage());
    }

    updateVolumeState(val) {
        const clamped = Math.max(0, Math.min(100, val));
        this.slider.value = clamped;
        this.previousValue = clamped;

        // Update Slider UI Visual Fill
        if (this.sliderFill) {
            this.sliderFill.style.width = `${clamped}%`;
        }

        // Update Text Badge
        if (this.volumeText) {
            this.volumeText.textContent = `${clamped}%`;
        }

        // Pass to Web Audio Engine
        if (window.audioEngine) {
            window.audioEngine.setVolume(clamped);
        }
    }

    triggerPanelTrapAnimation() {
        if (!this.volumePanel) return;
        this.volumePanel.classList.remove('trapped');
        // Force reflow
        void this.volumePanel.offsetWidth;
        this.volumePanel.classList.add('trapped');
    }

    getRandomMessage() {
        const idx = Math.floor(Math.random() * this.prankMessages.length);
        return this.prankMessages[idx];
    }

    showToast(message) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span>${message}</span>`;

        this.toastContainer.appendChild(toast);

        // Auto remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2800);
    }
}

// Instantiate Volume Trap Logic
document.addEventListener('DOMContentLoaded', () => {
    window.volumeTrapManager = new VolumeTrapManager();
});
