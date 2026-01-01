// Game Configuration - Save Ismael
// Premium Shippable Web Quality

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
};

const getEnvString = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// =============================================================================
// GAME CONFIG
// =============================================================================

export const gameConfig = {
  // Story Configuration
  playerName: getEnvString('VITE_PLAYER_NAME', 'Aidan'),
  nephewName: getEnvString('VITE_PLAYER_NAME', 'Aidan'), // Alias for backward compatibility
  rescueTarget: getEnvString('VITE_RESCUE_TARGET', 'Mammoo Ismael'),
  familyMode: getEnvBoolean('VITE_FAMILY_MODE', true),
  
  // Game State
  currentLevel: 1,
  maxLevels: 6,
  
  // Debug
  debug: import.meta.env.DEV,
};

// =============================================================================
// VISUAL DIRECTION - Premium Stylized-Realistic PBR
// =============================================================================

export const visualConfig = {
  // Color Palette - Enhanced for visual impact
  colors: {
    // Primary
    shadowDark: '#0a0a12',      // Deep navy/black shadows
    infectionPrimary: '#00ffcc', // Teal bioluminescent
    infectionSecondary: '#39ff14', // Sickly green
    navigationWarm: '#ff6b00',   // Orange emergency lights
    dangerRed: '#8b0000',        // Boss areas
    
    // Secondary
    metalGunmetal: '#2a2d35',    // Dubai architecture
    concreteWet: '#4a4a4a',      // Floors, walls
    goldTarnished: '#8b7355',    // Corrupted luxury
    waterBlack: '#0a0a0a',       // Standing water
    
    // Enhanced accent colors
    vecnaPurple: '#660066',      // Vecna's aura
    portalViolet: '#9900ff',     // Dimensional rifts
    memoryGold: '#ffd700',       // Memory/evidence glow
    healthGreen: '#00ff66',      // Health pickups
  },
  
  // Atmosphere
  fog: {
    enabled: true,
    color: { r: 0.04, g: 0.04, b: 0.07 }, // Deep navy with teal tint
    density: 0.015,
    start: 10,
    end: 80,
  },
  
  // Ambient Light
  ambient: {
    intensity: 0.1,
    color: { r: 0.04, g: 0.04, b: 0.1 }, // Deep blue
  },
  
  // Post-Processing - Enhanced for cinematic feel
  postProcess: {
    bloom: {
      enabled: true,
      threshold: 0.5,       // Lower threshold = more bloom
      weight: 0.5,          // Stronger bloom weight
      kernel: 64,
      scale: 0.6,
    },
    vignette: {
      enabled: true,
      weight: 1.5,          // Darker edges for horror feel
      color: { r: 0.15, g: 0, b: 0.05 }, // Slight purple tint
    },
    chromaticAberration: {
      enabled: true,
      amount: 15,           // More distortion for unsettling effect
    },
    grain: {
      enabled: true,
      intensity: 0.08,      // More visible grain for film quality
    },
    // New effects
    depthOfField: {
      enabled: false,       // Disable by default for performance
      focalLength: 100,
      fStop: 2.8,
      focusDistance: 5,
    },
    sharpen: {
      enabled: true,
      edge: 0.3,
      intensity: 0.2,
    },
  },
  
  // Mobile-optimized visuals
  mobileVisuals: {
    fog: {
      enabled: true,
      density: 0.012,       // Less fog for better visibility
    },
    bloom: {
      enabled: true,
      threshold: 0.7,
      weight: 0.3,
      kernel: 32,
      scale: 0.4,
    },
    reducedParticles: true,
    simplifiedLighting: true,
  },
};

// =============================================================================
// PLAYER CONFIGURATION
// =============================================================================

export const playerConfig = {
  // Movement
  walkSpeed: 5,
  sprintSpeed: 8,
  crouchSpeed: 2.5,
  
  // Physics
  height: 1.8,
  radius: 0.4,
  mass: 80,
  jumpForce: 8,
  
  // Camera
  fov: 75,
  sensitivity: 0.002,
  
  // Health
  maxHealth: 100,
  healthRegenDelay: 5, // seconds before regen starts
  healthRegenRate: 5,  // HP per second
  
  // Stamina
  maxStamina: 100,
  staminaDrainRate: 20, // per second while sprinting
  staminaRegenRate: 15, // per second
};

