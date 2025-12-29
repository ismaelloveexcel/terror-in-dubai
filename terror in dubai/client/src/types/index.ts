import { Scene, Mesh, Vector3 } from '@babylonjs/core';

export interface GameConfig {
  familyMode: boolean;
  nephewName: string;
  rescueTarget: string;
}

export interface LevelConfig {
  id: string;
  title: string;
  storyCard: string;
  ismaelMessages?: string[];
}

export interface EnemyType {
  id: string;
  displayName: string;
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
}

export interface WeaponConfig {
  damage: number;
  fireRate: number;
  recoil: number;
  range: number;
}

export interface IEnemy {
  mesh: Mesh;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  attackRange: number;
  type: string;
  isAlive: boolean;
  isDying: boolean;
  target: Vector3 | null;

  update(deltaTime: number, playerPosition: Vector3): void;
  takeDamage(amount: number): void;
  die(): void;
  dispose(): void;
}

export interface ISpawner {
  position: Vector3;
  isActive: boolean;
  isDestroyed: boolean;
  mesh: Mesh;

  spawn(): void;
  destroy(): void;
  update(deltaTime: number): void;
  dispose(): void;
}

export interface ILevel {
  scene: Scene;
  isComplete: boolean;

  load(): Promise<void>;
  update(deltaTime: number): void;
  checkWinCondition(): boolean;
  dispose(): void;
}

export interface MemoryFragment {
  id: string;
  position: Vector3;
  text: string;
  collected: boolean;
  mesh?: Mesh;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  isAlive: boolean;
  canMove: boolean;
  moveSpeedMultiplier: number;
}

export type GameState = 'MENU' | 'PROLOGUE' | 'LEVEL_INTRO' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'FINALE' | 'CREDITS';
