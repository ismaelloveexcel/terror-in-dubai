/**
 * SAVE ISMAEL - Enhanced Audio Manager
 * =====================================
 * Immersive Sound Design with Procedural Fallbacks
 * 
 * Features:
 * - Level-specific ambient and combat music
 * - Boss fight themes
 * - Full SFX library for weapons, enemies, environment
 * - Voice clip support
 * - Procedural audio when files aren't available
 * - Web Audio API integration with Babylon.js
 */

import { Scene, Sound } from '@babylonjs/core';
import { audioConfig } from '../config/gameConfig';
import audioConfigComplete, { 
  levelMusic, 
  weaponSFX, 
  enemySFX, 
  environmentSFX,
  playerSFX,
  uiSFX,
  voiceClips,
  proceduralParams,
  volumePresets 
} from '../config/audioConfig';

// =============================================================================
// TYPES
// =============================================================================

type MusicState = 'menu' | 'ambient' | 'combat' | 'boss' | 'victory' | 'gameover' | 'credits';

interface ActiveOscillator {
  oscillator: OscillatorNode;
  gain: GainNode;
  lfo?: OscillatorNode;
}

// =============================================================================
// AUDIO MANAGER CLASS
// =============================================================================

export class AudioManager {
  private scene: Scene;
  
  // Audio context
  private audioContext: AudioContext | null = null;
  private isUnlocked: boolean = false;
  
  // Loaded sounds (for when audio files are available)
  private sounds: Map<string, Sound> = new Map();
  
  // Volume controls
  private masterVolume: number = audioConfig.masterVolume;
  private musicVolume: number = audioConfig.musicVolume;
  private sfxVolume: number = audioConfig.sfxVolume;
  private voiceVolume: number = audioConfig.voiceVolume || 0.9;
  
  // Current state
  private currentMusic: Sound | null = null;
  private currentMusicName: string = '';
  private currentMusicState: MusicState = 'menu';
  private currentLevel: number = 1;
  private isInCombat: boolean = false;
  
  // Procedural audio nodes
  private activeOscillators: Map<string, ActiveOscillator> = new Map();
  private ambientOscillator: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  
  // Music crossfade
  private fadeInterval: number | null = null;
  
  constructor(scene: Scene) {
    this.scene = scene;
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  public async initialize(): Promise<void> {
    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Setup unlock on user interaction (required by browsers)
    const unlockAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.isUnlocked = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      console.log('[AudioManager] Audio context unlocked');
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    console.log('[AudioManager] Initialized with procedural audio support');
  }
  
  // ===========================================================================
  // LEVEL MUSIC SYSTEM
  // ===========================================================================
  
  /**
   * Set the current level for level-specific music
   */
  public setLevel(level: number): void {
    this.currentLevel = level;
    console.log(`[AudioManager] Level set to ${level}`);
  }
  
  /**
   * Play ambient music for current level
   */
  public playLevelAmbient(): void {
    this.isInCombat = false;
    this.currentMusicState = 'ambient';
    
    const levelMusicConfig = levelMusic[this.currentLevel];
    if (levelMusicConfig?.ambient) {
      this.transitionToMusic('ambient');
    }
  }
  
  /**
   * Switch to combat music for current level
   */
  public playLevelCombat(): void {
    if (this.isInCombat) return; // Already in combat
    
    this.isInCombat = true;
    this.currentMusicState = 'combat';
    
    const levelMusicConfig = levelMusic[this.currentLevel];
    if (levelMusicConfig?.combat) {
      this.transitionToMusic('combat');
    }
  }
  
  /**
   * Play boss music for current level
   */
  public playBossMusic(): void {
    this.currentMusicState = 'boss';
    
    const levelMusicConfig = levelMusic[this.currentLevel];
    if (levelMusicConfig?.boss) {
      this.transitionToMusic('boss');
    } else {
      // Fallback to generic boss music
      this.playBossDrone();
    }
  }
  
  /**
   * Transition between music states with crossfade
   */
  private transitionToMusic(state: MusicState): void {
    // Fade out current music
    if (this.ambientGain && this.audioContext) {
      const fadeOutTime = 1.5;
      this.ambientGain.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + fadeOutTime
      );
      
      // Stop and restart with new music after fade
      setTimeout(() => {
        this.stopAmbientDrone();
        this.startProceduralMusic(state);
      }, fadeOutTime * 1000);
    } else {
      this.startProceduralMusic(state);
    }
  }
  
