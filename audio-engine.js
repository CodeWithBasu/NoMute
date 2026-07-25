/* ==========================================================================
   NoMute - Web Audio API Engine & Procedural Sound Synthesizer
   ========================================================================== */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.analyser = null;
        this.bassFilter = null;
        this.isPlaying = false;
        this.currentGainValue = 0.35; // Default initial volume (35%)
        
        // Procedural Synth Nodes
        this.oscillatorGroup = [];
        this.noiseNode = null;
        this.activeTrackType = 'waves';
        
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        // Create Master Gain Node
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.currentGainValue, this.ctx.currentTime);

        // Create Bass Boost Biquad Filter
        this.bassFilter = this.ctx.createBiquadFilter();
        this.bassFilter.type = 'lowshelf';
        this.bassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
        this.bassFilter.gain.setValueAtTime(6, this.ctx.currentTime); // +6dB boost

        // Create Analyser Node for Visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;

        // Audio Routing: Synth -> BassFilter -> Gain -> Analyser -> Destination
        this.bassFilter.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.isInitialized = true;
    }

    setVolume(volumePercent) {
        // Clamp between 0 and 100
        const clamped = Math.max(0, Math.min(100, volumePercent));
        this.currentGainValue = clamped / 100;

        if (this.gainNode && this.ctx) {
            // Apply volume with smooth exponential ramp to avoid popping
            this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
            this.gainNode.gain.setTargetAtTime(this.currentGainValue, this.ctx.currentTime, 0.05);
        }

        return Math.round(clamped);
    }

    getVolume() {
        return Math.round(this.currentGainValue * 100);
    }

    setBassBoost(enabled) {
        if (!this.bassFilter || !this.ctx) return;
        const gainVal = enabled ? 8 : 0;
        this.bassFilter.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.1);
    }

    play(trackType = 'waves') {
        this.init();

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.stopProceduralSound();
        this.activeTrackType = trackType;
        this.startProceduralSound(trackType);

        this.isPlaying = true;
    }

    pause() {
        if (!this.isPlaying) return;
        this.stopProceduralSound();
        this.isPlaying = false;
    }

    // Procedural Ambient Sound Generator (No external audio file dependencies required!)
    startProceduralSound(type) {
        if (!this.ctx) return;

        this.oscillatorGroup = [];

        if (type === 'waves' || type === 'meditation') {
            // Generate Ambient Synthetic Ocean Waves & Pads
            const frequencies = type === 'waves' ? [110, 164.81, 220, 329.63] : [130.81, 196.00, 261.63, 392.00];
            
            frequencies.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();

                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                // Subtle LFO modulation for breathing wave effect
                const lfo = this.ctx.createOscillator();
                lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
                const lfoGain = this.ctx.createGain();
                lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

                lfo.connect(oscGain.gain);
                lfo.start();

                oscGain.gain.setValueAtTime(0.15 / frequencies.length, this.ctx.currentTime);
                osc.connect(oscGain);
                oscGain.connect(this.bassFilter);

                osc.start();
                this.oscillatorGroup.push({ osc, lfo, gain: oscGain });
            });
        } else if (type === 'lofi') {
            // Warm Lofi Ambient Chords
            const chords = [220, 261.63, 329.63, 392.00]; // Am7 chord
            chords.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                // Filter to make it warm
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450, this.ctx.currentTime);

                oscGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.bassFilter);

                osc.start();
                this.oscillatorGroup.push({ osc, gain: oscGain });
            });
        } else if (type === 'synth') {
            // Neon Synthwave Pulses
            const synthFreqs = [146.83, 220, 293.66, 440];
            synthFreqs.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800 + i * 200, this.ctx.currentTime);

                oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.bassFilter);

                osc.start();
                this.oscillatorGroup.push({ osc, gain: oscGain });
            });
        }
    }

    stopProceduralSound() {
        this.oscillatorGroup.forEach(item => {
            try {
                if (item.osc) item.osc.stop();
                if (item.lfo) item.lfo.stop();
            } catch (e) {}
        });
        this.oscillatorGroup = [];
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
}

// Global Audio Engine Instance
const audioEngine = new AudioEngine();
