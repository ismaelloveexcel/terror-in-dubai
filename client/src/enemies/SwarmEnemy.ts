// SwarmEnemy.ts - Fast swarm creatures
// Save Ismael - Premium Enemy System

import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';
import { fallbackMeshes } from '../config/assetConfig';

export class SwarmEnemy extends Enemy {
  private bobOffset: number = Math.random() * Math.PI * 2;

  constructor(scene: Scene, position: Vector3) {
    super(scene, EnemyType.DEMODOG, position); // Use demodog type for now
    
    // Override stats for swarm behavior
    this.speed = 5;
    this.damage = 5;
    this.maxHealth = 25;
    this.health = 25;
    this.attackRange = 1.5;
  }

  protected createMesh(): Mesh {
    const mesh = MeshBuilder.CreateSphere('swarmEnemy', {
      diameter: 0.5,
      segments: 8,
    }, this.scene);
    
    const mat = new StandardMaterial('swarmMat', this.scene);
    mat.diffuseColor = new Color3(0.3, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    mesh.material = mat;
    
    return mesh;
  }

  protected updateMovement(deltaTime: number): void {
    if (!this.target) return;

    // Simple chase behavior with slight random offset to avoid stacking
    const offset = new Vector3(
      (Math.random() - 0.5) * 0.5,
      0,
      (Math.random() - 0.5) * 0.5
    );

    const targetPos = this.target.add(offset);
    this.moveToward(targetPos, deltaTime);

    // Bob animation
    const time = performance.now() / 1000;
    this.mesh.position.y = 0.3 + Math.sin(time * 5 + this.bobOffset) * 0.1;
  }
}

export default SwarmEnemy;
