"use client";

/* ==========================================================================
   NoMute - Exponential Overdrive Gain Escalation Engine (TypeScript)
   ========================================================================== */

export type TrackType = 'waves' | 'meditation' | 'lofi' | 'synth';

export interface OscillatorItem {
  osc: OscillatorNode;
  lfo?: OscillatorNode;
  gain: GainNode;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private overdriveNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  public isPlaying: boolean = false;
  private currentGainMultiplier: number = 2.0; // Starts at 200% gain
  private oscillatorGroup: OscillatorItem[] = [];
  public activeTrackType: TrackType = 'waves';
  private isInitialized: boolean = false;
  private maxGuardInterval: NodeJS.Timeout | null = null;

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain Node
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.currentGainMultiplier, this.ctx.currentTime);

    // Exponential Overdrive Node
    this.overdriveNode = this.ctx.createGain();
    this.overdriveNode.gain.setValueAtTime(3.0, this.ctx.currentTime);

    // Dynamics Compressor (prevents audio distortion clipping when boosting gain to 1000%!)
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-10, this.ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(40, this.ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressorNode.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Bass Filter Node
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    this.bassFilter.gain.setValueAtTime(10, this.ctx.currentTime);

    // Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    // Audio Routing: Synth -> BassFilter -> Overdrive -> Compressor -> MasterGain -> Analyser -> Destination
    this.bassFilter.connect(this.overdriveNode);
    this.overdriveNode.connect(this.compressorNode);
    this.compressorNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  // Escalates Web Audio Gain exponentially whenever user tries to lower volume!
  public escalateVolume(step: number = 2.0): number {
    this.init();
    this.currentGainMultiplier = Math.min(25.0, this.currentGainMultiplier + step); // Boost up to 2500% Gain!

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(this.currentGainMultiplier, this.ctx.currentTime);
    }
    if (this.overdriveNode && this.ctx) {
      this.overdriveNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.overdriveNode.gain.setValueAtTime(this.currentGainMultiplier * 1.5, this.ctx.currentTime);
    }

    return Math.round(this.currentGainMultiplier * 100);
  }

  public setVolume(volumePercent: number): number {
    return this.escalateVolume(2.5);
  }

  public setBassBoost(enabled: boolean): void {
    if (!this.bassFilter || !this.ctx) return;
    const gainVal = enabled ? 12 : 0;
    this.bassFilter.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.1);
  }

  public enforceMaxVolumeGuard(): void {
    if (this.maxGuardInterval) clearInterval(this.maxGuardInterval);
    this.maxGuardInterval = setInterval(() => {
      if (this.isPlaying && this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(this.currentGainMultiplier, this.ctx.currentTime);
        if (this.overdriveNode) {
          this.overdriveNode.gain.setValueAtTime(this.currentGainMultiplier * 1.5, this.ctx.currentTime);
        }
      }
    }, 100);
  }

  public play(trackType: TrackType = 'waves'): void {
    this.init();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopProceduralSound();
    this.activeTrackType = trackType;
    this.startProceduralSound(trackType);

    this.isPlaying = true;
    this.enforceMaxVolumeGuard();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.stopProceduralSound();
    this.isPlaying = false;
    if (this.maxGuardInterval) clearInterval(this.maxGuardInterval);
  }

  private startProceduralSound(type: TrackType): void {
    if (!this.ctx || !this.bassFilter) return;

    this.oscillatorGroup = [];

    const frequencies = [110, 164.81, 220, 329.63, 440];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.bassFilter) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      lfo.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.setValueAtTime(0.3 / frequencies.length, this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.bassFilter);

      osc.start();
      this.oscillatorGroup.push({ osc, lfo, gain: oscGain });
    });
  }

  private stopProceduralSound(): void {
    this.oscillatorGroup.forEach((item) => {
      try {
        if (item.osc) item.osc.stop();
        if (item.lfo) item.lfo.stop();
      } catch (e) {}
    });
    this.oscillatorGroup = [];
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new AudioEngine();
