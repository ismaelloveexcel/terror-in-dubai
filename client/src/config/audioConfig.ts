/**
 * SAVE ISMAEL - Comprehensive Audio Configuration
 * ================================================
 * Premium Audio System with Placeholder Support
 * 
 * This file defines all audio assets for the game, including:
 * - Music tracks for all game states and levels
 * - Sound effects for weapons, enemies, UI, and environment
 * - Voice clips for story moments
 * - Procedural audio parameters for when files aren't available
 * 
 * USAGE:
 * - All audio files should be placed in /public/audio/
 * - File paths are relative to the public directory
 * - When useProcedural is true, the AudioManager generates sounds programmatically
 * - Volume ranges from 0.0 (silent) to 1.0 (full volume)
 */

// =============================================================================
// AUDIO FILE TYPES & INTERFACES
// =============================================================================

export interface AudioTrack {
  id: string;
  name: string;
  file: string | null;           // null = use procedural audio
  useProcedural: boolean;        // true = generate with Web Audio API
  volume: number;
  loop: boolean;
  fadeIn?: number;               // seconds
  fadeOut?: number;              // seconds
  description?: string;          // for documentation
}

export interface SFXConfig {
  id: string;
  name: string;
  file: string | null;
  useProcedural: boolean;
  volume: number;
  variations?: number;           // number of variant files (e.g., gunshot1.wav, gunshot2.wav)
  pitchVariation?: number;       // random pitch range (0.0-1.0)
  description?: string;
}

export interface VoiceClip {
  id: string;
  character: string;
  text: string;
  file: string | null;
  useProcedural: boolean;        // text-to-speech fallback
  duration: number;              // estimated duration in seconds
  level?: number;                // which level this plays on
  trigger?: string;              // when this clip plays
}

export interface ProceduralParams {
  type: 'oscillator' | 'noise' | 'complex';
  frequency?: number;
  waveform?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  duration: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filter?: {
    type: 'lowpass' | 'highpass' | 'bandpass';
    frequency: number;
    Q?: number;
  };
  modulation?: {
    frequency: number;
    depth: number;
  };
}

// =============================================================================
// VOLUME PRESETS
// =============================================================================

export const volumePresets = {
  // Master volume levels
  master: {
    default: 0.8,
    mobile: 0.9,    // Slightly louder for mobile speakers
    horror: 0.7,    // Quieter for jump scare impact
  },
  
  // Music volume by context
  music: {
    menu: 0.6,
    ambient: 0.4,
    exploration: 0.5,
    combat: 0.7,
    bossIntro: 0.8,
    bossFight: 0.75,
    victory: 0.65,
    credits: 0.55,
  },
  
  // SFX volume by category
  sfx: {
    weapons: 0.8,
    enemies: 0.75,
    environment: 0.6,
    ui: 0.7,
    footsteps: 0.4,
    impacts: 0.85,
    pickups: 0.7,
    horror: 0.9,      // Jump scares, Vecna moments
  },
  
  // Voice volume
  voice: {
    dialogue: 0.9,
    voiceNote: 0.85,
    mammooMessage: 0.95,
    vecnaTaunt: 0.8,
    mindFlayerRoar: 0.85,
  },
};

// =============================================================================
// MUSIC TRACKS - By Game State
// =============================================================================

