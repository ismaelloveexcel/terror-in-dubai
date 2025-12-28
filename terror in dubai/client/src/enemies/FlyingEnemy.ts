import { Mesh, Vector3, Color3, Scene } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { enemyConfigs, ENEMY_TYPES } from '../config/gameConfig';

export class FlyingEnemy extends Enemy {
  private attackCallback: ((damage: number) => void) | null = null;
  private hoverHeight: number = 3;
  private isDiving: boolean = false;
  private diveTimer: number = 0;

  constructor(mesh: Mesh, scene: Scene) {
    const config = enemyConfigs[ENEMY_TYPES.FLYING];
    super(mesh, ENEMY_TYPES.FLYING, config.speed, config.damage, config.attackRange, config.health, scene);

    // Start at hover height
    this.mesh.position.y = this.hoverHeight;
  }

  protected getColor(): Color3 {
    return new Color3(0.2, 0.2, 0.4); // Dark blue
  }

  protected updateMovement(deltaTime: number, playerPosition: Vector3): void {
    this.diveTimer += deltaTime;

    if (this.isDiving) {
      // Dive at player
      this.moveTowards(playerPosition, deltaTime * 2); // Faster when diving

      // Return to hover after dive
      if (this.diveTimer > 1.5) {
        this.isDiving = false;
        this.diveTimer = 0;
      }
    } else {
      // Hover above player
      const hoverTarget = playerPosition.clone();
      hoverTarget.y = this.hoverHeight;
      this.moveTowards(hoverTarget, deltaTime);

      // Periodic dive attack
      if (this.diveTimer > 3.0 && Vector3.Distance(this.mesh.position, hoverTarget) < 5) {
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

  protected checkAttack(playerPosition: Vector3): void {
    if (this.isDiving && this.isInAttackRange(playerPosition) && this.timeSinceLastAttack >= this.getAttackCooldown()) {
      this.attack();
      this.timeSinceLastAttack = 0;
    }
  }

  protected getAttackCooldown(): number {
    return 2.0;
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
