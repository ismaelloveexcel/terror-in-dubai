import { Mesh, Vector3, Color3, Scene, MeshBuilder, StandardMaterial } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { enemyConfigs, ENEMY_TYPES } from '../config/gameConfig';

export type BossPhase = 1 | 2 | 3;

export class Boss extends Enemy {
  private attackCallback: ((damage: number) => void) | null = null;
  private stunCallback: ((duration: number) => void) | null = null;

  public currentPhase: BossPhase = 1;
  public isStunned: boolean = false;
  private stunTimer: number = 0;
  private phaseChangeTimer: number = 0;

  private teleportPoints: Vector3[] = [];
  private teleportTimer: number = 0;

  private hazardTimer: number = 0;
  private hazardZones: Mesh[] = [];

  constructor(mesh: Mesh, scene: Scene, arenaCenter: Vector3, arenaRadius: number) {
    const config = enemyConfigs[ENEMY_TYPES.BOSS];
    super(mesh, ENEMY_TYPES.BOSS, config.speed, config.damage, config.attackRange, config.health, scene);

    // Scale up massively
    this.mesh.scaling = new Vector3(2, 2, 2);
    this.mesh.position.y = 2;

    // Setup teleport points
    this.setupTeleportPoints(arenaCenter, arenaRadius);
  }

  protected getColor(): Color3 {
    return new Color3(0.5, 0.1, 0.1); // Deep red
  }

  private setupTeleportPoints(center: Vector3, radius: number): void {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const point = new Vector3(
        center.x + Math.cos(angle) * radius * 0.7,
        center.y + 2,
        center.z + Math.sin(angle) * radius * 0.7
      );
      this.teleportPoints.push(point);
    }
  }

  protected updateMovement(deltaTime: number, playerPosition: Vector3): void {
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
        this.phase1Behavior(deltaTime, playerPosition);
        break;
      case 2:
        this.phase2Behavior(deltaTime, playerPosition);
        break;
      case 3:
        this.phase3Behavior(deltaTime, playerPosition);
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
    // Visual effect
    this.mesh.scaling.scaleInPlace(1.2);
    setTimeout(() => {
      this.mesh.scaling.scaleInPlace(1 / 1.2);
    }, 500);
  }

  private phase1Behavior(deltaTime: number, playerPosition: Vector3): void {
    // Slow movement, ranged attacks, periodic stun opportunity
    this.moveTowards(playerPosition, deltaTime * 0.5);
  }

  private phase2Behavior(deltaTime: number, playerPosition: Vector3): void {
    // Teleport behavior
    this.teleportTimer += deltaTime;

    if (this.teleportTimer > 5.0) {
      this.teleport();
      this.teleportTimer = 0;
    } else {
      this.moveTowards(playerPosition, deltaTime * 0.7);
    }
  }

  private phase3Behavior(deltaTime: number, playerPosition: Vector3): void {
    // Fast movement + hazard zones
    this.moveTowards(playerPosition, deltaTime);

    this.hazardTimer += deltaTime;
    if (this.hazardTimer > 6.0) {
      this.createHazardZone(playerPosition);
      this.hazardTimer = 0;
    }
  }

  private teleport(): void {
    const randomPoint = this.teleportPoints[Math.floor(Math.random() * this.teleportPoints.length)];
    this.mesh.position = randomPoint.clone();
  }

  private createHazardZone(nearPosition: Vector3): void {
    const hazard = MeshBuilder.CreateCylinder('hazard', {
      height: 0.1,
      diameter: 4
    }, this.scene);

    hazard.position = nearPosition.clone();
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

  protected checkAttack(playerPosition: Vector3): void {
    if (this.isStunned) return;

    if (this.isInAttackRange(playerPosition) && this.timeSinceLastAttack >= this.getAttackCooldown()) {
      this.attack();
      this.timeSinceLastAttack = 0;
    }
  }

  protected getAttackCooldown(): number {
    switch (this.currentPhase) {
      case 1: return 3.0;
      case 2: return 2.0;
      case 3: return 1.5;
      default: return 3.0;
    }
  }

  private attack(): void {
    if (this.attackCallback) {
      this.attackCallback(this.damage);
    }
  }

  public stun(duration: number): void {
    this.isStunned = true;
    this.stunTimer = duration;

    if (this.stunCallback) {
      this.stunCallback(duration);
    }
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

  onAttack(callback: (damage: number) => void): void {
    this.attackCallback = callback;
  }

  onStun(callback: (duration: number) => void): void {
    this.stunCallback = callback;
  }

  dispose(): void {
    this.hazardZones.forEach(h => h.dispose());
    this.hazardZones = [];
    super.dispose();
  }
}