export const musicTracks: Record<string, AudioTrack> = {
  // Main Menu
  menuTheme: {
    id: 'menu_theme',
    name: 'Main Menu Theme',
    file: null,  // 'audio/music/menu-theme.mp3',
    useProcedural: true,
    volume: volumePresets.music.menu,
    loop: true,
    fadeIn: 2.0,
    fadeOut: 1.5,
    description: 'Eerie, atmospheric synth with Stranger Things vibes - synth pads, distant thunder',
  },
  
  // Loading Screen
  loadingTheme: {
    id: 'loading_theme',
    name: 'Loading Screen',
    file: null,
    useProcedural: true,
    volume: 0.4,
    loop: true,
    description: 'Subtle pulsing drone, building tension',
  },
  
  // Prologue/Opening
  prologueTheme: {
    id: 'prologue_theme',
    name: 'Prologue',
    file: null,
    useProcedural: true,
    volume: volumePresets.music.ambient,
    loop: false,
    fadeIn: 3.0,
    description: 'Mammoo\'s voicemail scene - haunting, personal, emotional strings',
  },
  
  // Victory
  victoryTheme: {
    id: 'victory_theme',
    name: 'Victory',
    file: null,
    useProcedural: true,
    volume: volumePresets.music.victory,
    loop: false,
    fadeIn: 1.0,
    description: 'Triumphant but bittersweet - major key synths with emotional undertone',
  },
  
  // Game Over
  gameOverTheme: {
    id: 'gameover_theme',
    name: 'Game Over',
    file: null,
    useProcedural: true,
    volume: 0.5,
    loop: false,
    description: 'Vecna\'s clock chimes, slow descent into silence',
  },
  
  // Credits
  creditsTheme: {
    id: 'credits_theme',
    name: 'Credits Roll',
    file: null,  // 'audio/music/never-ending-story.mp3' - The Never Ending Story dedication!
    useProcedural: true,
    volume: volumePresets.music.credits,
    loop: false,
    fadeIn: 2.0,
    description: 'Hopeful, nostalgic - "Never Ending Story" style (Limahl tribute for Aidan)',
  },
  
  // Post-Credits Stinger
  postCreditsStinger: {
    id: 'postcredits_stinger',
    name: 'Post-Credits Stinger',
    file: null,
    useProcedural: true,
    volume: 0.6,
    loop: false,
    description: 'Clock chimes... then Vecna\'s whisper. "Sleep tight."',
  },
};

// =============================================================================
// MUSIC TRACKS - Level-Specific
// =============================================================================

export const levelMusic: Record<number, { ambient: AudioTrack; combat: AudioTrack; boss?: AudioTrack }> = {
  // Level 1 - Ibn Battuta Mall
  1: {
    ambient: {
      id: 'level1_ambient',
      name: 'Ibn Battuta Mall - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'Mall muzak corrupted - distorted easy listening, flickering lights, distant growls',
    },
    combat: {
      id: 'level1_combat',
      name: 'Ibn Battuta Mall - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Fast-paced synth chase music - 140 BPM, pulsing bass',
    },
  },
  
  // Level 2 - Dubai Metro
  2: {
    ambient: {
      id: 'level2_ambient',
      name: 'Dubai Metro - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'Underground industrial drones, distant train sounds, echoing tunnels',
    },
    combat: {
      id: 'level2_combat',
      name: 'Dubai Metro - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Industrial metal meets synth - grinding, urgent',
    },
    boss: {
      id: 'level2_boss',
      name: 'Demogorgon Fight',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.bossFight,
      loop: true,
      description: 'First boss theme - heavy, primal, creature-focused',
    },
  },
  
  // Level 3 - Dubai Frame
  3: {
    ambient: {
      id: 'level3_ambient',
      name: 'Dubai Frame - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'Vertigo-inducing - wind, height, glass creaking, disorientation',
    },
    combat: {
      id: 'level3_combat',
      name: 'Dubai Frame - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Aerial combat feel - soaring synths with danger undertones',
    },
  },
  
  // Level 4 - Dubai Marina
  4: {
    ambient: {
      id: 'level4_ambient',
      name: 'Dubai Marina - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'Waterfront horror - lapping waves, creaking boats, fog horns',
    },
    combat: {
      id: 'level4_combat',
      name: 'Dubai Marina - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Nautical nightmare - deep brass, urgent strings',
    },
    boss: {
      id: 'level4_boss',
      name: 'Mind Flayer Theme',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.bossFight,
      loop: true,
      fadeIn: 3.0,
      description: 'Cosmic horror - overwhelming, alien, psychic assault soundscape',
    },
  },
  
  // Level 5 - Downtown Dubai
  5: {
    ambient: {
      id: 'level5_ambient',
      name: 'Downtown Dubai - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'Apocalyptic cityscape - empty streets, distant echoes, abandoned grandeur',
    },
    combat: {
      id: 'level5_combat',
      name: 'Downtown Dubai - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Gauntlet music - relentless, escalating, survival horror',
    },
  },
  
  // Level 6 - Burj Khalifa
  6: {
    ambient: {
      id: 'level6_ambient',
      name: 'Burj Khalifa - Ambient',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.ambient,
      loop: true,
      description: 'The Throne awaits - ominous choir, clock ticking, Vecna\'s domain',
    },
    combat: {
      id: 'level6_combat',
      name: 'Burj Khalifa - Combat',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.combat,
      loop: true,
      description: 'Final approach - everything at stake, heroic undertones',
    },
    boss: {
      id: 'level6_boss',
      name: 'VECNA - Final Boss Theme',
      file: null,
      useProcedural: true,
      volume: volumePresets.music.bossFight,
      loop: true,
      fadeIn: 5.0,
      description: 'Four-phase epic - Stranger Things Season 4 finale energy, clock motifs, orchestra + synth',
    },
  },
};

