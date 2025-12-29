// Enemy.ts - Base Enemy Class
// Save Ismael - Premium Enemy System

import {
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Animation,
  AbstractMesh,
} from '@babylonjs/core';
import { IEnemy, EnemyType, IDamageable } from '../types';
import { enemyConfig, visualConfig } from '../config/gameConfig';
import { hasAsset, getAssetUrl, fallbackMeshes } from '../config/assetConfig';

export abstract class Enemy implements IEnemy, IDamageable {
  protected scene: Scene;
  
  // IEntity
  public mesh: Mesh;
  public position: Vector3;
  
  // IEnemy
  public type: EnemyType;
  public health: number;
  public maxHealth: number;
  public damage: number;
  public speed: number;
  public attackRange: number;
  public detectionRange: number;
  public isAlerted: boolean = false;
  public target: Vector3 | null = null;
  
  // State
  protected isAttacking: boolean = false;
  protected attackCooldown: number = 0;
  protected attackCooldownMax: number;
  protected isDying: boolean = false;
  protected points: number;
  
  // Callbacks
  public onDeath?: () => void;
  public onAttack?: (damage: number) => void;
  
  constructor(scene: Scene, type: EnemyType, position: Vector3) {
    this.scene = scene;
    this.type = type;
    this.position = position.clone();
    
    // Get config for enemy type
    const config = enemyConfig[type as keyof typeof enemyConfig];
    if (config) {
      this.maxHealth = config.health;
      this.health = config.health;
      this.damage = config.damage;
      this.speed = config.speed;
      this.attackRange = config.attackRange;
      this.attackCooldownMax = config.attackCooldown;
      this.detectionRange = config.detectionRange;
      this.points = config.points;
    } else {
      // Defaults
      this.maxHealth = 50;
      this.health = 50;
      this.damage = 10;
      this.speed = 3;
      this.attackRange = 2;
      this.attackCooldownMax = 1.5;
      this.detectionRange = 20;
      this.points = 100;
    }
    
    this.attackCooldown = 0;
    
    // Create mesh
    this.mesh = this.createMesh();
    this.mesh.position = position.clone();
    this.mesh.checkCollisions = true;
    this.mesh.isPickable = true;
  }
  
  // ===========================================================================
  // MESH CREATION
  // ===========================================================================
  
  protected abstract createMesh(): Mesh;
  
  protected createFallbackMesh(config: { type: string; color: string; emissive: string; width?: number; height?: number; depth?: number; diameter?: number; radius?: number }): Mesh {
    let mesh: Mesh;
    
    switch (config.type) {
      case 'box':
        mesh = MeshBuilder.CreateBox(`enemy_${this.type}`, {
          width: config.width || 1,
          height: config.height || 1,
          depth: config.depth || 1,
        }, this.scene);
        break;
      case 'sphere':
        mesh = MeshBuilder.CreateSphere(`enemy_${this.type}`, {
          diameter: config.diameter || 1,
        }, this.scene);
        break;
      case 'capsule':
        mesh = MeshBuilder.CreateCapsule(`enemy_${this.type}`, {
          height: config.height || 2,
          radius: config.radius || 0.5,
        }, this.scene);
        break;
      case 'cylinder':
        mesh = MeshBuilder.CreateCylinder(`enemy_${this.type}`, {
          height: config.height || 2,
          diameter: config.diameter || 1,
        }, this.scene);
        break;
      default:
        mesh = MeshBuilder.CreateBox(`enemy_${this.type}`, { size: 1 }, this.scene);
    }
    
    // Apply material
    const mat = new StandardMaterial(`enemy_${this.type}_mat`, this.scene);
    mat.diffuseColor = Color3.FromHexString(config.color);
    mat.emissiveColor = Color3.FromHexString(config.emissive).scale(0.3);
    mat.specularColor = new Color3(0.1, 0.1, 0.1);
    mesh.material = mat;
    
    return mesh;
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    if (this.isDying || this.isDead()) return;
    
    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
    
    // Update movement
    this.updateMovement(deltaTime);
    
    // Check for attack
    this.checkAttack();
    
    // Sync position
    this.position = this.mesh.position.clone();
  }
  
  protected abstract updateMovement(deltaTime: number): void;
  
  // ===========================================================================
  // COMBAT
  // ===========================================================================
  
  protected checkAttack(): void {
    if (!this.target || this.isAttacking || this.attackCooldown > 0) return;
    
    const distance = Vector3.Distance(this.position, this.target);
    if (distance <= this.attackRange) {
      this.attack();
    }
  }
  
  protected attack(): void {
    this.isAttacking = true;
    this.attackCooldown = this.attackCooldownMax;
    
    // Attack animation
    this.playAttackAnimation();
    
    // Deal damage
    this.onAttack?.(this.damage);
    
    setTimeout(() => {
      this.isAttacking = false;
    }, 500);
  }
  
  protected playAttackAnimation(): void {
    // Simple scale pulse
    const animation = new Animation(
      'attackAnim',
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    const keys = [
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 5, value: new Vector3(1.2, 1.2, 1.2) },
      { frame: 15, value: new Vector3(1, 1, 1) },
    ];
    
    animation.setKeys(keys);
    this.mesh.animations = [animation];
    this.scene.beginAnimation(this.mesh, 0, 15, false);
  }
  
  // ===========================================================================
  // DAMAGE
  // ===========================================================================
  
  public takeDamage(amount: number): void {
    if (this.isDying) return;
    
    this.health -= amount;
    
    // Hit flash
    this.flashHit();
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }
  
  protected flashHit(): void {
    const mat = this.mesh.material as StandardMaterial;
    if (!mat) return;
    
    const originalEmissive = mat.emissiveColor.clone();
    mat.emissiveColor = new Color3(1, 0.3, 0.3);
    
    setTimeout(() => {
      mat.emissiveColor = originalEmissive;
    }, 100);
  }
  
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
  
  public isDead(): boolean {
    return this.health <= 0;
  }
  
  public get isAlive(): boolean {
    return !this.isDead() && !this.isDying;
  }
  
  // ===========================================================================
  // DEATH
  // ===========================================================================
  
  protected die(): void {
    if (this.isDying) return;
    this.isDying = true;
    
    // Death animation
    const animation = new Animation(
      'deathAnim',
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    const keys = [
      { frame: 0, value: this.mesh.scaling.clone() },
      { frame: 10, value: this.mesh.scaling.scale(1.2) },
      { frame: 30, value: new Vector3(0.01, 0.01, 0.01) },
    ];
    
    animation.setKeys(keys);
    this.mesh.animations = [animation];
    
    this.scene.beginAnimation(this.mesh, 0, 30, false, 1, () => {
      this.onDeath?.();
      this.dispose();
    });
  }
  
  // ===========================================================================
  // AI
  // ===========================================================================
  
  public setTarget(target: Vector3): void {
    this.target = target;
    this.isAlerted = true;
  }
  
  public clearTarget(): void {
    this.target = null;
    this.isAlerted = false;
  }
  
  protected moveToward(target: Vector3, deltaTime: number): void {
    const direction = target.subtract(this.position);
    direction.y = 0; // Stay on ground
    direction.normalize();
    
    const velocity = direction.scale(this.speed * deltaTime);
    this.mesh.moveWithCollisions(velocity);
    
    // Face target
    this.mesh.lookAt(new Vector3(target.x, this.mesh.position.y, target.z));
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.mesh.dispose();
  }
}

export default Enemy;
