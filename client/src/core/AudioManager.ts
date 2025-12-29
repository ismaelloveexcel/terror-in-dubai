/**
 * SAVE ISMAEL - Enhanced Audio Manager
 * =====================================
 * Immersive Sound Design with Procedural Fallbacks
 * 
 * Features:
 * - Level-specific ambient & combat music
 * - Boss fight themes
 * - Procedural audio generation when files unavailable
 * - Dynamic music transitions
 * - SPECIAL: "Never Ending Story" dedication for Aidan in credits!
 */

import { Scene, Sound } from '@babylonjs/core';
import { audioConfig } from '../config/gameConfig';

// Audio state types
type MusicState = 'menu' | 'ambient' | 'combat' | 'boss' | 'victory' | 'credits' | 'gameOver' | 'none';

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
  private voiceVolume: number = audioConfig.voiceVolume || 0.9;
  
  // Current music state
  private currentMusic: Sound | null = null;
  private currentMusicName: string = '';
  private musicState: MusicState = 'none';
  private currentLevel: number = 1;
  
  // Ambient drone
  private ambientOscillator: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private combatOscillator: OscillatorNode | null = null;
  private combatGain: GainNode | null = null;
  
  // Never Ending Story special track
  private neverEndingStoryLoaded: boolean = false;
  
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
      document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    // Pre-load the special Never Ending Story track for credits
    this.preloadNeverEndingStory();
  }
  
  // ===========================================================================
  // NEVER ENDING STORY - SPECIAL DEDICATION FOR AIDAN
  // ===========================================================================
  
  private preloadNeverEndingStory(): void {
    try {
      const neverEndingStory = new Sound(
        'never-ending-story',
        '/assets/audio/music/never-ending-story.mp3',
        this.scene,
        () => {
          this.neverEndingStoryLoaded = true;
          console.log('🎵 Never Ending Story loaded - Ready for Aidan\'s dedication!');
        },
        {
          loop: false,
          autoplay: false,
          volume: this.masterVolume * this.musicVolume,
        }
      );
      this.sounds.set('never-ending-story', neverEndingStory);
    } catch (e) {
      console.log('Never Ending Story will use procedural fallback');
    }
  }
  
  /**
   * Play the special credits dedication for Aidan
   * "Turn around, look at what you see..."
   */
  public playCreditsWithDedication(): void {
    this.stopMusic();
    this.musicState = 'credits';
    
    // Try to play the actual Never Ending Story track
    const neverEndingStory = this.sounds.get('never-ending-story');
    if (neverEndingStory && this.neverEndingStoryLoaded) {
      neverEndingStory.setVolume(this.masterVolume * this.musicVolume);
      neverEndingStory.play();
      this.currentMusic = neverEndingStory;
      this.currentMusicName = 'never-ending-story';
      console.log('🎵 Playing: Never Ending Story - Dedicated to Awesome Aidan! 🌟');
    } else {
      // Fallback to procedural dreamy synth
      this.startCreditsTheme();
      console.log('🎵 Credits Theme (Procedural) - Dedicated to Awesome Aidan! 🌟');
    }
    
    // Dispatch event for UI to show dedication
    window.dispatchEvent(new CustomEvent('creditsDedication', {
      detail: {
        message: 'Dedicated to Awesome Aidan',
        song: 'Never Ending Story',
        artist: 'Dustin & Suzie (Stranger Things 3)',
      }
    }));
  }
  
  // ===========================================================================
  // SOUND LOADING
  // ===========================================================================
  
  public loadSound(
    name: string, 
    url: string, 
    options: { loop?: boolean; autoplay?: boolean; volume?: number } = {}
  ): void {
    try {
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
    } catch (e) {
      console.warn(`Failed to load sound: ${name}`);
    }
  }
  
  // ===========================================================================
  // MUSIC - Level Aware
  // ===========================================================================
  
  public setCurrentLevel(level: number): void {
    this.currentLevel = level;
  }
  
  public playMusic(state: MusicState): void {
    if (this.musicState === state) return;
    
    // Stop current music
    this.stopMusic();
    this.musicState = state;
    
    switch (state) {
      case 'menu':
        this.startMenuTheme();
        break;
      case 'ambient':
        this.startAmbientDrone();
        break;
      case 'combat':
        this.startCombatMusic();
        break;
      case 'boss':
        this.startBossMusic();
        break;
      case 'victory':
        this.startVictoryTheme();
        break;
      case 'credits':
        this.playCreditsWithDedication();
        break;
      case 'gameOver':
        this.startGameOverTheme();
        break;
    }
    
    this.currentMusicName = state;
  }
  
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    this.stopAmbientDrone();
    this.stopCombatMusic();
    this.currentMusicName = '';
    this.musicState = 'none';
  }
  
  // Transition between ambient and combat
  public transitionToCombat(): void {
    if (this.musicState === 'combat') return;
    this.playMusic('combat');
  }
  
  public transitionToAmbient(): void {
    if (this.musicState === 'ambient') return;
    this.playMusic('ambient');
  }
  
  // ===========================================================================
  // PROCEDURAL MUSIC GENERATORS
  // ===========================================================================
  
  private startMenuTheme(): void {
    if (!this.audioContext) return;
    
    // Eerie synth pad
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(165, this.audioContext.currentTime); // E3 (fifth)
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.08, this.audioContext.currentTime);
    
    // LFO for movement
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(3, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    lfo.start();
    
    this.ambientOscillator = osc1;
    this.ambientGain = gain;
  }
  
  private startAmbientDrone(): void {
    if (!this.audioContext || this.ambientOscillator) return;
    
    // Level-specific frequencies
    const levelFrequencies: Record<number, number> = {
      1: 55,   // A1 - Mall ambience
      2: 45,   // Lower - Underground tunnels
      3: 65,   // Higher - Height/vertigo
      4: 50,   // Water/marina
      5: 52,   // Downtown tension
      6: 40,   // Deep, ominous - Vecna's domain
    };
    
    const baseFreq = levelFrequencies[this.currentLevel] || 55;
    
    // Create oscillator for low drone
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    
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
      try {
        this.ambientOscillator.stop();
        this.ambientOscillator.disconnect();
      } catch (e) {}
      this.ambientOscillator = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
  
  private startCombatMusic(): void {
    if (!this.audioContext || this.combatOscillator) return;
    
    // Pulsing bass
    this.combatOscillator = this.audioContext.createOscillator();
    this.combatOscillator.type = 'sawtooth';
    this.combatOscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);
    
    // Filter for grit
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    // Pulse the filter
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2.3, this.audioContext.currentTime); // ~140 BPM feel
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(200, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    this.combatGain = this.audioContext.createGain();
    this.combatGain.gain.setValueAtTime(
      this.masterVolume * this.musicVolume * 0.15,
      this.audioContext.currentTime
    );
    
    this.combatOscillator.connect(filter);
    filter.connect(this.combatGain);
    this.combatGain.connect(this.audioContext.destination);
    
    this.combatOscillator.start();
    lfo.start();
  }
  
  private stopCombatMusic(): void {
    if (this.combatOscillator) {
      try {
        this.combatOscillator.stop();
        this.combatOscillator.disconnect();
      } catch (e) {}
      this.combatOscillator = null;
    }
    if (this.combatGain) {
      this.combatGain.disconnect();
      this.combatGain = null;
    }
  }
  
  private startBossMusic(): void {
    if (!this.audioContext) return;
    
    // Deep, ominous for boss fights
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(40, this.audioContext.currentTime);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(80, this.audioContext.currentTime);
    
    // Heavy filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.2, this.audioContext.currentTime);
    
    // Slow LFO for dread
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    lfo.start();
    
    this.combatOscillator = osc1;
    this.combatGain = gain;
  }
  
  private startVictoryTheme(): void {
    if (!this.audioContext) return;
    
    // Major chord arpeggio - triumphant!
    const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume * this.musicVolume * 0.2, this.audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 2);
      }, i * 300);
    });
  }
  
  private startCreditsTheme(): void {
    if (!this.audioContext) return;
    
    // Dreamy, hopeful synth (Never Ending Story vibe)
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(this.masterVolume * this.musicVolume * 0.12, this.audioContext.currentTime + 2);
    
    // Gentle vibrato
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.setValueAtTime(4, this.audioContext.currentTime);
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(3, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    lfo.start();
    
    this.ambientOscillator = osc1;
    this.ambientGain = gain;
  }
  
  private startGameOverTheme(): void {
    if (!this.audioContext) return;
    
    // Vecna's clock chimes - 4 deep tones
    this.playClockChime();
    
    // Then fade to silence with low drone
    setTimeout(() => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(30, this.audioContext.currentTime);
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.1, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 5);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + 5);
    }, 3500);
  }
  
  // ===========================================================================
  // SOUND EFFECTS
  // ===========================================================================
  
  public playSFX(name: string): void {
    // Try loaded sound first
    const sound = this.sounds.get(name);
    if (sound) {
      sound.setVolume(this.masterVolume * this.sfxVolume);
      sound.play();
      return;
    }
    
    // Procedural SFX fallback
    switch (name) {
      // Weapons
      case 'gunshot':
      case 'pistolFire':
        this.playGunshot();
        break;
      case 'reload':
      case 'pistolReload':
        this.playReload();
        break;
      case 'empty':
      case 'pistolEmpty':
        this.playEmptyClick();
        break;
      case 'meleeSwing':
      case 'katanaSwing':
      case 'nailBatSwing':
        this.playMeleeSwing();
        break;
      case 'meleeHit':
      case 'katanaHit':
      case 'nailBatHit':
      case 'shieldBash':
        this.playMeleeHit();
        break;
      case 'shieldBlock':
        this.playShieldBlock();
        break;
        
      // Enemies
      case 'enemyHit':
        this.playEnemyHit();
        break;
      case 'enemyDeath':
        this.playEnemyDeath();
        break;
      case 'demodogGrowl':
        this.playDemodogGrowl();
        break;
      case 'demobatScreech':
        this.playDemobatScreech();
        break;
      case 'demogorgonRoar':
        this.playDemogorgonRoar();
        break;
        
      // Player
      case 'playerDamage':
        this.playPlayerDamage();
        break;
      case 'playerHeal':
        this.playPlayerHeal();
        break;
      case 'footstep':
        this.playFootstep();
        break;
        
      // Environment
      case 'portalOpen':
        this.playPortalOpen();
        break;
      case 'portalHum':
        this.playPortalHum();
        break;
      case 'hiveSpawn':
        this.playHiveSpawn();
        break;
      case 'hiveDestroy':
        this.playHiveDestroy();
        break;
        
      // UI/Pickups
      case 'pickup':
        this.playPickup();
        break;
      case 'evidenceFound':
        this.playEvidenceFound();
        break;
      case 'weaponPickup':
        this.playWeaponPickup();
        break;
      case 'objectiveComplete':
        this.playObjectiveComplete();
        break;
        
      // Horror/Vecna
      case 'clockTick':
        this.playClockTick();
        break;
      case 'clockChime':
        this.playClockChime();
        break;
      case 'vecnaTeleport':
        this.playVecnaTeleport();
        break;
      case 'vecnaWhisper':
        this.playVecnaWhisper();
        break;
      case 'mindFlayerPsychic':
        this.playMindFlayerPsychic();
        break;
    }
  }
  
  // ===========================================================================
  // WEAPON SOUNDS
  // ===========================================================================
  
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
  
  private playReload(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Magazine click
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
    
    const gain1 = this.audioContext.createGain();
    gain1.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.start();
    osc1.stop(this.audioContext.currentTime + 0.1);
    
    // Slide rack after delay
    setTimeout(() => {
      if (!this.audioContext) return;
      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(800, this.audioContext.currentTime);
      osc2.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 0.15);
      
      const gain2 = this.audioContext.createGain();
      gain2.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
      
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.start();
      osc2.stop(this.audioContext.currentTime + 0.15);
    }, 200);
  }
  
  private playEmptyClick(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.03);
  }
  
  private playMeleeSwing(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Whoosh sound
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.5;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.15);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start();
  }
  
  private playMeleeHit(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Thwack with some wetness
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.1);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }
  
  private playShieldBlock(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Metallic clang
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, this.audioContext.currentTime);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.35, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    osc1.start();
    osc2.start();
    osc1.stop(this.audioContext.currentTime + 0.3);
    osc2.stop(this.audioContext.currentTime + 0.3);
  }
  
  // ===========================================================================
  // ENEMY SOUNDS
  // ===========================================================================
  
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
    
    // Distorted growl/screech
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
  
  private playDemodogGrowl(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.3);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.4);
  }
  
  private playDemobatScreech(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000 + Math.random() * 500, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }
  
  private playDemogorgonRoar(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Multi-layered roar
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, this.audioContext.currentTime);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(120, this.audioContext.currentTime);
    
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(200);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.4, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
    
    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.audioContext.currentTime + 0.8);
    osc2.stop(this.audioContext.currentTime + 0.8);
  }
  
  // ===========================================================================
  // PLAYER SOUNDS
  // ===========================================================================
  
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
  
  private playPlayerHeal(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Warm, rising tones
    const notes = [392, 493.88, 587.33]; // G4, B4, D5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
      }, i * 100);
    });
  }
  
  private playFootstep(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume * 0.5;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 + Math.random() * 20, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.08);
  }
  
  // ===========================================================================
  // ENVIRONMENT SOUNDS
  // ===========================================================================
  
  private playPortalOpen(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Reality tear sound
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }
  
  private playPortalHum(): void {
    // Just a brief hum burst
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
    
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.setValueAtTime(5, this.audioContext.currentTime);
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    lfo.start();
    osc.stop(this.audioContext.currentTime + 0.5);
    lfo.stop(this.audioContext.currentTime + 0.5);
  }
  
  private playHiveSpawn(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Wet emergence
    const bufferSize = this.audioContext.sampleRate * 0.4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.25, this.audioContext.currentTime);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start();
  }
  
  private playHiveDestroy(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Explosive splatter
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    noise.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start();
  }
  
  // ===========================================================================
  // UI / PICKUP SOUNDS
  // ===========================================================================
  
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
  
  private playEvidenceFound(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Emotional discovery - special sound
    const notes = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.2, this.audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.8);
      }, i * 150);
    });
  }
  
  private playWeaponPickup(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Metallic equip sound
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }
  
  private playObjectiveComplete(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Achievement fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.4);
      }, i * 120);
    });
  }
  
  // ===========================================================================
  // HORROR / VECNA SOUNDS
  // ===========================================================================
  
  private playClockTick(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }
  
  private playClockChime(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    
    // Four deep chimes - Vecna's signature
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
  
  private playVecnaTeleport(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Reality tear + void whoosh
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.4);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(30, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.35, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.audioContext.currentTime + 0.5);
    osc2.stop(this.audioContext.currentTime + 0.5);
  }
  
  private playVecnaWhisper(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.voiceVolume;
    
    // Eerie whisper-like sound
    const bufferSize = this.audioContext.sampleRate * 1.0;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(t * Math.PI);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(10, this.audioContext.currentTime);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start();
  }
  
  private playMindFlayerPsychic(): void {
    if (!this.audioContext) return;
    const volume = this.masterVolume * this.sfxVolume;
    
    // Inside-your-head distorted sound
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, this.audioContext.currentTime);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(153, this.audioContext.currentTime); // Slight detune for dissonance
    
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.setValueAtTime(8, this.audioContext.currentTime);
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(30, this.audioContext.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(150);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
    
    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start();
    osc2.start();
    lfo.start();
    osc1.stop(this.audioContext.currentTime + 0.8);
    osc2.stop(this.audioContext.currentTime + 0.8);
    lfo.stop(this.audioContext.currentTime + 0.8);
  }
  
  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================
  
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(_deltaTime: number): void {
    // Could be used for dynamic audio based on game state
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
  
  public setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }
  
  private updateVolumes(): void {
    // Update ambient drone volume
    if (this.ambientGain && this.audioContext) {
      this.ambientGain.gain.setValueAtTime(
        this.masterVolume * this.musicVolume * 0.1,
        this.audioContext.currentTime
      );
    }
    
    // Update combat music volume
    if (this.combatGain && this.audioContext) {
      this.combatGain.gain.setValueAtTime(
        this.masterVolume * this.musicVolume * 0.15,
        this.audioContext.currentTime
      );
    }
    
    // Update loaded sounds
    this.sounds.forEach((sound) => {
      sound.setVolume(this.masterVolume);
    });
  }
  
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  
  public getMasterVolume(): number { return this.masterVolume; }
  public getMusicVolume(): number { return this.musicVolume; }
  public getSFXVolume(): number { return this.sfxVolume; }
  public getVoiceVolume(): number { return this.voiceVolume; }
  public getCurrentMusicState(): MusicState { return this.musicState; }
  
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