  // ===========================================================================
  // MUSIC PLAYBACK
  // ===========================================================================
  
  public playMusic(name: string): void {
    // Stop current music
    if (this.currentMusic && this.currentMusicName !== name) {
      this.currentMusic.stop();
    }
    
    // Check if we have the actual audio file
    const sound = this.sounds.get(name);
    if (sound) {
      this.currentMusic = sound;
      this.currentMusicName = name;
      sound.setVolume(this.masterVolume * this.musicVolume);
      sound.play();
    } else {
      // Use procedural music
      this.startProceduralMusic(name as MusicState);
      this.currentMusicName = name;
    }
  }
  
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    this.stopAmbientDrone();
    this.stopAllOscillators();
    this.currentMusicName = '';
  }
  
  // ===========================================================================
  // PROCEDURAL MUSIC
  // ===========================================================================
  
  private startProceduralMusic(state: MusicState): void {
    this.stopAmbientDrone();
    
    switch (state) {
      case 'menu':
        this.startMenuMusic();
        break;
      case 'ambient':
        this.startAmbientDrone();
        break;
      case 'combat':
        this.startCombatMusic();
        break;
      case 'boss':
        this.playBossDrone();
        break;
      case 'victory':
        this.playVictoryFanfare();
        break;
      case 'gameover':
        this.playGameOverMusic();
        break;
      case 'credits':
        this.startCreditsMusic();
        break;
      default:
        this.startAmbientDrone();
    }
  }
  
  /**
   * Menu theme - eerie synth pads
   */
  private startMenuMusic(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Main pad - low A
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);
    
    // Second pad - haunting fifth
    const pad2 = this.audioContext.createOscillator();
    pad2.type = 'triangle';
    pad2.frequency.setValueAtTime(82.41, this.audioContext.currentTime); // E2
    
    // LFO for movement
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.3, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(3, this.audioContext.currentTime);
    
    // Filter for warmth
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    // Main gain
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.15, this.audioContext.currentTime + 2);
    
    // Connect
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOscillator.frequency);
    
    this.ambientOscillator.connect(filter);
    pad2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    // Start
    this.ambientOscillator.start();
    pad2.start();
    lfo.start();
    
    // Store for cleanup
    this.activeOscillators.set('menu_pad2', { oscillator: pad2, gain: this.ambientGain, lfo });
  }
  
  /**
   * Ambient drone - creepy exploration
   */
  private startAmbientDrone(): void {
    if (!this.audioContext || this.ambientOscillator) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Create oscillator for low drone
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    
    // Level-specific base note
    const baseNotes: Record<number, number> = {
      1: 55,    // A1 - Mall
      2: 49,    // G1 - Metro (lower, underground)
      3: 65.41, // C2 - Frame (slightly higher, vertigo)
      4: 41.2,  // E1 - Marina (deep, water)
      5: 55,    // A1 - Downtown
      6: 36.71, // D1 - Burj Khalifa (deepest, Vecna's domain)
    };
    
    this.ambientOscillator.frequency.setValueAtTime(
      baseNotes[this.currentLevel] || 55,
      this.audioContext.currentTime
    );
    
    // Create gain node
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.1, this.audioContext.currentTime + 2);
    
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
  
  /**
   * Combat music - intense pulse
   */
  private startCombatMusic(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Bass pulse
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sawtooth';
    this.ambientOscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);
    
    // Filter for aggression
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    // LFO for filter sweep
    const filterLfo = this.audioContext.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.25, this.audioContext.currentTime);
    
    const filterLfoGain = this.audioContext.createGain();
    filterLfoGain.gain.setValueAtTime(200, this.audioContext.currentTime);
    
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);
    
    // Main gain with pulse
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.2, this.audioContext.currentTime + 0.5);
    
    // Pulse LFO
    const pulseLfo = this.audioContext.createOscillator();
    pulseLfo.type = 'square';
    pulseLfo.frequency.setValueAtTime(2.33, this.audioContext.currentTime); // ~140 BPM
    
    const pulseLfoGain = this.audioContext.createGain();
    pulseLfoGain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    
    pulseLfo.connect(pulseLfoGain);
    pulseLfoGain.connect(this.ambientGain.gain);
    
    // Connect
    this.ambientOscillator.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    // Start
    this.ambientOscillator.start();
    filterLfo.start();
    pulseLfo.start();
    
    this.activeOscillators.set('combat_filterLfo', { oscillator: filterLfo, gain: filterLfoGain });
    this.activeOscillators.set('combat_pulseLfo', { oscillator: pulseLfo, gain: pulseLfoGain });
  }
  
  /**
   * Boss music - overwhelming, cosmic horror
   */
  private playBossDrone(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Deep sub bass
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.setValueAtTime(30, this.audioContext.currentTime);
    
    // Detuned second oscillator
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(60, this.audioContext.currentTime);
    osc2.detune.setValueAtTime(5, this.audioContext.currentTime);
    
    // Third oscillator - high tension
    const osc3 = this.audioContext.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(220, this.audioContext.currentTime);
    
    // Slow LFO for dread
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOscillator.frequency);
    
    // Filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(3, this.audioContext.currentTime);
    
    // Main gain with fade in
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.25, this.audioContext.currentTime + 3);
    
    // Mixer
    const mixer = this.audioContext.createGain();
    mixer.gain.setValueAtTime(1, this.audioContext.currentTime);
    
    // Connect
    this.ambientOscillator.connect(mixer);
    osc2.connect(mixer);
    osc3.connect(mixer);
    mixer.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    // Start
    this.ambientOscillator.start();
    osc2.start();
    osc3.start();
    lfo.start();
    
    this.activeOscillators.set('boss_osc2', { oscillator: osc2, gain: mixer });
    this.activeOscillators.set('boss_osc3', { oscillator: osc3, gain: mixer });
    this.activeOscillators.set('boss_lfo', { oscillator: lfo, gain: lfoGain });
  }
  
  /**
   * Victory fanfare
   */
  private playVictoryFanfare(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    const now = this.audioContext.currentTime;
    
    // Major chord arpeggio: C - E - G - C'
    const notes = [261.63, 329.63, 392.00, 523.25];
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(volume * 0.2, now + i * 0.15 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 2);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 2);
    });
    
    // Sustain pad
    setTimeout(() => {
      if (!this.audioContext) return;
      
      this.ambientOscillator = this.audioContext.createOscillator();
      this.ambientOscillator.type = 'triangle';
      this.ambientOscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime);
      
      this.ambientGain = this.audioContext.createGain();
      this.ambientGain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
      
      this.ambientOscillator.connect(this.ambientGain);
      this.ambientGain.connect(this.audioContext.destination);
      this.ambientOscillator.start();
    }, 800);
  }
  
  /**
   * Game over music - descent into darkness
   */
  private playGameOverMusic(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Descending drone
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
    this.ambientOscillator.frequency.exponentialRampToValueAtTime(27.5, this.audioContext.currentTime + 4);
    
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 5);
    
    this.ambientOscillator.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    this.ambientOscillator.start();
    this.ambientOscillator.stop(this.audioContext.currentTime + 5);
    
    // Clock chimes
    setTimeout(() => this.playClockChime(), 1000);
  }
  
  /**
   * Credits music - hopeful, nostalgic (Never Ending Story tribute)
   */
  private startCreditsMusic(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.musicVolume;
    
    // Warm pad - C major
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'triangle';
    this.ambientOscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime);
    
    // Add fifth
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(392, this.audioContext.currentTime); // G4
    
    // Gentle vibrato
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(2, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOscillator.frequency);
    
    // Filter for warmth
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
    
    // Gain with fade in
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.12, this.audioContext.currentTime + 3);
    
    // Connect
    this.ambientOscillator.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.audioContext.destination);
    
    // Start
    this.ambientOscillator.start();
    osc2.start();
    lfo.start();
    
    this.activeOscillators.set('credits_osc2', { oscillator: osc2, gain: this.ambientGain });
    this.activeOscillators.set('credits_lfo', { oscillator: lfo, gain: lfoGain });
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
      try {
        this.ambientGain.disconnect();
      } catch (e) {}
      this.ambientGain = null;
    }
  }
  
  private stopAllOscillators(): void {
    this.activeOscillators.forEach((active) => {
      try {
        active.oscillator.stop();
        active.oscillator.disconnect();
        if (active.lfo) {
          active.lfo.stop();
          active.lfo.disconnect();
        }
      } catch (e) {}
    });
    this.activeOscillators.clear();
  }
  
  // ===========================================================================
  // SOUND EFFECTS
  // ===========================================================================
  
  public playSFX(name: string): void {
    // Check for loaded sound first
    const sound = this.sounds.get(name);
    if (sound) {
      sound.setVolume(this.masterVolume * this.sfxVolume);
      sound.play();
      return;
    }
    
    // Use procedural SFX
    this.playProceduralSFX(name);
  }
  
  private playProceduralSFX(name: string): void {
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
      case 'katanaSwing':
      case 'nailBatSwing':
      case 'meleeSwing':
        this.playMeleeSwing();
        break;
      case 'katanaHit':
      case 'nailBatHit':
      case 'meleeHit':
        this.playMeleeHit();
        break;
      case 'shieldBlock':
        this.playShieldBlock();
        break;
      case 'shieldBash':
        this.playShieldBash();
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
      case 'mindFlayerPsychic':
        this.playMindFlayerPsychic();
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
        
      // UI
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
        
      // Vecna/Horror
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
        
      default:
        console.log(`[AudioManager] Unknown SFX: ${name}`);
    }
  }
  
  // ---------------------------------------------------------------------------
  // WEAPON SFX
  // ---------------------------------------------------------------------------
  
  private playGunshot(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Noise burst
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Low thump
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
    
    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(volume * 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    noise.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    
    noise.start();
    osc.start();
    osc.stop(now + 0.08);
  }
  
  private playReload(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Click (magazine out)
    const click1 = this.audioContext.createOscillator();
    click1.type = 'square';
    click1.frequency.setValueAtTime(2000, now);
    
    const click1Gain = this.audioContext.createGain();
    click1Gain.gain.setValueAtTime(volume * 0.1, now);
    click1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    click1.connect(click1Gain);
    click1Gain.connect(this.audioContext.destination);
    click1.start(now);
    click1.stop(now + 0.02);
    
    // Slide (magazine in)
    setTimeout(() => {
      if (!this.audioContext) return;
      const slideNow = this.audioContext.currentTime;
      
      const slide = this.audioContext.createOscillator();
      slide.type = 'sawtooth';
      slide.frequency.setValueAtTime(400, slideNow);
      slide.frequency.linearRampToValueAtTime(800, slideNow + 0.1);
      
      const slideGain = this.audioContext.createGain();
      slideGain.gain.setValueAtTime(volume * 0.15, slideNow);
      slideGain.gain.exponentialRampToValueAtTime(0.001, slideNow + 0.1);
      
      slide.connect(slideGain);
      slideGain.connect(this.audioContext.destination);
      slide.start(slideNow);
      slide.stop(slideNow + 0.1);
    }, 300);
    
    // Click (rack slide)
    setTimeout(() => {
      if (!this.audioContext) return;
      const clickNow = this.audioContext.currentTime;
      
      const click2 = this.audioContext.createOscillator();
      click2.type = 'square';
      click2.frequency.setValueAtTime(3000, clickNow);
      
      const click2Gain = this.audioContext.createGain();
      click2Gain.gain.setValueAtTime(volume * 0.15, clickNow);
      click2Gain.gain.exponentialRampToValueAtTime(0.001, clickNow + 0.03);
      
      click2.connect(click2Gain);
      click2Gain.connect(this.audioContext.destination);
      click2.start(clickNow);
      click2.stop(clickNow + 0.03);
    }, 600);
  }
  
  private playEmptyClick(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }
  
  private playMeleeSwing(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Whoosh
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
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2000, now + 0.15);
    filter.Q.setValueAtTime(2, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start(now);
  }
  
  private playMeleeHit(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Impact thud
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    // Noise layer
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.2));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.15);
  }
  
  private playShieldBlock(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Metallic clang
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(600, now);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }
  
  private playShieldBash(): void {
    this.playMeleeHit();
    setTimeout(() => this.playShieldBlock(), 50);
  }
  
  // ---------------------------------------------------------------------------
  // ENEMY SFX
  // ---------------------------------------------------------------------------
  
  private playEnemyHit(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }
  
  private playEnemyDeath(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Distorted growl
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(100);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  private playDemodogGrowl(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Low rumbling growl
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 20, now);
    
    // Tremolo
    const tremolo = this.audioContext.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(8, now);
    
    const tremoloGain = this.audioContext.createGain();
    tremoloGain.gain.setValueAtTime(0.3, now);
    
    tremolo.connect(tremoloGain);
    
    const mainGain = this.audioContext.createGain();
    mainGain.gain.setValueAtTime(volume * 0.25, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    tremoloGain.connect(mainGain.gain);
    
    osc.connect(mainGain);
    mainGain.connect(this.audioContext.destination);
    
    osc.start(now);
    tremolo.start(now);
    osc.stop(now + 0.5);
    tremolo.stop(now + 0.5);
  }
  
  private playDemobatScreech(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // High-pitched screech
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000 + Math.random() * 500, now);
    osc.frequency.linearRampToValueAtTime(3000, now + 0.1);
    osc.frequency.linearRampToValueAtTime(1500, now + 0.25);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  private playDemogorgonRoar(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Deep layered roar
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(60, now);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(120, now);
    
    // Distortion
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(200);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.1);
    gain.gain.setValueAtTime(volume * 0.4, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    
    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1);
    osc2.stop(now + 1);
  }
  
  private playMindFlayerPsychic(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Otherworldly psychic attack
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, now);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(203, now); // Slight detuning for beating
    
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5, now);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(50, now);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
    lfo.stop(now + 0.8);
  }
  
  // ---------------------------------------------------------------------------
  // ENVIRONMENT SFX
  // ---------------------------------------------------------------------------
  
  private playPortalOpen(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Rising whoosh
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.5);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }
  
  private playPortalHum(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(3, now);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(20, now);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 2);
    lfo.stop(now + 2);
  }
  
  private playHiveSpawn(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Wet emergence
    const bufferSize = this.audioContext.sampleRate * 0.4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI * 2) * (1 - t);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.25, now);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    noise.start(now);
  }
  
  private playHiveDestroy(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Explosion + splatter
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // Low boom
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    
    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(volume * 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.3, now);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    
    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  // ---------------------------------------------------------------------------
  // PLAYER SFX
  // ---------------------------------------------------------------------------
  
  private playPlayerDamage(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Low thump
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    
    const gain1 = this.audioContext.createGain();
    gain1.gain.setValueAtTime(volume * 0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    // High ping
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now);
    
    const gain2 = this.audioContext.createGain();
    gain2.gain.setValueAtTime(volume * 0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.15);
  }
  
  private playPlayerHeal(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Warm ascending tone
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }
  
  private playFootstep(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Simple thud with variation
    const freq = 80 + Math.random() * 40;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.05);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }
  
  // ---------------------------------------------------------------------------
  // UI SFX
  // ---------------------------------------------------------------------------
  
  private playPickup(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(volume * 0.15, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
  
  private playEvidenceFound(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Emotional discovery - longer, more meaningful
    const notes = [392, 440, 523.25, 659.25]; // G4, A4, C5, E5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);
      
      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(volume * 0.2, now + i * 0.2 + 0.1);
      gain.gain.setValueAtTime(volume * 0.18, now + i * 0.2 + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.8);
    });
  }
  
  private playWeaponPickup(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Empowering metal clang
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, now);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1600, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
    
    // Then pickup chime
    setTimeout(() => this.playPickup(), 200);
  }
  
  private playObjectiveComplete(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Achievement fanfare
    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(volume * 0.18, now + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }
  
  // ---------------------------------------------------------------------------
  // VECNA/HORROR SFX
  // ---------------------------------------------------------------------------
  
  private playClockTick(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
  
  private playClockChime(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Four deep chimes
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now + i * 0.8); // A3
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.8);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.8 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.8 + 0.7);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start(now + i * 0.8);
      osc.stop(now + i * 0.8 + 0.7);
    }
  }
  
  private playVecnaTeleport(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Reality tear
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    
    const distortion = this.audioContext.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(150);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc1.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.5);
  }
  
  private playVecnaWhisper(): void {
    if (!this.audioContext) return;
    
    const volume = this.masterVolume * this.sfxVolume;
    const now = this.audioContext.currentTime;
    
    // Eerie whisper effect
    const bufferSize = this.audioContext.sampleRate * 1.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.3;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(5, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.15, now);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    noise.start(now);
  }
  
  // ===========================================================================
  // UTILITIES
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
  // SOUND LOADING (for when audio files are available)
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
  // UPDATE & LIFECYCLE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    // Could be used for dynamic audio based on game state
  }
  
  public dispose(): void {
    this.stopMusic();
    this.stopAllOscillators();
    this.sounds.forEach((sound) => sound.dispose());
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default AudioManager;
