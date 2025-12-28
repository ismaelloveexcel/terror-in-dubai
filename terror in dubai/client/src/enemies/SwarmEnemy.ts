import { Mesh, Vector3, Color3, Scene } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { enemyConfigs, ENEMY_TYPES } from '../config/gameConfig';

export class SwarmEnemy extends Enemy {
  private attackCallback: ((damage: number) => void) | null = null;

  constructor(mesh: Mesh, scene: Scene) {
    const config = enemyConfigs[ENEMY_TYPES.SWARM];
    super(mesh, ENEMY_TYPES.SWARM, config.speed, config.damage, config.attackRange, config.health, scene);
  }

  protected getColor(): Color3 {
    return new Color3(0.3, 0.1, 0.1); // Dark red
  }

  protected updateMovement(deltaTime: number, playerPosition: Vector3): void {
    // Simple chase behavior with slight random offset to avoid stacking
    const offset = new Vector3(
      (Math.random() - 0.5) * 0.5,
      0,
      (Math.random() - 0.5) * 0.5
    );

    const targetPos = playerPosition.add(offset);
    this.moveTowards(targetPos, deltaTime);

    // Bob animation
    const time = performance.now() / 1000;
    this.mesh.position.y = 0.3 + Math.sin(time * 5) * 0.1;
  }

  protected checkAttack(playerPosition: Vector3): void {
    if (this.isInAttackRange(playerPosition) && this.timeSinceLastAttack >= this.getAttackCooldown()) {
      this.attack();
      this.timeSinceLastAttack = 0;
    }
  }

  protected getAttackCooldown(): number {
    return 1.0; // 1 second between attacks
  }

  private attack(): void {
    if (this.attackCallback) {
      this.attackCallback(this.damage);
    }
  }

  onAttack(callback: (damage: number) => void): void {
    this.attackCallback = callback;
  }
}