// =============================================================================
// SOUND EFFECTS - Weapons
// =============================================================================

export const weaponSFX: Record<string, SFXConfig> = {
  // Pistol
  pistolFire: {
    id: 'pistol_fire',
    name: 'Pistol Fire',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.weapons,
    variations: 3,
    pitchVariation: 0.1,
    description: 'Sharp crack with echo',
  },
  pistolReload: {
    id: 'pistol_reload',
    name: 'Pistol Reload',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.weapons * 0.8,
    description: 'Magazine click, slide rack',
  },
  pistolEmpty: {
    id: 'pistol_empty',
    name: 'Pistol Empty Click',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.weapons * 0.6,
    description: 'Dry fire click',
  },
  
  // Nephew's Melee Weapons
  katanaSwing: {
    id: 'katana_swing',
    name: 'Katana Staff Swing',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.weapons,
    variations: 2,
    description: 'Whoosh with metallic ring',
  },
  katanaHit: {
    id: 'katana_hit',
    name: 'Katana Staff Hit',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Slashing impact, wet thunk',
  },
  nailBatSwing: {
    id: 'nailbat_swing',
    name: 'Nail Bat Swing',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.weapons,
    variations: 2,
    description: 'Heavy whoosh',
  },
  nailBatHit: {
    id: 'nailbat_hit',
    name: 'Nail Bat Impact',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Brutal thwack with nail piercing',
  },
  shieldBlock: {
    id: 'shield_block',
    name: 'Spiky Shield Block',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Metallic clang, reverb',
  },
  shieldBash: {
    id: 'shield_bash',
    name: 'Spiky Shield Bash',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Heavy metal slam with spike pierce',
  },
};

// =============================================================================
// SOUND EFFECTS - Enemies
// =============================================================================

export const enemySFX: Record<string, SFXConfig> = {
  // Demodog
  demodogGrowl: {
    id: 'demodog_growl',
    name: 'Demodog Growl',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    variations: 3,
    description: 'Low, rumbling, animalistic',
  },
  demodogAttack: {
    id: 'demodog_attack',
    name: 'Demodog Attack',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    description: 'Pounce snarl',
  },
  demodogDeath: {
    id: 'demodog_death',
    name: 'Demodog Death',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    description: 'Whimper-screech fade',
  },
  
  // Demobat
  demobatScreech: {
    id: 'demobat_screech',
    name: 'Demobat Screech',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    variations: 2,
    pitchVariation: 0.2,
    description: 'High-pitched bat cry',
  },
  demobatWingFlap: {
    id: 'demobat_wings',
    name: 'Demobat Wings',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies * 0.5,
    description: 'Leathery wing beats',
  },
  demobatDive: {
    id: 'demobat_dive',
    name: 'Demobat Dive Attack',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    description: 'Swooping screech',
  },
  
  // Demogorgon
  demogorgonRoar: {
    id: 'demogorgon_roar',
    name: 'Demogorgon Roar',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies * 1.2,
    description: 'Earth-shaking, multi-layered',
  },
  demogorgonFootstep: {
    id: 'demogorgon_step',
    name: 'Demogorgon Footstep',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies * 0.7,
    description: 'Heavy, wet, ominous',
  },
  
  // Mind Flayer
  mindFlayerPsychic: {
    id: 'mindflayer_psychic',
    name: 'Mind Flayer Psychic Attack',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Distorted, inside-your-head sound',
  },
  mindFlayerSpawn: {
    id: 'mindflayer_spawn',
    name: 'Mind Flayer Spawns Creature',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    description: 'Wet birthing, flesh tearing',
  },
  mindFlayerPresence: {
    id: 'mindflayer_presence',
    name: 'Mind Flayer Presence',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror * 0.8,
    description: 'Low rumble with alien harmonics',
  },
  
  // Vecna
  vecnaClockTick: {
    id: 'vecna_clock_tick',
    name: 'Vecna Clock Tick',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'THE tick - ominous grandfather clock',
  },
  vecnaClockChime: {
    id: 'vecna_clock_chime',
    name: 'Vecna Clock Chime',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Four deep chimes - death approaches',
  },
  vecnaTeleport: {
    id: 'vecna_teleport',
    name: 'Vecna Teleport',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Reality tear, void whoosh',
  },
  vecnaGrab: {
    id: 'vecna_grab',
    name: 'Vecna Telekinetic Grab',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Choking, lifting, helpless',
  },
  vecnaWhisper: {
    id: 'vecna_whisper',
    name: 'Vecna Whisper',
    file: null,
    useProcedural: true,
    volume: volumePresets.voice.vecnaTaunt,
    description: 'Echoing, inside your mind',
  },
  vecnaPhaseChange: {
    id: 'vecna_phase',
    name: 'Vecna Phase Transition',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Power surge, reality warp',
  },
};

