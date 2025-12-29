// EliteEnemy.ts - Tougher mini-boss enemies
// Save Ismael - Premium Enemy System

import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';

export class EliteEnemy extends Enemy {
  private roarTimer: number = 0;
  private baseScale: number = 1.5;

  constructor(scene: Scene, position: Vector3) {
    super(scene, EnemyType.DEMOGORGON, position);
    
    // Override stats for elite behavior
    this.speed = 2.5;
    this.damage = 30;
    this.maxHealth = 200;
    this.health = 200;
    this.attackRange = 3;
    this.attackCooldownMax = 1.5;
    
    // Scale up to look imposing
    this.mesh.scaling = new Vector3(this.baseScale, this.baseScale, this.baseScale);
  }

  protected createMesh(): Mesh {
    const mesh = MeshBuilder.CreateCapsule('eliteEnemy', {
      height: 3,
      radius: 0.8,
    }, this.scene);
    
    const mat = new StandardMaterial('eliteMat', this.scene);
    mat.diffuseColor = new Color3(0.4, 0.1, 0.2);
    mat.emissiveColor = new Color3(0.6, 0.1, 0.2);
    mesh.material = mat;
    
    return mesh;
  }

  protected updateMovement(deltaTime: number): void {
    if (!this.target) return;
    
    this.roarTimer += deltaTime;

    // Slower but deliberate movement
    this.moveToward(this.target, deltaTime * 0.8);

    // Breathing animation
    const time = performance.now() / 1000;
    const breathScale = this.baseScale + Math.sin(time * 2) * 0.05;
    this.mesh.scaling.setAll(breathScale);

    // Periodic roar (visual only)
    if (this.roarTimer > 8.0) {
      this.roar();
      this.roarTimer = 0;
    }
  }

  protected attack(): void {
    super.attack();
    
    // Small lunge forward on attack
    if (this.target) {
      const direction = this.target.subtract(this.position).normalize();
      this.mesh.position.addInPlace(direction.scale(0.5));
    }
  }

  private roar(): void {
    // Visual roar effect - scale up briefly
    const originalScale = this.mesh.scaling.clone();
    this.mesh.scaling.scaleInPlace(1.2);

    setTimeout(() => {
      this.mesh.scaling = originalScale;
    }, 300);
  }
}

export default EliteEnemy;
