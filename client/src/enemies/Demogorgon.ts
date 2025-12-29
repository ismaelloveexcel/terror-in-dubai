// Demogorgon.ts - Elite Enemy
// Save Ismael

import { Scene, Vector3, Mesh, Animation } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';
import { fallbackMeshes } from '../config/assetConfig';

export class Demogorgon extends Enemy {
  private chargeTimer: number = 0;
  private isCharging: boolean = false;
  private chargeDirection: Vector3 = Vector3.Zero();
  private chargeDuration: number = 0.5;
  private chargeSpeed: number = 15;
  
  constructor(scene: Scene, position: Vector3) {
    super(scene, EnemyType.DEMOGORGON, position);
  }
  
  protected createMesh(): Mesh {
    return this.createFallbackMesh(fallbackMeshes.demogorgon);
  }
  
  protected updateMovement(deltaTime: number): void {
    if (this.isCharging) {
      // Execute charge
      this.chargeTimer -= deltaTime;
      const velocity = this.chargeDirection.scale(this.chargeSpeed * deltaTime);
      this.mesh.moveWithCollisions(velocity);
      
      if (this.chargeTimer <= 0) {
        this.isCharging = false;
        this.chargeTimer = 3; // Cooldown before next charge
      }
      return;
    }
    
    if (this.target) {
      const distance = Vector3.Distance(this.position, this.target);
      
      // Charge attack when in range
      if (distance < 10 && distance > this.attackRange && this.chargeTimer <= 0) {
        this.startCharge();
        return;
      }
      
      // Normal movement
      if (distance > this.attackRange) {
        this.moveToward(this.target, deltaTime);
      }
      
      // Update charge cooldown
      if (this.chargeTimer > 0) {
        this.chargeTimer -= deltaTime;
      }
    }
    
    // Menacing idle animation
    const time = performance.now() / 1000;
    this.mesh.rotation.y += Math.sin(time * 2) * 0.01;
  }
  
  private startCharge(): void {
    if (!this.target) return;
    
    this.isCharging = true;
    this.chargeTimer = this.chargeDuration;
    
    // Calculate charge direction
    this.chargeDirection = this.target.subtract(this.position);
    this.chargeDirection.y = 0;
    this.chargeDirection.normalize();
    
    // Look at target
    this.mesh.lookAt(new Vector3(
      this.target.x,
      this.mesh.position.y,
      this.target.z
    ));
    
    // Wind-up animation
    const windUp = new Animation(
      'chargeWindUp',
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    const currentY = this.mesh.position.y;
    windUp.setKeys([
      { frame: 0, value: currentY },
      { frame: 5, value: currentY - 0.3 },
      { frame: 10, value: currentY },
    ]);
    
    this.mesh.animations = [windUp];
    this.scene.beginAnimation(this.mesh, 0, 10, false);
  }
  
  protected attack(): void {
    super.attack();
    
    // Demogorgon roar animation
    const roar = new Animation(
      'roarAnim',
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    roar.setKeys([
      { frame: 0, value: 1 },
      { frame: 5, value: 1.1 },
      { frame: 15, value: 1 },
    ]);
    
    this.mesh.animations.push(roar);
    this.scene.beginAnimation(this.mesh, 0, 15, false);
  }
}

export default Demogorgon;