// =============================================================================
// WEAPON CONFIGURATION
// =============================================================================

export const weaponConfig = {
  pistol: {
    name: 'Service Pistol',
    damage: 25,
    fireRate: 0.15,    // seconds between shots
    range: 100,
    recoil: 0.02,
    magazineSize: 15,
    reloadTime: 1.5,
    spread: 0.01,
  },
};

// =============================================================================
// ENEMY TYPES - Constants for type-safe enemy references
// =============================================================================

export const ENEMY_TYPES = {
  DEMODOG: 'demodog',
  DEMOBAT: 'demobat',
  DEMOGORGON: 'demogorgon',
  SWARM: 'swarm',
  FLYING: 'flying',
  ELITE: 'elite',
  BOSS: 'boss',
  MIND_FLAYER: 'mindFlayer',
  VECNA: 'vecna',
} as const;

// =============================================================================
// ENEMY CONFIGURATION
// =============================================================================

export const enemyConfig = {
  demodog: {
    name: 'Demodog',
    health: 50,
    damage: 10,
    speed: 4,
    attackRange: 2,
    attackCooldown: 1.5,
    detectionRange: 20,
    points: 100,
  },
  demobat: {
    name: 'Demobat',
    health: 30,
    damage: 8,
    speed: 6,
    attackRange: 1.5,
    attackCooldown: 1,
    detectionRange: 25,
    flyHeight: 2.5,
    points: 75,
  },
  demogorgon: {
    name: 'Demogorgon',
    health: 150,
    damage: 25,
    speed: 3,
    attackRange: 3,
    attackCooldown: 2,
    detectionRange: 30,
    points: 500,
  },
  mindFlayer: {
    name: 'Mind Flayer',
    health: 1000,
    damage: 30,
    speed: 2,
    attackRange: 25,
    attackCooldown: 3,
    detectionRange: 50,
    phases: 3,
    points: 2000,
  },
  vecna: {
    name: 'Vecna',
    health: 2000,
    damage: 40,
    speed: 3,
    attackRange: 40,
    attackCooldown: 2.5,
    detectionRange: 100,
    phases: 4,
    points: 5000,
  },
  // New enemy types for spawners
  swarm: {
    name: 'Swarm Creature',
    health: 25,
    damage: 5,
    speed: 5,
    attackRange: 1.5,
    attackCooldown: 1,
    detectionRange: 15,
    points: 50,
  },
  flying: {
    name: 'Flying Terror',
    health: 35,
    damage: 8,
    speed: 6,
    attackRange: 2,
    attackCooldown: 2,
    detectionRange: 25,
    points: 75,
  },
  elite: {
    name: 'Elite Horror',
    health: 200,
    damage: 30,
    speed: 2.5,
    attackRange: 3,
    attackCooldown: 1.5,
    detectionRange: 35,
    points: 300,
  },
  boss: {
    name: 'Boss',
    health: 500,
    damage: 25,
    speed: 2,
    attackRange: 5,
    attackCooldown: 3,
    detectionRange: 50,
    points: 1000,
  },
};

// Type-safe alias for enemy configs
export const enemyConfigs = enemyConfig;

// =============================================================================
// LEVEL CONFIGURATION
// =============================================================================