// =============================================================================
// SOUND EFFECTS - Environment
// =============================================================================

export const environmentSFX: Record<string, SFXConfig> = {
  // Portal/Rift
  portalOpen: {
    id: 'portal_open',
    name: 'Portal Opening',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment,
    description: 'Reality tearing, dimensional breach',
  },
  portalHum: {
    id: 'portal_hum',
    name: 'Portal Ambient Hum',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.6,
    description: 'Constant otherworldly vibration',
  },
  portalClose: {
    id: 'portal_close',
    name: 'Portal Closing',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment,
    description: 'Implosion, snap shut',
  },
  
  // Corruption
  hiveSpawn: {
    id: 'hive_spawn',
    name: 'Hive Spawning Enemy',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.enemies,
    description: 'Wet emergence, birthing',
  },
  hivePulse: {
    id: 'hive_pulse',
    name: 'Hive Pulse',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.7,
    description: 'Organic heartbeat, pulsing',
  },
  hiveDestroy: {
    id: 'hive_destroy',
    name: 'Hive Destruction',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Explosive organic splatter',
  },
  vineGrow: {
    id: 'vine_grow',
    name: 'Vine Growth',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.5,
    description: 'Creeping, stretching, organic',
  },
  
  // Dubai Environment
  mallAmbience: {
    id: 'mall_ambience',
    name: 'Mall Ambience (Corrupted)',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.4,
    description: 'Distant muzak, flickering lights, dripping',
  },
  metroTrain: {
    id: 'metro_train',
    name: 'Metro Train (Distant)',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.5,
    description: 'Rumbling, screeching, but wrong',
  },
  windHeight: {
    id: 'wind_height',
    name: 'High-Altitude Wind',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.6,
    description: 'Howling wind, vertigo-inducing',
  },
  waterLapping: {
    id: 'water_lap',
    name: 'Marina Water',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.4,
    description: 'Black water, sluggish, ominous',
  },
  glassCreak: {
    id: 'glass_creak',
    name: 'Glass Structure Creaking',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.environment * 0.5,
    description: 'Structural stress, impending collapse',
  },
};

// =============================================================================
// SOUND EFFECTS - Player
// =============================================================================

export const playerSFX: Record<string, SFXConfig> = {
  footstepConcrete: {
    id: 'footstep_concrete',
    name: 'Footstep - Concrete',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.footsteps,
    variations: 4,
    pitchVariation: 0.1,
    description: 'Solid, echoing',
  },
  footstepMetal: {
    id: 'footstep_metal',
    name: 'Footstep - Metal Grate',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.footsteps,
    variations: 4,
    description: 'Metallic ring, hollow',
  },
  footstepWater: {
    id: 'footstep_water',
    name: 'Footstep - Shallow Water',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.footsteps,
    variations: 4,
    description: 'Splashing, wet',
  },
  footstepOrganicMatter: {
    id: 'footstep_organic',
    name: 'Footstep - Corruption/Vines',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.footsteps * 1.2,
    variations: 3,
    description: 'Squelching, unsettling',
  },
  
  playerDamage: {
    id: 'player_damage',
    name: 'Player Takes Damage',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.impacts,
    description: 'Impact grunt, heartbeat spike',
  },
  playerHeal: {
    id: 'player_heal',
    name: 'Player Heals',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups,
    description: 'Soothing chime, warmth',
  },
  playerDeath: {
    id: 'player_death',
    name: 'Player Death',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.horror,
    description: 'Heartbeat stops, fade to void',
  },
  playerSprint: {
    id: 'player_sprint',
    name: 'Sprint Breathing',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.footsteps * 0.5,
    description: 'Heavy breathing, exertion',
  },
};

// =============================================================================
// SOUND EFFECTS - UI
// =============================================================================

