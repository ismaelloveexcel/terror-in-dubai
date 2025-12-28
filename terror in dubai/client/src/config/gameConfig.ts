import { GameConfig, WeaponConfig, EnemyType } from '../types';

// Environment variables with defaults
const FAMILY_MODE = import.meta.env.VITE_FAMILY_MODE === 'true';
const NEPHEW_NAME = import.meta.env.VITE_NEPHEW_NAME || 'Aidan';
const RESCUE_TARGET = import.meta.env.VITE_RESCUE_TARGET || 'Ismael';

export const gameConfig: GameConfig = {
  familyMode: FAMILY_MODE,
  nephewName: NEPHEW_NAME,
  rescueTarget: RESCUE_TARGET
};

// Load from localStorage if available (in-game toggle)
const storedFamilyMode = localStorage.getItem('familyMode');
if (storedFamilyMode !== null) {
  gameConfig.familyMode = storedFamilyMode === 'true';
}

export function toggleFamilyMode(): void {
  gameConfig.familyMode = !gameConfig.familyMode;
  localStorage.setItem('familyMode', String(gameConfig.familyMode));
}

export function setRescueTarget(name: string): void {
  gameConfig.rescueTarget = name;
  localStorage.setItem('rescueTarget', name);
}

// Load rescue target from storage
const storedTarget = localStorage.getItem('rescueTarget');
if (storedTarget) {
  gameConfig.rescueTarget = storedTarget;
}

// ==== SETTINGS SYSTEM ====
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

// Weapon configuration
export const weaponConfig: WeaponConfig = {
  damage: 25,
  fireRate: 0.15, // seconds between shots
  recoil: 0.02,
  range: 100
};

// Enemy types (internal IDs)
export const ENEMY_TYPES = {
  SWARM: 'ENEMY_SWARM',
  FLYING: 'ENEMY_FLYING',
  ELITE: 'ENEMY_ELITE',
  BOSS: 'BOSS_FINAL'
};

// Enemy configurations
export const enemyConfigs: Record<string, EnemyType> = {
  [ENEMY_TYPES.SWARM]: {
    id: ENEMY_TYPES.SWARM,
    displayName: gameConfig.familyMode ? 'Demodog' : 'D-Dog',
    health: 50,
    speed: 4,
    damage: 10,
    attackRange: 2
  },
  [ENEMY_TYPES.FLYING]: {
    id: ENEMY_TYPES.FLYING,
    displayName: gameConfig.familyMode ? 'Demobat' : 'Rift Bat',
    health: 30,
    speed: 6,
    damage: 8,
    attackRange: 1.5
  },
  [ENEMY_TYPES.ELITE]: {
    id: ENEMY_TYPES.ELITE,
    displayName: gameConfig.familyMode ? 'Demogorgon' : 'The Gorgon',
    health: 150,
    speed: 3,
    damage: 25,
    attackRange: 3
  },
  [ENEMY_TYPES.BOSS]: {
    id: ENEMY_TYPES.BOSS,
    displayName: gameConfig.familyMode ? 'Vecna' : 'The One',
    health: 1000,
    speed: 2,
    damage: 30,
    attackRange: 5
  }
};

// Update display names when family mode changes
export function updateEnemyNames(): void {
  enemyConfigs[ENEMY_TYPES.SWARM].displayName = gameConfig.familyMode ? 'Demodog' : 'D-Dog';
  enemyConfigs[ENEMY_TYPES.FLYING].displayName = gameConfig.familyMode ? 'Demobat' : 'Rift Bat';
  enemyConfigs[ENEMY_TYPES.ELITE].displayName = gameConfig.familyMode ? 'Demogorgon' : 'The Gorgon';
  enemyConfigs[ENEMY_TYPES.BOSS].displayName = gameConfig.familyMode ? 'Vecna' : 'The One';
}

// Player configuration
export const playerConfig = {
  maxHealth: 100,
  walkSpeed: 5,
  sprintSpeed: 8,
  height: 1.8,
  radius: 0.5
};

// Mobile performance settings
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const performanceConfig = {
  shadowsEnabled: !isMobile && settings.shadows,
  particleLimit: isMobile ? 50 : (settings.particles ? 200 : 0),
  maxEnemies: isMobile ? 8 : 15,
  renderScale: isMobile ? 0.8 : 1.0
};
