import { Scene, Ray, Vector3, Color3, StandardMaterial } from '@babylonjs/core';
import { weaponConfig } from '../config/gameConfig';
import { IEnemy } from '../types';

export class WeaponSystem {
  private lastFireTime: number = 0;
  private onFireCallback: (() => void) | null = null;
  private onHitCallback: ((enemy: IEnemy, damage: number) => void) | null = null;

  constructor(private scene: Scene) {}

  canFire(): boolean {
    const now = performance.now() / 1000;
    return now - this.lastFireTime >= weaponConfig.fireRate;
  }

  fire(origin: Vector3, direction: Vector3, enemies: IEnemy[]): { hit: boolean; recoil: number } {
    if (!this.canFire()) {
      return { hit: false, recoil: 0 };
    }

    this.lastFireTime = performance.now() / 1000;

    // Create ray
    const ray = new Ray(origin, direction, weaponConfig.range);

    // Debug visualization (optional, remove in production)
    // const rayHelper = new RayHelper(ray);
    // rayHelper.show(this.scene, new Color3(1, 0, 0));

    // Check for hits
    let hitSomething = false;

    for (const enemy of enemies) {
      if (!enemy.isAlive || enemy.isDying) continue;

      const pickInfo = ray.intersectsMesh(enemy.mesh, false);

      if (pickInfo.hit) {
        enemy.takeDamage(weaponConfig.damage);
        hitSomething = true;

        if (this.onHitCallback) {
          this.onHitCallback(enemy, weaponConfig.damage);
        }

        // Flash enemy material
        this.flashEnemyHit(enemy);

        break; // Hit first enemy in line
      }
    }

    if (this.onFireCallback) {
      this.onFireCallback();
    }

    return {
      hit: hitSomething,
      recoil: weaponConfig.recoil
    };
  }

  private flashEnemyHit(enemy: IEnemy): void {
    const material = enemy.mesh.material as StandardMaterial;
    if (!material) return;

    const originalEmissive = material.emissiveColor.clone();
    material.emissiveColor = new Color3(1, 0, 0);

    setTimeout(() => {
      material.emissiveColor = originalEmissive;
    }, 100);
  }

  onFire(callback: () => void): void {
    this.onFireCallback = callback;
  }

  onHit(callback: (enemy: IEnemy, damage: number) => void): void {
    this.onHitCallback = callback;
  }
}