export const levelConfig = {
  1: {
    id: 'ibn-battuta-mall',
    name: 'Ibn Battuta Mall',
    subtitle: 'The Entry',
    duration: '8-10 min',
    enemies: { demodogs: 15, demobats: 8 },
    objectives: ['Find Mammoo\'s car', 'Destroy 3 Hives', 'Reach the Metro'],
    evidence: { item: 'Car Keys + Parking Ticket', location: 'Persia Court' },
  },
  2: {
    id: 'dubai-metro',
    name: 'Dubai Metro',
    subtitle: 'The Tunnels',
    duration: '10-12 min',
    enemies: { demodogs: 20, demobats: 15, demogorgons: 1 },
    objectives: ['Navigate the tunnels', 'Defeat the Demogorgon', 'Reach the surface'],
    evidence: { item: 'Wallet', location: 'Abandoned Train Car' },
    hasBoss: true,
    bossType: 'demogorgon',
  },
  3: {
    id: 'dubai-frame',
    name: 'Dubai Frame',
    subtitle: 'The Window',
    duration: '12-15 min',
    enemies: { demodogs: 25, demobats: 20, demogorgons: 2 },
    objectives: ['Climb the Frame', 'Find the phone', 'Escape before collapse'],
    evidence: { item: 'Cracked Phone', location: 'Observation Deck' },
    hasEscapeSequence: true,
  },
  4: {
    id: 'dubai-marina',
    name: 'Dubai Marina',
    subtitle: 'The Trap',
    duration: '15-18 min',
    enemies: { demodogs: 30, demobats: 20, shadowClones: 10 },
    objectives: ['Navigate the Marina', 'Defeat the Mind Flayer', 'Find Mammoo\'s watch'],
    evidence: { item: 'Watch', location: 'Yacht Deck' },
    hasBoss: true,
    bossType: 'mindFlayer',
  },
  5: {
    id: 'downtown-dubai',
    name: 'Downtown Dubai',
    subtitle: 'The Heart',
    duration: '12-15 min',
    enemies: { demodogs: 40, demobats: 25, demogorgons: 3 },
    objectives: ['Cross Dubai Mall', 'Find Mammoo Ismael', 'Free him from Vecna\'s grip'],
    evidence: { item: 'Gift Bag', location: 'Fountain Base' },
    hasGauntlet: true,
  },
  6: {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    subtitle: 'The Throne',
    duration: '18-22 min',
    enemies: { demodogs: 50, demobats: 30, demogorgons: 4 },
    objectives: ['Ascend the tower', 'Defeat Vecna', 'Escape with Mammoo'],
    evidence: { item: 'His Phone', location: 'Observation Deck' },
    hasBoss: true,
    bossType: 'vecna',
    isFinalLevel: true,
  },
};

// =============================================================================
// PERFORMANCE CONFIGURATION
// =============================================================================

// =============================================================================
// MOBILE DETECTION
// =============================================================================

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

// =============================================================================
// SETTINGS SYSTEM
// =============================================================================

export interface GameSettings {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  
  // Graphics
  graphicsQuality: 'low' | 'medium' | 'high';
  postProcessing: boolean;
  particles: boolean;
  shadows: boolean;
  
  // Controls
  sensitivity: number;
  invertY: boolean;
  
  // Accessibility
  showFPS: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Difficulty
  difficulty: 'easy' | 'normal' | 'hard';
}

// Default settings
export const defaultSettings: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  graphicsQuality: 'high',
  postProcessing: true,
  particles: true,
  shadows: true,
  sensitivity: 1.0,
  invertY: false,
  showFPS: false,
  reducedMotion: false,
  highContrast: false,
  difficulty: 'normal'
};

// Current settings (load from localStorage)
export const settings: GameSettings = { ...defaultSettings };

// Load settings from localStorage
function loadSettings(): void {
  const stored = localStorage.getItem('gameSettings');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(settings, parsed);
    } catch (e) {
      console.warn('Failed to load settings, using defaults');
    }
  }
}

// Save settings to localStorage
export function saveSettings(): void {
  localStorage.setItem('gameSettings', JSON.stringify(settings));
}

// Update a setting
export function updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
  settings[key] = value;
  saveSettings();
}

// Toggle family mode
export function toggleFamilyMode(): void {
  gameConfig.familyMode = !gameConfig.familyMode;
  localStorage.setItem('familyMode', String(gameConfig.familyMode));
}

// Set rescue target name
export function setRescueTarget(name: string): void {
  gameConfig.rescueTarget = name;
  localStorage.setItem('rescueTarget', name);
}

// Get difficulty multipliers
export function getDifficultyMultipliers(): { health: number; damage: number; enemyDamage: number } {
  switch (settings.difficulty) {
    case 'easy':
      return { health: 1.5, damage: 1.2, enemyDamage: 0.5 };
    case 'hard':
      return { health: 0.75, damage: 1.0, enemyDamage: 1.5 };
    default:
      return { health: 1.0, damage: 1.0, enemyDamage: 1.0 };
  }
}

