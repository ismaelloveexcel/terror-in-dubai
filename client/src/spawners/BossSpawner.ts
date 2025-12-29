import { Scene, Mesh, Vector3 } from '@babylonjs/core';
import { AssetLoader } from '../utils/AssetLoader';
import { Boss } from '../enemies/Boss';

export class BossSpawner {
  public isActive: boolean = false;
  public isDestroyed: boolean = false;
  public mesh: Mesh;
  public boss: Boss | null = null;
  public position: Vector3;

  private scene: Scene;
  private assetLoader: AssetLoader;
  private arenaCenter: Vector3;
  private arenaRadius: number;

  constructor(
    position: Vector3,
    scene: Scene,
    assetLoader: AssetLoader,
    arenaCenter: Vector3,
    arenaRadius: number
  ) {
    this.position = position.clone();
    this.scene = scene;
    this.assetLoader = assetLoader;
    this.arenaCenter = arenaCenter;
    this.arenaRadius = arenaRadius;

    // BossSpawner doesn't need a visible mesh
    this.mesh = this.assetLoader.createFallbackBoss();
    this.mesh.isVisible = false;
  }

  spawn(): void {
    if (this.boss || this.isDestroyed) return;

    // Create boss at spawn position
    this.boss = new Boss(this.scene, this.position, this.arenaCenter, this.arenaRadius);
    this.isActive = true;
  }

  update(deltaTime: number): void {
    // Boss updates itself through Enemy.update()
    if (this.boss && this.boss.isAlive) {
      this.boss.update(deltaTime);
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.isActive = false;
  }

  dispose(): void {
    if (this.boss) {
      this.boss.dispose();
    }
    if (this.mesh) {
      this.mesh.dispose();
    }
  }
}
