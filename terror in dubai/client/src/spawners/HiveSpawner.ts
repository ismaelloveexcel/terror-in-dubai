import { Scene, Mesh, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { ISpawner, IEnemy } from '../types';
import { AssetLoader } from '../utils/AssetLoader';
import { SwarmEnemy } from '../enemies/SwarmEnemy';
import { FlyingEnemy } from '../enemies/FlyingEnemy';
import { assetConfig } from '../config/assetConfig';
import { performanceConfig } from '../config/gameConfig';

export class HiveSpawner implements ISpawner {
  public isActive: boolean = true;
  public isDestroyed: boolean = false;
  public mesh: Mesh;
  public health: number = 100;

  private spawnTimer: number = 0;
  private spawnInterval: number = 5;
  private maxEnemies: number = performanceConfig.maxEnemies;
  private spawnedEnemies: IEnemy[] = [];

  constructor(
    public position: Vector3,
    private scene: Scene,
    private assetLoader: AssetLoader,
    private onEnemySpawned: (enemy: IEnemy) => void
  ) {
    this.mesh = this.createMesh();
  }

  private createMesh(): Mesh {
    const hive = this.assetLoader.createFallbackHive();
    hive.position = this.position.clone();

    const mat = new StandardMaterial('hiveMat', this.scene);
    mat.diffuseColor = new Color3(0.3, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    hive.material = mat;

    return hive;
  }

  spawn(): void {
    if (this.isDestroyed || !this.isActive) return;

    const aliveEnemies = this.spawnedEnemies.filter(e => e.isAlive);
    if (aliveEnemies.length >= this.maxEnemies) return;

    // 70% swarm, 30% flying
    const enemyType = Math.random() < 0.7 ? 'swarm' : 'flying';

    const spawnPos = this.position.clone();
    spawnPos.x += (Math.random() - 0.5) * 3;
    spawnPos.z += (Math.random() - 0.5) * 3;

    let enemy: IEnemy;

    if (enemyType === 'swarm') {
      const mesh = this.assetLoader.createFallbackSwarmEnemy();
      mesh.position = spawnPos;
      enemy = new SwarmEnemy(mesh, this.scene);
    } else {
      const mesh = this.assetLoader.createFallbackFlyingEnemy();
      mesh.position = spawnPos;
      enemy = new FlyingEnemy(mesh, this.scene);
    }

    this.spawnedEnemies.push(enemy);
    this.onEnemySpawned(enemy);
  }

  update(deltaTime: number): void {
    if (this.isDestroyed) return;

    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawn();
      this.spawnTimer = 0;
    }

    // Pulse animation
    const time = performance.now() / 1000;
    const mat = this.mesh.material as StandardMaterial;
    if (mat) {
      mat.emissiveColor = new Color3(0.5 + Math.sin(time * 3) * 0.3, 0.1, 0.1);
    }

    // Clean up dead enemies
    this.spawnedEnemies = this.spawnedEnemies.filter(e => e.isAlive || e.isDying);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.isActive = false;

    // Visual destruction
    const mat = this.mesh.material as StandardMaterial;
    if (mat) {
      mat.emissiveColor = new Color3(1, 0.5, 0);
    }

    setTimeout(() => {
      this.dispose();
    }, 500);
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.dispose();
    }
  }
}