// Initialize settings on load
loadSettings();

// =============================================================================
// PERFORMANCE CONFIGURATION
// =============================================================================

export const performanceConfig = {
  isMobile,
  
  // Rendering
  renderScale: isMobile ? 0.75 : 1.0,
  targetFPS: isMobile ? 30 : 60,
  
  // Shadows
  shadowsEnabled: !isMobile,
  shadowMapSize: isMobile ? 512 : 1024,
  
  // Particles
  particlesEnabled: true,
  particleLimit: isMobile ? 50 : 200,
  
  // Post-Processing
  postProcessEnabled: !isMobile,
  bloomEnabled: !isMobile,
  
  // LOD
  lodEnabled: true,
  lodDistance: isMobile ? 30 : 50,
  
  // Draw Calls
  maxDrawCalls: isMobile ? 80 : 150,
  
  // Enemies
  maxEnemies: isMobile ? 10 : 20,
};

// =============================================================================
// AUDIO CONFIGURATION (Legacy - see audioConfig.ts for full system)
// =============================================================================

export const audioConfig = {
  enabled: true,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  voiceVolume: 0.9,
  
  // Use procedural audio when files not available
  useProcedural: true,
  
  // Music (placeholder file names - use audioConfig.ts for full config)
  music: {
    menu: 'menu-theme.mp3',
    ambient: 'ambient-drone.mp3',
    combat: 'combat-theme.mp3',
    boss: 'boss-theme.mp3',
    victory: 'victory.mp3',
    credits: 'never-ending-story.mp3', // Never Ending Story dedication for Aidan!
    gameOver: 'game-over.mp3',
  },
  
  // SFX (placeholder file names)
  sfx: {
    // Weapons
    gunshot: 'gunshot.wav',
    reload: 'reload.wav',
    empty: 'empty-click.wav',
    meleeSwing: 'melee-swing.wav',
    meleeHit: 'melee-hit.wav',
    
    // Enemies  
    enemyHit: 'enemy-hit.wav',
    enemyDeath: 'enemy-death.wav',
    demodogGrowl: 'demodog-growl.wav',
    demobatScreech: 'demobat-screech.wav',
    demogorgonRoar: 'demogorgon-roar.wav',
    
    // Player
    playerDamage: 'player-damage.wav',
    playerHeal: 'player-heal.wav',
    playerDeath: 'player-death.wav',
    footstep: 'footstep.wav',
    
    // Environment
    portalOpen: 'portal-open.wav',
    portalHum: 'portal-hum.wav',
    hiveSpawn: 'hive-spawn.wav',
    hiveDestroy: 'hive-destroy.wav',
    
    // UI/Pickups
    pickup: 'pickup.wav',
    evidenceFound: 'evidence-found.wav',
    weaponPickup: 'weapon-pickup.wav',
    objectiveComplete: 'objective-complete.wav',
    
    // Vecna/Horror
    clockTick: 'clock-tick.wav',
    clockChime: 'clock-chime.wav',
    vecnaTeleport: 'vecna-teleport.wav',
    vecnaWhisper: 'vecna-whisper.wav',
    mindFlayerPsychic: 'mindflayer-psychic.wav',
  },
  
  // Voice (placeholder - see audioConfig.ts for full voice clip system)
  voice: {
    mammooVoicemail: 'mammoo-voicemail.mp3',
    vecnaTaunts: 'vecna-taunts.mp3',
  },
  
  // Level-specific music keys
  levelMusic: {
    1: { ambient: 'level1-ambient', combat: 'level1-combat' },
    2: { ambient: 'level2-ambient', combat: 'level2-combat', boss: 'level2-boss' },
    3: { ambient: 'level3-ambient', combat: 'level3-combat' },
    4: { ambient: 'level4-ambient', combat: 'level4-combat', boss: 'level4-boss' },
    5: { ambient: 'level5-ambient', combat: 'level5-combat' },
    6: { ambient: 'level6-ambient', combat: 'level6-combat', boss: 'level6-boss' },
  },
};

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const uiConfig = {
  // HUD
  hud: {
    healthBarWidth: 200,
    healthBarHeight: 20,
    ammoFontSize: 24,
    objectiveFontSize: 18,
  },
  
  // Crosshair
  crosshair: {
    size: 20,
    thickness: 2,
    gap: 6,
    color: '#ffffff',
    hitColor: '#ff0000',
  },
  
  // Damage Indicator
  damageIndicator: {
    duration: 0.3,
    color: 'rgba(139, 0, 0, 0.5)',
  },
  
  // Evidence Popup
  evidencePopup: {
    duration: 5,
    fadeTime: 0.5,
  },
};