export const uiSFX: Record<string, SFXConfig> = {
  menuHover: {
    id: 'menu_hover',
    name: 'Menu Hover',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui * 0.6,
    description: 'Subtle blip',
  },
  menuSelect: {
    id: 'menu_select',
    name: 'Menu Select',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui,
    description: 'Confirm beep',
  },
  menuBack: {
    id: 'menu_back',
    name: 'Menu Back',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui * 0.8,
    description: 'Cancel/back sound',
  },
  
  pickup: {
    id: 'pickup',
    name: 'Item Pickup',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups,
    description: 'Satisfying collection chime',
  },
  evidenceFound: {
    id: 'evidence_found',
    name: 'Evidence Found',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups * 1.2,
    description: 'Emotional discovery sound - story moment',
  },
  weaponPickup: {
    id: 'weapon_pickup',
    name: 'Weapon Pickup',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups,
    description: 'Metallic equip, empowering',
  },
  healthPickup: {
    id: 'health_pickup',
    name: 'Health Pack Pickup',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups,
    description: 'Medical, restorative',
  },
  ammoPickup: {
    id: 'ammo_pickup',
    name: 'Ammo Pickup',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.pickups,
    description: 'Clip/shells loading sound',
  },
  
  objectiveComplete: {
    id: 'objective_complete',
    name: 'Objective Complete',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui,
    description: 'Achievement unlocked feel',
  },
  objectiveNew: {
    id: 'objective_new',
    name: 'New Objective',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui,
    description: 'Alert, attention',
  },
  levelComplete: {
    id: 'level_complete',
    name: 'Level Complete',
    file: null,
    useProcedural: true,
    volume: volumePresets.sfx.ui * 1.2,
    description: 'Triumphant fanfare',
  },
};

// =============================================================================
// VOICE CLIPS - Story Moments
// =============================================================================

export const voiceClips: VoiceClip[] = [
  // Opening Voicemail from Mammoo
  {
    id: 'mammoo_voicemail',
    character: 'Mammoo Ismael',
    text: 'Aidan... something\'s wrong... I\'m still in Dubai but it\'s... not Dubai...',
    file: null,
    useProcedural: true,
    duration: 45,
    level: 0,
    trigger: 'prologue',
  },
  
  // Level 1 Evidence Voice Note
  {
    id: 'voicenote_level1',
    character: 'Mammoo Ismael',
    text: 'Okay... documenting this. I\'m in the mall but something\'s wrong...',
    file: null,
    useProcedural: true,
    duration: 30,
    level: 1,
    trigger: 'evidenceCollected',
  },
  
  // Level 2 Evidence Voice Note
  {
    id: 'voicenote_level2',
    character: 'Mammoo Ismael',
    text: 'Day 2. I think. Hard to tell - there\'s no sun, no moon, just... red.',
    file: null,
    useProcedural: true,
    duration: 35,
    level: 2,
    trigger: 'evidenceCollected',
  },
  
  // Level 3 Evidence Voice Note
  {
    id: 'voicenote_level3',
    character: 'Mammoo Ismael',
    text: 'Aidan, if you find this... don\'t come after me. I mean it.',
    file: null,
    useProcedural: true,
    duration: 40,
    level: 3,
    trigger: 'evidenceCollected',
  },
  
  // Level 5 - Gift Bag Note
  {
    id: 'voicenote_level5',
    character: 'Mammoo Ismael',
    text: 'Aidan - Thought we could do a marathon this weekend. Got snacks too.',
    file: null,
    useProcedural: true,
    duration: 15,
    level: 5,
    trigger: 'evidenceCollected',
  },
  
  // Level 6 - Final Voice Note
  {
    id: 'voicenote_level6',
    character: 'Mammoo Ismael',
    text: 'Aidan... if you\'re hearing this, you found me. Or what\'s left of me.',
    file: null,
    useProcedural: true,
    duration: 50,
    level: 6,
    trigger: 'evidenceCollected',
  },
  
  // Vecna Boss Lines
  {
    id: 'vecna_intro1',
    character: 'Vecna',
    text: 'Aidan. Welcome to the top of the world. Or what\'s left of it.',
    file: null,
    useProcedural: true,
    duration: 6,
    level: 6,
    trigger: 'bossIntro',
  },
  {
    id: 'vecna_taunt1',
    character: 'Vecna',
    text: 'Your uncle screamed louder than you shoot.',
    file: null,
    useProcedural: true,
    duration: 4,
    level: 6,
    trigger: 'bossPhase1',
  },
  {
    id: 'vecna_phase2',
    character: 'Vecna',
    text: 'Show me your fears, child...',
    file: null,
    useProcedural: true,
    duration: 3,
    level: 6,
    trigger: 'bossPhase2',
  },
  {
    id: 'vecna_defeat',
    character: 'Vecna',
    text: 'This isn\'t... possible... I am ETERNAL...',
    file: null,
    useProcedural: true,
    duration: 8,
    level: 6,
    trigger: 'bossDefeat',
  },
  
  // Mind Flayer Boss Lines
  {
    id: 'mindflayer_intro',
    character: 'Mind Flayer',
    text: 'THE UNCLE STRUGGLED. HE FOUGHT. IT WAS... ENTERTAINING.',
    file: null,
    useProcedural: true,
    duration: 5,
    level: 4,
    trigger: 'bossIntro',
  },
  
  // Mammoo Rescue
  {
    id: 'mammoo_found',
    character: 'Mammoo Ismael',
    text: 'Aidan... you came... why did you...',
    file: null,
    useProcedural: true,
    duration: 5,
    level: 5,
    trigger: 'mammooFound',
  },
  {
    id: 'mammoo_finalbattle',
    character: 'Mammoo Ismael',
    text: 'AIDAN! He\'s still connected to me! His grip is weakest when he\'s angry! NOW!',
    file: null,
    useProcedural: true,
    duration: 6,
    level: 6,
    trigger: 'finalPhase',
  },
];

