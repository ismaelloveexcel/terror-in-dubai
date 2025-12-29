// PlayerController.ts - First Person Player Controller
// Save Ismael - Premium FPS Controls

import {
  Scene,
  Vector3,
  UniversalCamera,
  MeshBuilder,
  Mesh,
  Ray,
  AbstractMesh,
} from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { HealthSystem } from './HealthSystem';
import { WeaponSystem } from './WeaponSystem';
import { playerConfig, performanceConfig } from '../config/gameConfig';
import { IPlayer, IDamageable } from '../types';

export class PlayerController implements IPlayer, IDamageable {
  private scene: Scene;
  private inputManager: InputManager;
  
  // Camera & Collider
  private camera: UniversalCamera;
  private collider: Mesh;
  
  // Systems
  public healthSystem: HealthSystem;
  public weaponSystem: WeaponSystem;
  
  // State
  public mesh: Mesh;
  public position: Vector3;
  public isRunning: boolean = false;
  public isCrouching: boolean = false;
  
  // Stamina
  public stamina: number = playerConfig.maxStamina;
  public maxStamina: number = playerConfig.maxStamina;
  
  // Camera rotation
  private rotationX: number = 0; // Pitch
  private rotationY: number = 0; // Yaw
  
  // Footstep timer
  private footstepTimer: number = 0;
  private footstepInterval: number = 0.4;
  
  // Callbacks
  public onDamage?: (amount: number) => void;
  public onDeath?: () => void;
  public onShoot?: (hit: boolean, target?: AbstractMesh) => void;
  
  // Health interface
  public get health(): number { return this.healthSystem.current; }
  public get maxHealth(): number { return this.healthSystem.max; }
  
  constructor(scene: Scene, inputManager: InputManager, startPosition: Vector3) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.position = startPosition.clone();
    
    // Create camera
    this.camera = new UniversalCamera('playerCamera', startPosition, scene);
    this.camera.fov = (playerConfig.fov * Math.PI) / 180;
    this.camera.minZ = 0.1;
    this.camera.maxZ = 500;
    this.camera.inertia = 0;
    this.camera.angularSensibility = 0; // We handle rotation manually
    scene.activeCamera = this.camera;
    
    // Create invisible collider
    this.collider = MeshBuilder.CreateCapsule('playerCollider', {
      height: playerConfig.height,
      radius: playerConfig.radius,
    }, scene);
    this.collider.position = startPosition.clone();
    this.collider.isVisible = false;
    this.collider.checkCollisions = true;
    this.collider.ellipsoid = new Vector3(
      playerConfig.radius,
      playerConfig.height / 2,
      playerConfig.radius
    );
    
    this.mesh = this.collider;
    
    // Initialize systems
    this.healthSystem = new HealthSystem(playerConfig.maxHealth);
    this.weaponSystem = new WeaponSystem(scene, this.camera);
    
    // Setup health callbacks
    this.healthSystem.onDamage = (amount) => {
      this.onDamage?.(amount);
    };
    
    this.healthSystem.onDeath = () => {
      this.onDeath?.();
    };
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    // Handle movement
    this.handleMovement(deltaTime);
    
    // Handle look
    this.handleLook();
    
    // Handle shooting
    this.handleShooting(deltaTime);
    
    // Update stamina
    this.updateStamina(deltaTime);
    
    // Update health regen
    this.healthSystem.update(deltaTime);
    
    // Update weapon
    this.weaponSystem.update(deltaTime);
    