// =============================================================================
// STORY CONTENT
// =============================================================================

export const storyConfig = {
  // Opening Voicemail
  openingMessage: `Aidan... something's wrong... I'm still in Dubai but it's... not Dubai... everything's dead here... twisted... I tried to leave but the roads loop back... there's something hunting me... I can hear a clock ticking but there's no clock... I'm heading toward the Frame... maybe I can see a way out from up there... find me... please...`,
  
  // Evidence Voice Notes per Level
  voiceNotes: {
    1: `Okay... documenting this. I'm in the mall but something's wrong. The lights went out, then came back, but everything's... off. There's no one here. I'm heading to the exit. If anyone finds this—`,
    2: `Day 2. I think. Hard to tell - there's no sun, no moon, just... red. I made it to the Metro but the trains don't go anywhere. I walked for hours. The tunnels loop. I'm going to try the surface, head for the Frame. If I can get high enough, maybe I can see a way out.`,
    3: `Aidan, if you find this... don't come after me. I mean it. There's something here - not just the creatures. Something that thinks. I saw it. It looked like a man, but it moved wrong. It spoke to me. In my head. It said it's been waiting. That I'm 'interesting.' That my memories of you are 'valuable.' I have to keep moving. I'm heading toward the Marina - there are boats, maybe I can... I don't know. Just... I'm sorry I missed movie night.`,
    4: null, // Watch has no recording, just inscription
    5: `Aidan - Thought we could do a marathon this weekend. Got snacks too (in the car). See you tonight. - Mammoo I`,
    6: `Aidan... if you're hearing this, you found me. Or what's left of me. I don't know how much longer I can hold on. He's taking everything. My memories. My thoughts. But I keep thinking about you. About movie nights. About the stupid jokes. About how you always steal my popcorn. He can't have those. I won't let him. If you made it this far... finish it.`,
  },
  
  // Environmental story hints scattered in levels
  environmentalStory: {
    level1: [
      'Abandoned shopping bags litter the marble floors...',
      'The fountain water has turned black and still.',
      'Vines pulse with an eerie bioluminescent glow.',
    ],
    level2: [
      'Train announcement boards flicker with corrupted text...',
      'Emergency lights cast long shadows down endless tunnels.',
      'The distant rumble isn\'t a train anymore.',
    ],
    level3: [
      'The glass shows two Dubais - one alive, one dead.',
      'Something moves in the reflection that isn\'t there.',
      'The height feels wrong, like gravity is confused.',
    ],
    level4: [
      'Capsized yachts drift in water that doesn\'t ripple.',
      'Restaurant tables still set for dinners never eaten.',
      'The Marina\'s famous lights flicker in patterns... a warning?',
    ],
    level5: [
      'The frozen fountain captures a moment of panic.',
      'Aquarium glass cracked, but nothing escaped - nothing living.',
      'Gift shops display souvenirs from a world that was.',
    ],
    level6: [
      'The elevator shaft descends into infinite darkness.',
      'Every floor holds echoes of Vecna\'s thousand years.',
      'At the top, a throne made of memories waits.',
    ],
  },
  
  // Vecna Dialogue
  vecnaDialogue: {
    firstContact: `Do you see it? Your world. So close. You could almost touch it. But you can't go back. Not until I let you. And I don't let anyone go.`,
    
    bossIntro: [
      `Aidan. Welcome to the top of the world. Or what's left of it.`,
      `I was like you once. Young. Determined. Convinced that the people I cared about mattered.`,
      `They don't. People disappoint. They leave. They die. But memories... memories are forever.`,
      `Your uncle's are among the brightest I've seen.`,
      `Defiance. How predictable. Very well.`,
    ],
    
    // Enhanced boss phases with more dramatic dialogue
    phase1Taunt: [
      `You fight like a child playing at war.`,
      `Is this the best the mortal world can offer?`,
      `Your uncle screamed louder than you shoot.`,
    ],
    
    phase2: `Show me your fears, child...`,
    phase2Fail: `What is this? These memories... they're not fear... they're not pain... what ARE you?`,
    
    phase3: `My shadow! FINISH THIS!`,
    phase3Rage: [
      `IMPOSSIBLE! A mortal cannot resist me!`,
      `The bond between you... it burns...`,
      `Your memories are POISON!`,
    ],
    
    phase4: [
      `A THOUSAND YEARS I'VE EXISTED!`,
      `I'VE CONSUMED MINDS BEYOND COUNTING!`,
      `YOU ARE NOTHING!`,
    ],
    
    defeat: `This isn't... possible... I am ETERNAL... I will return... your minds are MARKED... I'll find you... in your DREAMS...`,
    
    // New: Backstory hints during battle
    backstoryHints: [
      `I was a healer once... before they burned me...`,
      `They called me monster... so I became one...`,
      `Time means nothing in the dark... centuries pass like heartbeats...`,
    ],
  },
  
  // Mind Flayer Dialogue
  mindFlayerDialogue: {
    intro: [
      `THE UNCLE STRUGGLED. HE FOUGHT. IT WAS... ENTERTAINING.`,
      `BUT HE BROKE. LIKE THEY ALL BREAK.`,
      `HIS MIND IS WITH MY MASTER NOW. SOON YOURS WILL JOIN IT.`,
    ],
    // New: Mid-battle taunts
    midBattle: [
      `YOUR WEAPONS ARE PRIMITIVE.`,
      `I FEEL YOUR FEAR. DELICIOUS.`,
      `THE TOWER CALLS TO YOU. YOU CANNOT RESIST.`,
    ],
    defeat: `YOU DELAY THE INEVITABLE. HE WAITS FOR YOU. IN THE TOWER.`,
  },
  
  // Mammoo Ismael Dialogue (when found)
  mammooDialogue: {
    found: [
      `Aidan... you came... why did you...`,
      `...he's in my head... Vecna... he showed me things... his past... he was human once... a long time ago...`,
      `...he's at the top... the Tower... he's waiting for you...`,
      `I can walk... barely... we have to finish this... together...`,
      `He's connected to me... that's his weakness... go... I'll catch up...`,
    ],
    // New: Encouragement during final battle
    encouragement: [
      `You've got this, Aidan!`,
      `Remember our movie nights - fight for those memories!`,
      `He's weakening! Keep going!`,
      `I believe in you!`,
    ],
    finalBattle: `AIDAN! He's still connected to me! His grip is weakest when he's angry! NOW!`,
    escape: `The rift. It's closing. We need to move. NOW.`,
  },
  
  // Credits
  credits: {
    title: 'SAVE ISMAEL',
    dedication: 'For Aidan',
    message: [
      `You walked into the Upside Down and got me out.`,
      `I owe you one.`,
      `(Or several. Lost count around the Mind Flayer.)`,
      ``,
      `See you at movie night.`,
      ``,
      `- Mammoo Ismael, 2025`,
    ],
  },
  
  // Post Credits
  postCredits: {
    clockChimes: 4,
    vecnaWhisper: `I remember every mind I've touched. Every. One. And I have nothing but time.`,
    teaser: [
      `SAVE ISMAEL 2?`,
      `...`,
      `(Sleep tight.)`,
    ],
  },
  
  // New: Mobile gameplay tips
  mobileTips: [
    'Rotate your device for the best experience',
    'Use the left joystick to move',
    'Tap FIRE to shoot enemies',
    'Look for the glowing evidence items',
    'Collect health packs to restore HP',
    'Boss weak points glow red - aim there!',
  ],
};

export default {
  game: gameConfig,
  visual: visualConfig,
  player: playerConfig,
  weapon: weaponConfig,
  enemy: enemyConfig,
  level: levelConfig,
  performance: performanceConfig,
  audio: audioConfig,
  ui: uiConfig,
  story: storyConfig,
};
