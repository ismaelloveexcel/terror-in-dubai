// Demobat.ts - Flying Enemy
// Save Ismael

import { Scene, Vector3, Mesh } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';
import { fallbackMeshes, enemyConfig } from '../config/assetConfig';

export class Demobat extends Enemy {
  private flyHeight: number;
  private swoopTimer: number = 0;
  private isSwooping: boolean = false;
  private originalY: number;
  
  constructor(scene: Scene, position: Vector3) {
    super(scene, EnemyType.DEMOBAT, position);
    this.flyHeight = (enemyConfig as any).demobat?.flyHeight || 2.5;
    this.originalY = position.y + this.flyHeight;
    this.mesh.position.y = this.originalY;
  }
  
  protected createMesh(): Mesh {
    return this.createFallbackMesh(fallbackMeshes.demobat);
  }
  
  protected updateMovement(deltaTime: number): void {
    const time = performance.now() / 1000;
    
    if (this.target) {
      const distance = Vector3.Distance(
        new Vector3(this.position.x, 0, this.position.z),
        new Vector3(this.target.x, 0, this.target.z)
      );
      
      if (distance > this.attackRange * 2) {
        // Fly toward target
        this.moveToward(this.target, deltaTime);
      } else if (!this.isSwooping) {
        // Start swoop attack
        this.swoopTimer += deltaTime;
        if (this.swoopTimer > 2) {
          this.isSwooping = true;
          this.swoopTimer = 0;
        }
      }
      
      // Swoop down
      if (this.isSwooping) {
        const swoopProgress = this.swoopTimer / 0.5;
        if (swoopProgress < 1) {
          this.mesh.position.y = this.originalY - (swoopProgress * this.flyHeight * 0.8);
          this.swoopTimer += deltaTime;
        } else {
          // Return up
          this.mesh.position.y += this.speed * 2 * deltaTime;
          if (this.mesh.position.y >= this.originalY) {
            this.mesh.position.y = this.originalY;
            this.isSwooping = false;
            this.swoopTimer = 0;
          }
        }
      }
    }
    
    // Hover animation
    if (!this.isSwooping) {
      this.mesh.position.y = this.originalY + Math.sin(time * 3) * 0.2;
    }
    
    // Wing flap (rotation wobble)
    this.mesh.rotation.z = Math.sin(time * 15) * 0.2;
  }
}

export default Demobat;
