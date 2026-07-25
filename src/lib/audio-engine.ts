"use client";

/* ==========================================================================
   NoMute - Web Audio API Engine & Procedural Sound Synthesizer (TypeScript)
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
  private analyser: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  public isPlaying: boolean = false;
  private currentGainValue: number = 0.35;
  private oscillatorGroup: OscillatorItem[] = [];
  public activeTrackType: TrackType = 'waves';
  private isInitialized: boolean = false;

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Create Master Gain Node
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.currentGainValue, this.ctx.currentTime);

    // Create Bass Boost Filter
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    this.bassFilter.gain.setValueAtTime(6, this.ctx.currentTime);

    // Create Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    // Connect audio graph
    this.bassFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  public setVolume(volumePercent: number): number {
    const clamped = Math.max(0, Math.min(100, volumePercent));
    this.currentGainValue = clamped / 100;

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setTargetAtTime(this.currentGainValue, this.ctx.currentTime, 0.05);
    }

    return Math.round(clamped);
  }

  public getVolume(): number {
    return Math.round(this.currentGainValue * 100);
  }

  public setBassBoost(enabled: boolean): void {
    if (!this.bassFilter || !this.ctx) return;
    const gainVal = enabled ? 8 : 0;
    this.bassFilter.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.1);
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
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.stopProceduralSound();
    this.isPlaying = false;
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
      const chords = [220, 261.63, 329.63, 392.00];
      chords.forEach((freq) => {
        if (!this.ctx || !this.bassFilter) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

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
      const synthFreqs = [146.83, 220, 293.66, 440];
      synthFreqs.forEach((freq, i) => {
        if (!this.ctx || !this.bassFilter) return;
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
