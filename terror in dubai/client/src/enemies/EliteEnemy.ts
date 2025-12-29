import { Mesh, Vector3, Color3, Scene } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { enemyConfigs, ENEMY_TYPES } from '../config/gameConfig';

export class EliteEnemy extends Enemy {
  private attackCallback: ((damage: number) => void) | null = null;
  private roarTimer: number = 0;

  constructor(mesh: Mesh, scene: Scene) {
    const config = enemyConfigs[ENEMY_TYPES.ELITE];
    super(mesh, ENEMY_TYPES.ELITE, config.speed, config.damage, config.attackRange, config.health, scene);

    // Scale up to look imposing
    this.mesh.scaling = new Vector3(1.5, 1.5, 1.5);
  }

  protected getColor(): Color3 {
    return new Color3(0.4, 0.1, 0.2); // Dark crimson
  }

  protected updateMovement(deltaTime: number, playerPosition: Vector3): void {
    this.roarTimer += deltaTime;

    // Slower but deliberate movement
    this.moveTowards(playerPosition, deltaTime * 0.8);

    // Breathing animation
    const time = performance.now() / 1000;
    const breathScale = 1.5 + Math.sin(time * 2) * 0.05;
    this.mesh.scaling.setAll(breathScale);

    // Periodic roar (visual only, no actual sound unless implemented)
    if (this.roarTimer > 8.0) {
      this.roar();
      this.roarTimer = 0;
    }
  }

  protected checkAttack(playerPosition: Vector3): void {
    if (this.isInAttackRange(playerPosition) && this.timeSinceLastAttack >= this.getAttackCooldown()) {
      this.attack();
      this.timeSinceLastAttack = 0;
    }
  }

  protected getAttackCooldown(): number {
    return 1.5;
  }

  private attack(): void {
    if (this.attackCallback) {
      this.attackCallback(this.damage);
    }

    // Small lunge forward
    const forward = this.mesh.forward;
    this.mesh.position.addInPlace(forward.scale(0.5));
  }

  private roar(): void {
    // Visual roar effect - scale up briefly
    const originalScale = this.mesh.scaling.clone();
    this.mesh.scaling.scaleInPlace(1.2);

    setTimeout(() => {
      this.mesh.scaling = originalScale;
    }, 300);
  }

  onAttack(callback: (damage: number) => void): void {
    this.attackCallback = callback;
  }
}
