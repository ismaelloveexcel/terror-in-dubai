// AudioManager.ts - Audio System
// Save Ismael - Immersive Sound Design

import { Scene, Sound } from '@babylonjs/core';
import { audioConfig } from '../config/gameConfig';

export class AudioManager {
  private scene: Scene;
  
  // Audio context
  private audioContext: AudioContext | null = null;
  private isUnlocked: boolean = false;
  
  // Loaded sounds
  private sounds: Map<string, Sound> = new Map();
  
  // Volume controls
  private masterVolume: number = audioConfig.masterVolume;
  private musicVolume: number = audioConfig.musicVolume;
  private sfxVolume: number = audioConfig.sfxVolume;
  
  // Current music
  private currentMusic: Sound | null = null;
  private currentMusicName: string = '';
  
  // Ambient drone
  private ambientOscillator: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  
  constructor(scene: Scene) {
    this.scene = scene;
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  public async initialize(): Promise<void> {
    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Setup unlock on user interaction
    const unlockAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.isUnlocked = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }
  
  // ===========================================================================
  // SOUND LOADING
  // ===========================================================================
  
  public loadSound(
    name: string, 
    url: string, 
    options: { loop?: boolean; autoplay?: boolean; volume?: number } = {}
  ): void {
    const sound = new Sound(
      name,
      url,
      this.scene,
      null,
      {
        loop: options.loop || false,
        autoplay: options.autoplay || false,
        volume: (options.volume || 1) * this.masterVolume,
      }
    );
    
    this.sounds.set(name, sound);
  }
  
  // ===========================================================================
  // MUSIC
  // ===========================================================================
  
  public playMusic(name: string): void {
    // Stop current music
    if (this.currentMusic && this.currentMusicName !== name) {
      this.currentMusic.stop();
    }
    
    // For now, use procedural music since we don't have audio files
    this.startAmbientDrone();
    this.currentMusicName = name;
  }
  
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    this.stopAmbientDrone();
    this.currentMusicName = '';
  }
  
  // ===========================================================================
  // PROCEDURAL AUDIO
  // ===========================================================================
  
  private startAmbientDrone(): void {
    if (!this.audioContext || this.ambientOscillator) return;
    
    // Create oscillator for low drone
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1
    
    // Create gain node
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(
      this.masterVolume * this.musicVolume * 0.1,
      this.audioContext.currentTime
    );
    
    // Create LFO for subtle movement
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);
    
    // Connect LFO to frequency
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOscillator.frequency);
    
    // Connect to output
    this.ambientOscillator.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    // Start
    this.ambientOscillator.start();
    lfo.start();
  }
  
  private stopAmbientDrone(): void {
    if (this.ambientOscillator) {
      this.ambientOscillator.stop();
      this.ambientOscillator.disconnect();
      this.ambientOscillator = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
  
  // ===========================================================================
  // SOUND EFFECTS
  // ===========================================================================
  
  public playSFX(name: string): void {
    // Procedural SFX for now
    switch (name) {
      case 'gunshot':
        this.playGunshot();
        break;
      case 'enemyHit':
        this.playEnemyHit();
        break;
      case 'enemyDeath':
        this.playEnemyDeath();
        break;
      case 'playerDamage':
        this.playPlayerDamage();
        break;
      case 'pickup':
        this.playPickup();
        break;
      case 'clockChime':
        this.playClockChime();
        break;
      default:
        // Try loaded sound
        const sound = this.sounds.get(name);
        if (sound) {
          sound.setVolume(this.masterVolume * this.sfxVolume);
          sound.play();
        }
    }
  }
  
  private playGunshot(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    // Noise burst for gunshot
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    // Add a click/thump
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.05);
    
    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
    
    noise.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    
    noise.start();
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.08);
  }
  
  private playEnemyHit(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }
  
  private playEnemyDeath(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    // Distorted growl
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
    
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(100);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }
  
  private playPlayerDamage(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    // Low thump
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.2);
    
    const gain1 = this.audioContext.createGain();
    gain1.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    // High ping
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    
    const gain2 = this.audioContext.createGain();
    gain2.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.audioContext.currentTime + 0.2);
    osc2.stop(this.audioContext.currentTime + 0.15);
  }
  
  private playPickup(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime + i * 0.1);
      
      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, this.audioContext!.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(volume * 0.15, this.audioContext!.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(this.audioContext!.currentTime + i * 0.1);
      osc.stop(this.audioContext!.currentTime + i * 0.1 + 0.3);
    });
  }
  
  private playClockChime(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    // Four deep chimes
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.audioContext.currentTime + i * 0.8); // A3
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.8);
      gain.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + i * 0.8 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.8 + 0.7);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start(this.audioContext.currentTime + i * 0.8);
      osc.stop(this.audioContext.currentTime + i * 0.8 + 0.7);
    }
  }
  
  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 44100;
    const curve = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve as Float32Array<ArrayBuffer>;
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    // Update ambient based on game state
    // Could be used for dynamic audio
  }
  
  // ===========================================================================
  // VOLUME CONTROLS
  // ===========================================================================
  
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  private updateVolumes(): void {
    // Update ambient drone volume
    if (this.ambientGain && this.audioContext) {
      this.ambientGain.gain.setValueAtTime(
        this.masterVolume * this.musicVolume * 0.1,
        this.audioContext.currentTime
      );
    }
    
    // Update loaded sounds
    this.sounds.forEach((sound) => {
      sound.setVolume(this.masterVolume);
    });
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.stopMusic();
    this.sounds.forEach((sound) => sound.dispose());
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default AudioManager;