// =============================================================================
// PROCEDURAL AUDIO PARAMETERS
// =============================================================================

export const proceduralParams: Record<string, ProceduralParams> = {
  // Ambient Drone (current implementation)
  ambientDrone: {
    type: 'oscillator',
    frequency: 55, // A1
    waveform: 'sine',
    duration: -1, // infinite loop
    modulation: {
      frequency: 0.5, // LFO
      depth: 5,
    },
  },
  
  // Combat Music Base
  combatPulse: {
    type: 'oscillator',
    frequency: 110, // A2
    waveform: 'square',
    duration: -1,
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.2,
    },
    filter: {
      type: 'lowpass',
      frequency: 800,
      Q: 5,
    },
  },
  
  // Boss Theme Elements
  bossOminous: {
    type: 'complex',
    frequency: 40, // Sub bass
    waveform: 'sawtooth',
    duration: -1,
    filter: {
      type: 'lowpass',
      frequency: 200,
    },
    modulation: {
      frequency: 0.1,
      depth: 10,
    },
  },
  
  // Vecna Clock
  clockTick: {
    type: 'oscillator',
    frequency: 1000,
    waveform: 'sine',
    duration: 0.05,
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0.1,
      release: 0.02,
    },
  },
  
  // Clock Chime
  clockChime: {
    type: 'oscillator',
    frequency: 220, // A3
    waveform: 'sine',
    duration: 0.7,
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.5,
      release: 0.3,
    },
  },
  
  // Gunshot
  gunshot: {
    type: 'noise',
    duration: 0.1,
    envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0.1,
      release: 0.06,
    },
    filter: {
      type: 'highpass',
      frequency: 500,
    },
  },
  
  // Portal Hum
  portalHum: {
    type: 'complex',
    frequency: 80,
    waveform: 'triangle',
    duration: -1,
    modulation: {
      frequency: 3,
      depth: 20,
    },
    filter: {
      type: 'bandpass',
      frequency: 400,
      Q: 2,
    },
  },
};

// =============================================================================
// MASTER AUDIO CONFIG EXPORT
// =============================================================================

export const audioConfigComplete = {
  enabled: true,
  
  // Volume Settings
  volumes: volumePresets,
  
  // Music
  music: {
    tracks: musicTracks,
    levels: levelMusic,
  },
  
  // Sound Effects
  sfx: {
    weapons: weaponSFX,
    enemies: enemySFX,
    environment: environmentSFX,
    player: playerSFX,
    ui: uiSFX,
  },
  
  // Voice
  voice: {
    clips: voiceClips,
  },
  
  // Procedural Audio
  procedural: proceduralParams,
  
  // File paths (for when audio files are added)
  paths: {
    music: '/audio/music/',
    sfx: '/audio/sfx/',
    voice: '/audio/voice/',
  },
};

export default audioConfigComplete;
