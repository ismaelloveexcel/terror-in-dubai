import { Mesh, Vector3, StandardMaterial, Color3, Scene, Animation } from '@babylonjs/core';
import { IEnemy } from '../types';

export abstract class Enemy implements IEnemy {
  public health: number;
  public maxHealth: number;
  public isAlive: boolean = true;
  public isDying: boolean = false;
  public target: Vector3 | null = null;

  protected timeSinceLastAttack: number = 0;

  constructor(
    public mesh: Mesh,
    public type: string,
    public speed: number,
    public damage: number,
    public attackRange: number,
    maxHealth: number,
    protected scene: Scene
  ) {
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.setupMaterial();
  }

  private setupMaterial(): void {
    const material = new StandardMaterial(`${this.type}Mat`, this.scene);
    material.diffuseColor = this.getColor();
    material.emissiveColor = this.getColor().scale(0.3);
    material.specularColor = new Color3(0, 0, 0);
    this.mesh.material = material;
  }

  protected abstract getColor(): Color3;

  update(deltaTime: number, playerPosition: Vector3): void {
    if (!this.isAlive || this.isDying) return;

    this.timeSinceLastAttack += deltaTime;
    this.target = playerPosition;

    this.updateMovement(deltaTime, playerPosition);
    this.checkAttack(playerPosition);
  }

  protected abstract updateMovement(deltaTime: number, playerPosition: Vector3): void;
  protected abstract checkAttack(playerPosition: Vector3): void;
  protected abstract getAttackCooldown(): number;

  takeDamage(amount: number): void {
    if (!this.isAlive || this.isDying) return;

    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    if (this.isDying) return;

    this.isDying = true;
    this.isAlive = false;

    // Death animation - fade and shrink
    const fadeOut = new Animation(
      'fadeOut',
      'visibility',
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    fadeOut.setKeys([
      { frame: 0, value: 1 },
      { frame: 30, value: 0 }
    ]);

    const shrink = new Animation(
      'shrink',
      'scaling',
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    shrink.setKeys([
      { frame: 0, value: this.mesh.scaling.clone() },
      { frame: 30, value: Vector3.Zero() }
    ]);

    this.mesh.animations = [fadeOut, shrink];
    this.scene.beginAnimation(this.mesh, 0, 30, false, 1, () => {
      this.dispose();
    });
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.dispose();
    }
  }

  protected moveTowards(target: Vector3, deltaTime: number): void {
    const direction = target.subtract(this.mesh.position);
    direction.y = 0; // Keep on ground
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize();
      this.mesh.position.addInPlace(direction.scale(this.speed * deltaTime));

      // Look at target
      this.mesh.lookAt(target);
    }
  }

  protected isInAttackRange(playerPosition: Vector3): boolean {
    const distance = Vector3.Distance(this.mesh.position, playerPosition);
    return distance <= this.attackRange;
  }
}
