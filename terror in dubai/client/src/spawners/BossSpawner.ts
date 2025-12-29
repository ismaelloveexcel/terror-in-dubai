import { Scene, Mesh, Vector3 } from '@babylonjs/core';
import { ISpawner } from '../types';
import { AssetLoader } from '../utils/AssetLoader';
import { Boss } from '../enemies/Boss';

export class BossSpawner implements ISpawner {
  public isActive: boolean = false;
  public isDestroyed: boolean = false;
  public mesh: Mesh;
  public boss: Boss | null = null;

  constructor(
    public position: Vector3,
    private scene: Scene,
    private assetLoader: AssetLoader,
    private arenaCenter: Vector3,
    private arenaRadius: number
  ) {
    // BossSpawner doesn't need a visible mesh
    this.mesh = this.assetLoader.createFallbackBoss();
    this.mesh.isVisible = false;
  }

  spawn(): void {
    if (this.boss || this.isDestroyed) return;

    const bossMesh = this.assetLoader.createFallbackBoss();
    bossMesh.position = this.position.clone();

    this.boss = new Boss(bossMesh, this.scene, this.arenaCenter, this.arenaRadius);
    this.isActive = true;
  }

  update(deltaTime: number): void {
    void deltaTime;
    // Boss updates itself
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
