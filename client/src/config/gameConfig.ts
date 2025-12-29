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
  // Color Palette
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
  
  // Post-Processing
  postProcess: {
    bloom: {
      enabled: true,
      threshold: 0.6,
      weight: 0.4,
      kernel: 64,
      scale: 0.5,
    },
    vignette: {
      enabled: true,
      weight: 1.2,
      color: { r: 0.1, g: 0, b: 0 },
    },
    chromaticAberration: {
      enabled: true,
      amount: 10,
    },
    grain: {
      enabled: true,
      intensity: 0.05,
    },
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
    phases: 3,
    points: 2000,
  },
  vecna: {
    name: 'Vecna',
    health: 2000,
    damage: 40,
    speed: 3,
    phases: 4,
    points: 5000,
  },
};

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

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

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
// AUDIO CONFIGURATION
// =============================================================================

export const audioConfig = {
  enabled: true,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  
  // Music
  music: {
    menu: 'menu-theme.mp3',
    ambient: 'ambient-drone.mp3',
    combat: 'combat-theme.mp3',
    boss: 'boss-theme.mp3',
    victory: 'victory.mp3',
  },
  
  // SFX
  sfx: {
    gunshot: 'gunshot.wav',
    reload: 'reload.wav',
    enemyHit: 'enemy-hit.wav',
    enemyDeath: 'enemy-death.wav',
    playerDamage: 'player-damage.wav',
    footstep: 'footstep.wav',
    pickup: 'pickup.wav',
    clockChime: 'clock-chime.wav',
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
    
    phase2: `Show me your fears, child...`,
    phase2Fail: `What is this? These memories... they're not fear... they're not pain... what ARE you?`,
    phase3: `My shadow! FINISH THIS!`,
    phase4: [
      `A THOUSAND YEARS I'VE EXISTED!`,
      `I'VE CONSUMED MINDS BEYOND COUNTING!`,
      `YOU ARE NOTHING!`,
    ],
    
    defeat: `This isn't... possible... I am ETERNAL... I will return... your minds are MARKED... I'll find you... in your DREAMS...`,
  },
  
  // Mind Flayer Dialogue
  mindFlayerDialogue: {
    intro: [
      `THE UNCLE STRUGGLED. HE FOUGHT. IT WAS... ENTERTAINING.`,
      `BUT HE BROKE. LIKE THEY ALL BREAK.`,
      `HIS MIND IS WITH MY MASTER NOW. SOON YOURS WILL JOIN IT.`,
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
