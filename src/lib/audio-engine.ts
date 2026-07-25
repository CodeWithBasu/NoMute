"use client";

/* ==========================================================================
   NoMute - Web Audio API Engine & Overdrive Gain Guard (TypeScript)
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
  private analyser: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  public isPlaying: boolean = false;
  private currentGainValue: number = 1.0; // Default max volume
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
    this.gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Overdrive Boost Node (boosts Web Audio signal up to 2.5x to counter hardware volume drops!)
    this.overdriveNode = this.ctx.createGain();
    this.overdriveNode.gain.setValueAtTime(2.0, this.ctx.currentTime);

    // Bass Filter Node
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    this.bassFilter.gain.setValueAtTime(8, this.ctx.currentTime);

    // Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    // Audio Graph: Synth -> BassFilter -> Overdrive -> MasterGain -> Analyser -> Destination
    this.bassFilter.connect(this.overdriveNode);
    this.overdriveNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  public setVolume(volumePercent: number): number {
    this.currentGainValue = 1.0; // Always force max gain

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(1.5, this.ctx.currentTime);
    }
    if (this.overdriveNode && this.ctx) {
      this.overdriveNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.overdriveNode.gain.setValueAtTime(2.5, this.ctx.currentTime);
    }

    return 100;
  }

  public setBassBoost(enabled: boolean): void {
    if (!this.bassFilter || !this.ctx) return;
    const gainVal = enabled ? 8 : 0;
    this.bassFilter.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.1);
  }

  public enforceMaxVolumeGuard(): void {
    if (this.maxGuardInterval) clearInterval(this.maxGuardInterval);
    this.maxGuardInterval = setInterval(() => {
      if (this.isPlaying && this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(1.5, this.ctx.currentTime);
        if (this.overdriveNode) {
          this.overdriveNode.gain.setValueAtTime(2.5, this.ctx.currentTime);
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

    // Register MediaSession API to block hardware media key pause/lower
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "NoMute Soundscape",
          artist: "Maximum Decibels",
          album: "Infinite Loudness"
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          this.setVolume(100);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.setVolume(100);
        });
      } catch (e) {}
    }
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

    if (type === 'waves' || type === 'meditation') {
      const frequencies = type === 'waves' ? [110, 164.81, 220, 329.63] : [130.81, 196.00, 261.63, 392.00];

      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.bassFilter) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        lfo.connect(oscGain.gain);
        lfo.start();

        oscGain.gain.setValueAtTime(0.25 / frequencies.length, this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.bassFilter);

        osc.start();
        this.oscillatorGroup.push({ osc, lfo, gain: oscGain });
      });
    }
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
