// Boss.ts - Phase-based boss with teleport and hazard zones
// Save Ismael - Premium Enemy System

import { 
  Scene, 
  Vector3, 
  Mesh, 
  MeshBuilder, 
  StandardMaterial, 
  Color3 
} from '@babylonjs/core';
import { Enemy } from './Enemy';
import { EnemyType } from '../types';

export type BossPhase = 1 | 2 | 3;

export class Boss extends Enemy {
  public currentPhase: BossPhase = 1;
  public isStunned: boolean = false;
  
  private stunTimer: number = 0;
  private teleportPoints: Vector3[] = [];
  private teleportTimer: number = 0;
  private hazardTimer: number = 0;
  private hazardZones: Mesh[] = [];
  private arenaCenter: Vector3;
  private arenaRadius: number;

  constructor(scene: Scene, position: Vector3, arenaCenter?: Vector3, arenaRadius?: number) {
    super(scene, EnemyType.DEMOGORGON, position);
    
    this.arenaCenter = arenaCenter || position.clone();
    this.arenaRadius = arenaRadius || 20;
    
    // Override stats for boss behavior
    this.speed = 2;
    this.damage = 25;
    this.maxHealth = 500;
    this.health = 500;
    this.attackRange = 5;
    this.attackCooldownMax = 3;
    
    // Scale up massively
    this.mesh.scaling = new Vector3(2, 2, 2);
    this.mesh.position.y = 2;
    
    // Setup teleport points
    this.setupTeleportPoints();
  }

  protected createMesh(): Mesh {
    const mesh = MeshBuilder.CreateSphere('boss', {
      diameter: 3,
      segments: 16,
    }, this.scene);
    
    const mat = new StandardMaterial('bossMat', this.scene);
    mat.diffuseColor = new Color3(0.5, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.8, 0.2, 0.2);
    mesh.material = mat;
    
    return mesh;
  }

  private setupTeleportPoints(): void {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const point = new Vector3(
        this.arenaCenter.x + Math.cos(angle) * this.arenaRadius * 0.7,
        this.arenaCenter.y + 2,
        this.arenaCenter.z + Math.sin(angle) * this.arenaRadius * 0.7
      );
      this.teleportPoints.push(point);
    }
  }

  protected updateMovement(deltaTime: number): void {
    if (this.isStunned) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
      return;
    }

    this.updatePhase();

    switch (this.currentPhase) {
      case 1:
        this.phase1Behavior(deltaTime);
        break;
      case 2:
        this.phase2Behavior(deltaTime);
        break;
      case 3:
        this.phase3Behavior(deltaTime);
        break;
    }

    // Menacing float animation
    const time = performance.now() / 1000;
    this.mesh.position.y = 2 + Math.sin(time) * 0.3;
    this.mesh.rotation.y += deltaTime * 0.5;
  }

  private updatePhase(): void {
    const healthPercent = (this.health / this.maxHealth) * 100;

    if (healthPercent <= 35 && this.currentPhase !== 3) {
      this.currentPhase = 3;
      this.onPhaseChange();
    } else if (healthPercent <= 70 && this.currentPhase === 1) {
      this.currentPhase = 2;
      this.onPhaseChange();
    }
  }

  private onPhaseChange(): void {
    console.log(`Boss entered phase ${this.currentPhase}`);
    // Visual effect - pulse
    this.mesh.scaling.scaleInPlace(1.2);
    setTimeout(() => {
      this.mesh.scaling.scaleInPlace(1 / 1.2);
    }, 500);
  }

  private phase1Behavior(deltaTime: number): void {
    if (!this.target) return;
    // Slow movement, ranged attacks, periodic stun opportunity
    this.moveToward(this.target, deltaTime * 0.5);
  }

  private phase2Behavior(deltaTime: number): void {
    if (!this.target) return;
    // Teleport behavior
    this.teleportTimer += deltaTime;

    if (this.teleportTimer > 5.0) {
      this.teleport();
      this.teleportTimer = 0;
    } else {
      this.moveToward(this.target, deltaTime * 0.7);
    }
  }

  private phase3Behavior(deltaTime: number): void {
    if (!this.target) return;
    // Fast movement + hazard zones
    this.moveToward(this.target, deltaTime);

    this.hazardTimer += deltaTime;
    if (this.hazardTimer > 6.0) {
      this.createHazardZone();
      this.hazardTimer = 0;
    }
  }

  private teleport(): void {
    const randomPoint = this.teleportPoints[Math.floor(Math.random() * this.teleportPoints.length)];
    this.mesh.position = randomPoint.clone();
    this.position = randomPoint.clone();
  }

  private createHazardZone(): void {
    if (!this.target) return;
    
    const hazard = MeshBuilder.CreateCylinder('hazard', {
      height: 0.1,
      diameter: 4
    }, this.scene);

    hazard.position = this.target.clone();
    hazard.position.x += (Math.random() - 0.5) * 10;
    hazard.position.z += (Math.random() - 0.5) * 10;
    hazard.position.y = 0.05;

    const mat = new StandardMaterial('hazardMat', this.scene);
    mat.emissiveColor = new Color3(1, 0, 0);
    mat.alpha = 0.5;
    hazard.material = mat;

    this.hazardZones.push(hazard);

    // Remove after duration
    setTimeout(() => {
      const index = this.hazardZones.indexOf(hazard);
      if (index > -1) {
        this.hazardZones.splice(index, 1);
      }
      hazard.dispose();
    }, 3000);
  }

  protected checkAttack(): void {
    if (this.isStunned) return;
    super.checkAttack();
  }

  public stun(duration: number): void {
    this.isStunned = true;
    this.stunTimer = duration;
  }

  public isInHazardZone(position: Vector3): boolean {
    for (const hazard of this.hazardZones) {
      const distance = Vector3.Distance(
        new Vector3(position.x, 0, position.z),
        new Vector3(hazard.position.x, 0, hazard.position.z)
      );
      if (distance < 2) {
        return true;
      }
    }
    return false;
  }

  public dispose(): void {
    this.hazardZones.forEach(h => h.dispose());
    this.hazardZones = [];
    super.dispose();
  }
}

export default Boss;
