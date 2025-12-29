// Type Definitions - Save Ismael

import { Mesh, Vector3, Scene } from '@babylonjs/core';

// =============================================================================
// GAME STATE
// =============================================================================

export enum GameState {
  LOADING = 'loading',
  MENU = 'menu',
  PROLOGUE = 'prologue',
  PLAYING = 'playing',
  PAUSED = 'paused',
  DIALOGUE = 'dialogue',
  CUTSCENE = 'cutscene',
  BOSS_INTRO = 'boss_intro',
  LEVEL_COMPLETE = 'level_complete',
  GAME_OVER = 'game_over',
  VICTORY = 'victory',
  CREDITS = 'credits',
}

// =============================================================================
// ENTITIES
// =============================================================================

export interface IEntity {
  mesh: Mesh;
  position: Vector3;
  update(deltaTime: number): void;
  dispose(): void;
}

export interface IDamageable {
  health: number;
  maxHealth: number;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isDead(): boolean;
}

export interface IEnemy extends IEntity, IDamageable {
  type: EnemyType;
  damage: number;
  speed: number;
  attackRange: number;
  detectionRange: number;
  isAlerted: boolean;
  target: Vector3 | null;
  
  onDeath?: () => void;
  onAttack?: (damage: number) => void;
}

export interface IBoss extends IEnemy {
  phase: number;
  maxPhases: number;
  phaseHealth: number[];
  
  onPhaseChange?: (phase: number) => void;
}

// =============================================================================
// ENEMY TYPES
// =============================================================================

export enum EnemyType {
  DEMODOG = 'demodog',
  DEMOBAT = 'demobat',
  DEMOGORGON = 'demogorgon',
  SHADOW_CLONE = 'shadowClone',
  MIND_FLAYER = 'mindFlayer',
  VECNA = 'vecna',
}

// =============================================================================
// PLAYER
// =============================================================================

export interface IPlayer extends IEntity, IDamageable {
  stamina: number;
  maxStamina: number;
  isRunning: boolean;
  isCrouching: boolean;
  
  move(direction: Vector3): void;
  look(deltaX: number, deltaY: number): void;
  shoot(): boolean;
  reload(): void;
}

export interface IWeapon {
  name: string;
  damage: number;
  fireRate: number;
  range: number;
  magazineSize: number;
  currentAmmo: number;
  totalAmmo: number;
  isReloading: boolean;
  
  fire(): boolean;
  reload(): void;
  canFire(): boolean;
}

// =============================================================================
// LEVELS
// =============================================================================

export interface ILevel {
  id: string;
  name: string;
  subtitle: string;
  scene: Scene;
  
  load(): Promise<void>;
  update(deltaTime: number): void;
  dispose(): void;
  
  isComplete(): boolean;
  getObjectives(): IObjective[];
}

export interface IObjective {
  id: string;
  text: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface ISpawner extends IEntity {
  spawnEnemy(): IEnemy;
  isDestroyed: boolean;
  takeDamage(amount: number): void;
}

// =============================================================================
// COLLECTIBLES
// =============================================================================

export interface ICollectible extends IEntity {
  type: CollectibleType;
  isCollected: boolean;
  
  collect(): void;
  onCollect?: () => void;
}

export enum CollectibleType {
  EVIDENCE = 'evidence',
  HEALTH = 'health',
  AMMO = 'ammo',
}

export interface IEvidence {
  id: string;
  name: string;
  description: string;
  voiceNote?: string;
  level: number;
}

// =============================================================================
// UI
// =============================================================================

export interface IHUDData {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  ammo: number;
  maxAmmo: number;
  totalAmmo: number;
  objective: string;
  level: number;
  levelName: string;
}

export interface IDialogueData {
  speaker: string;
  text: string;
  duration?: number;
  isVoiceNote?: boolean;
}

// =============================================================================
// EVENTS
// =============================================================================

export interface IGameEvents {
  onLevelStart: (level: number) => void;
  onLevelComplete: (level: number) => void;
  onPlayerDamage: (amount: number) => void;
  onPlayerDeath: () => void;
  onEnemyKill: (type: EnemyType) => void;
  onBossPhaseChange: (phase: number) => void;
  onEvidenceCollect: (evidence: IEvidence) => void;
  onObjectiveComplete: (objective: IObjective) => void;
  onDialogueStart: (dialogue: IDialogueData) => void;
  onDialogueEnd: () => void;
}

// =============================================================================
// INPUT
// =============================================================================

export interface IInputState {
  // Movement
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  
  // Actions
  shoot: boolean;
  reload: boolean;
  interact: boolean;
  pause: boolean;
  
  // Look
  lookX: number;
  lookY: number;
  
  // Mobile
  joystickX: number;
  joystickY: number;
  isMobileFirePressed: boolean;
}

// =============================================================================
// AUDIO
// =============================================================================

export interface IAudioManager {
  playMusic(track: string): void;
  stopMusic(): void;
  playSFX(sound: string): void;
  setMasterVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setSFXVolume(volume: number): void;
}

// =============================================================================
// SAVE DATA
// =============================================================================

export interface ISaveData {
  currentLevel: number;
  evidenceCollected: string[];
  settings: ISettings;
  statistics: IStatistics;
}

export interface ISettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
  invertY: boolean;
  showFPS: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
}

export interface IStatistics {
  totalPlayTime: number;
  enemiesKilled: number;
  deathCount: number;
  shotsHit: number;
  shotsFired: number;
  damageDealt: number;
  damageTaken: number;
}

// =============================================================================
// LOADING
// =============================================================================

export interface ILoadingProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

export type LoadingCallback = (progress: ILoadingProgress) => void;
