// FlyingEnemy.ts - Aerial enemies with dive attacks
// Save Ismael - Premium Enemy System

import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';

export class FlyingEnemy extends Enemy {
  private hoverHeight: number = 3;
  private isDiving: boolean = false;
  private diveTimer: number = 0;

  constructor(scene: Scene, position: Vector3) {
    super(scene, EnemyType.DEMOBAT, position);
    
    // Override stats for flying behavior
    this.speed = 6;
    this.damage = 8;
    this.maxHealth = 35;
    this.health = 35;
    this.attackRange = 2;
    
    // Start at hover height
    this.mesh.position.y = this.hoverHeight;
  }

  protected createMesh(): Mesh {
    // Flying enemy body
    const body = MeshBuilder.CreateSphere('flyingEnemy', {
      diameter: 0.8,
      segments: 8,
    }, this.scene);
    
    const mat = new StandardMaterial('flyingMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.4);
    mat.emissiveColor = new Color3(0.3, 0.3, 0.6);
    body.material = mat;
    
    // Add wing-like extensions
    const wing1 = MeshBuilder.CreateBox('wing_left', {
      width: 1.5,
      height: 0.1,
      depth: 0.5,
    }, this.scene);
    wing1.parent = body;
    wing1.position.x = -0.5;
    wing1.name = 'wing_left';
    wing1.material = mat;
    
    const wing2 = MeshBuilder.CreateBox('wing_right', {
      width: 1.5,
      height: 0.1,
      depth: 0.5,
    }, this.scene);
    wing2.parent = body;
    wing2.position.x = 0.5;
    wing2.name = 'wing_right';
    wing2.material = mat;
    
    return body;
  }

  protected updateMovement(deltaTime: number): void {
    if (!this.target) return;
    
    this.diveTimer += deltaTime;

    if (this.isDiving) {
      // Dive at player
      this.moveToward(this.target, deltaTime * 2); // Faster when diving

      // Return to hover after dive
      if (this.diveTimer > 1.5) {
        this.isDiving = false;
        this.diveTimer = 0;
      }
    } else {
      // Hover above player
      const hoverTarget = this.target.clone();
      hoverTarget.y = this.hoverHeight;
      this.moveToward(hoverTarget, deltaTime);

      // Periodic dive attack
      const distanceToHover = Vector3.Distance(this.mesh.position, hoverTarget);
      if (this.diveTimer > 3.0 && distanceToHover < 5) {
        this.isDiving = true;
        this.diveTimer = 0;
      }
    }

    // Wing flap animation
    const time = performance.now() / 1000;
    const children = this.mesh.getChildMeshes();
    children.forEach((child, index) => {
      if (child.name.includes('wing')) {
        child.rotation.z = Math.sin(time * 10) * 0.3 * (index === 0 ? 1 : -1);
      }
    });
  }

  protected checkAttack(): void {
    // Only attack while diving
    if (!this.isDiving || !this.target || this.isAttacking || this.attackCooldown > 0) return;
    
    const distance = Vector3.Distance(this.position, this.target);
    if (distance <= this.attackRange) {
      this.attack();
    }
  }
}

export default FlyingEnemy;
