import { Scene, Sound } from '@babylonjs/core';
import { settings } from '../config/gameConfig';

/**
 * AudioManager - Handles all game audio
 * 
 * Features:
 * - Synthesized sound effects using Web Audio API
 * - Volume controls integrated with settings
 * - Mobile audio unlock
 */
export class AudioManager {
  private sounds: Map<string, Sound> = new Map();
  private unlocked: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor(private scene: Scene) {
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio context
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    // Unlock audio context on user gesture (required for mobile)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('Audio unlocked');
    }

    this.unlocked = true;
  }

  loadSound(name: string, url: string, options?: {
    loop?: boolean;
    autoplay?: boolean;
    volume?: number;
  }): void {
    try {
      const sound = new Sound(name, url, this.scene, null, {
        loop: options?.loop || false,
        autoplay: options?.autoplay || false,
        volume: (options?.volume || 1.0) * settings.masterVolume
      });
      this.sounds.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  play(name: string): void {
    const sound = this.sounds.get(name);
    if (sound && this.unlocked) {
      sound.setVolume(settings.masterVolume * settings.sfxVolume);
      sound.play();
    }
  }

  stop(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
    }
  }

  setVolume(name: string, volume: number): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.setVolume(volume * settings.masterVolume);
    }
  }

  /**
   * Play synthesized gunshot sound
   */
  playGunshot(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create oscillator for the "crack" sound
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

    // Create noise for the "pop"
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Gain envelope
    const gainOsc = ctx.createGain();
    gainOsc.gain.setValueAtTime(volume * 0.3, now);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(volume * 0.5, now);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    // Connect and play
    osc.connect(gainOsc).connect(ctx.destination);
    noise.connect(gainNoise).connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.15);
    noise.stop(now + 0.1);
  }

  /**
   * Play enemy hit sound
   */
  playEnemyHit(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Impact thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play enemy death sound
   */
  playEnemyDeath(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Descending screech
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Add distortion
    const distortion = ctx.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(50);

    osc.connect(distortion).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Play player damage sound
   */
  playPlayerDamage(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Low thump with high hit
    const oscLow = ctx.createOscillator();
    oscLow.type = 'sine';
    oscLow.frequency.setValueAtTime(100, now);

    const oscHigh = ctx.createOscillator();
    oscHigh.type = 'triangle';
    oscHigh.frequency.setValueAtTime(800, now);
    oscHigh.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    const gainLow = ctx.createGain();
    gainLow.gain.setValueAtTime(volume * 0.5, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const gainHigh = ctx.createGain();
    gainHigh.gain.setValueAtTime(volume * 0.3, now);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscLow.connect(gainLow).connect(ctx.destination);
    oscHigh.connect(gainHigh).connect(ctx.destination);

    oscLow.start(now);
    oscHigh.start(now);
    oscLow.stop(now + 0.25);
    oscHigh.stop(now + 0.15);
  }

  /**
   * Play level complete sound
   */
  playLevelComplete(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Victory fanfare - ascending notes
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.35);
    });
  }

  /**
   * Play UI click sound
   */
  playUIClick(): void {
    if (!this.unlocked || !this.audioContext) return;
    
    const volume = settings.masterVolume * settings.sfxVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Play ambient drone (for atmosphere)
   */
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  startAmbientDrone(): void {
    if (!this.unlocked || !this.audioContext || this.ambientOsc) return;
    
    const volume = settings.masterVolume * settings.musicVolume;
    if (volume === 0) return;

    const ctx = this.audioContext;

    // Create eerie ambient drone
    this.ambientOsc = ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

    // Add slight modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(5, ctx.currentTime);
    
    lfo.connect(lfoGain).connect(this.ambientOsc.frequency);

    // Gain control
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);

    this.ambientOsc.connect(this.ambientGain).connect(ctx.destination);
    
    this.ambientOsc.start();
    lfo.start();
  }

  stopAmbientDrone(): void {
    if (this.ambientOsc) {
      this.ambientOsc.stop();
      this.ambientOsc = null;
    }
    if (this.ambientGain) {
      this.ambientGain = null;
    }
  }

  /**
   * Create distortion curve
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }

  /**
   * Update volume levels from settings
   */
  updateVolumes(): void {
    if (this.ambientGain && this.audioContext) {
      const volume = settings.masterVolume * settings.musicVolume;
      this.ambientGain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    }
  }

  dispose(): void {
    this.stopAmbientDrone();
    this.sounds.forEach(sound => sound.dispose());
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