    // Sync positions
    this.syncPositions();
  }
  
  // ===========================================================================
  // MOVEMENT
  // ===========================================================================
  
  private handleMovement(deltaTime: number): void {
    const input = this.inputManager.getState();
    const movement = this.inputManager.getMovementVector();
    
    if (Math.abs(movement.x) < 0.01 && Math.abs(movement.y) < 0.01) {
      this.isRunning = false;
      return;
    }
    
    // Determine speed
    let speed = playerConfig.walkSpeed;
    
    // Sprint
    if (input.sprint && this.stamina > 0 && !this.isCrouching) {
      speed = playerConfig.sprintSpeed;
      this.isRunning = true;
    } else {
      this.isRunning = false;
    }
    
    // Crouch
    if (input.crouch) {
      speed = playerConfig.crouchSpeed;
      this.isCrouching = true;
    } else {
      this.isCrouching = false;
    }
    
    // Calculate movement direction relative to camera
    const forward = this.camera.getDirection(Vector3.Forward());
    forward.y = 0;
    forward.normalize();
    
    const right = this.camera.getDirection(Vector3.Right());
    right.y = 0;
    right.normalize();
    
    // Calculate velocity
    const velocity = new Vector3(0, 0, 0);
    velocity.addInPlace(forward.scale(movement.y * speed * deltaTime));
    velocity.addInPlace(right.scale(movement.x * speed * deltaTime));
    
    // Apply gravity
    velocity.y = -9.81 * deltaTime;
    
    // Move collider with collision detection
    this.collider.moveWithCollisions(velocity);
    
    // Update footsteps
    if (this.isMoving()) {
      this.footstepTimer += deltaTime;
      if (this.footstepTimer >= this.footstepInterval / (this.isRunning ? 1.5 : 1)) {
        this.footstepTimer = 0;
        // Audio manager would play footstep here
      }
    }
  }
  
  private isMoving(): boolean {
    return this.inputManager.isMoving();
  }
  
  // ===========================================================================
  // LOOK
  // ===========================================================================
  
  private handleLook(): void {
    const input = this.inputManager.getState();
    
    // Update rotation
    this.rotationY -= input.lookX;
    this.rotationX -= input.lookY;
    
    // Clamp pitch
    this.rotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotationX));
    
    // Apply to camera
    this.camera.rotation.x = this.rotationX;
    this.camera.rotation.y = this.rotationY;
  }
  
  public look(deltaX: number, deltaY: number): void {
    this.rotationY -= deltaX;
    this.rotationX -= deltaY;
    this.rotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotationX));
  }
  
  // ===========================================================================
  // SHOOTING
  // ===========================================================================
  
  private handleShooting(deltaTime: number): void {
    if (this.inputManager.isShooting()) {
      this.shoot();
    }
    
    const input = this.inputManager.getState();
    if (input.reload) {
      this.reload();
    }
  }
  
  public shoot(): boolean {
    if (!this.weaponSystem.canFire()) return false;
    
    const fired = this.weaponSystem.fire();
    if (!fired) return false;
    
    // Raycast for hit detection
    const ray = this.camera.getForwardRay(this.weaponSystem.getCurrentWeapon().range);
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh.isPickable && mesh !== this.collider && !mesh.name.includes('player');
    });
    
    if (hit?.pickedMesh) {
      this.onShoot?.(true, hit.pickedMesh);
      return true;
    }
    
    this.onShoot?.(false);
    return false;
  }
  
  public reload(): void {
    this.weaponSystem.reload();
  }
  
  // ===========================================================================
  // STAMINA
  // ===========================================================================
  
  private updateStamina(deltaTime: number): void {
    if (this.isRunning) {
      this.stamina -= playerConfig.staminaDrainRate * deltaTime;
      this.stamina = Math.max(0, this.stamina);
    } else {
      this.stamina += playerConfig.staminaRegenRate * deltaTime;
      this.stamina = Math.min(this.maxStamina, this.stamina);
    }
  }
  
  // ===========================================================================
  // HEALTH / DAMAGE
  // ===========================================================================
  
  public takeDamage(amount: number): void {
    this.healthSystem.takeDamage(amount);
  }
  
  public heal(amount: number): void {
    this.healthSystem.heal(amount);
  }
  
  public isDead(): boolean {
    return this.healthSystem.isDead();
  }
  
  // ===========================================================================
  // POSITION
  // ===========================================================================
  
  private syncPositions(): void {
    this.position = this.collider.position.clone();
    
    // Camera follows collider at eye height
    this.camera.position = this.collider.position.clone();
    this.camera.position.y += playerConfig.height / 2 - 0.1;
    
    // Adjust for crouch
    if (this.isCrouching) {
      this.camera.position.y -= 0.5;
    }
  }
  
  public move(direction: Vector3): void {
    this.collider.moveWithCollisions(direction);
    this.syncPositions();
  }
  
  public setPosition(position: Vector3): void {
    this.collider.position = position.clone();
    this.syncPositions();
  }
  
  public getPosition(): Vector3 {
    return this.position.clone();
  }
  
  public getCamera(): UniversalCamera {
    return this.camera;
  }
  
  public getForwardRay(distance: number = 100): Ray {
    return this.camera.getForwardRay(distance);
  }
  
  public getLookDirection(): Vector3 {
    return this.camera.getDirection(Vector3.Forward());
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.weaponSystem.dispose();
    this.collider.dispose();
    this.camera.dispose();
  }
}

export default PlayerController;
