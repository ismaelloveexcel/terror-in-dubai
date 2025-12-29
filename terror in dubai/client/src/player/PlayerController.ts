import { Scene, UniversalCamera, Vector3, Mesh, MeshBuilder } from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { HealthSystem } from './HealthSystem';
import { WeaponSystem } from './WeaponSystem';
import { playerConfig } from '../config/gameConfig';
import { IEnemy } from '../types';

export class PlayerController {
  public camera: UniversalCamera;
  public health: HealthSystem;
  public weapon: WeaponSystem;
  public position: Vector3;

  private isSprinting: boolean = false;
  private collider: Mesh;

  constructor(
    private scene: Scene,
    private input: InputManager,
    startPosition: Vector3 = new Vector3(0, playerConfig.height, 0)
  ) {
    this.position = startPosition.clone();

    // Create camera
    this.camera = new UniversalCamera('playerCamera', this.position.clone(), this.scene);
    this.camera.attachControl(true);
    this.camera.speed = 0; // We handle movement manually
    this.camera.angularSensibility = 2000;
    this.camera.fov = 1.2;
    this.camera.minZ = 0.1;
    this.camera.maxZ = 500;

    // Create invisible collider
    this.collider = MeshBuilder.CreateCapsule('playerCollider', {
      height: playerConfig.height,
      radius: playerConfig.radius
    }, this.scene);
    this.collider.position = this.position.clone();
    this.collider.isVisible = false;
    this.collider.checkCollisions = true;

    // Systems
    this.health = new HealthSystem();
    this.weapon = new WeaponSystem();
  }

  update(deltaTime: number, enemies: IEnemy[]): void {
    if (!this.health.state.isAlive || !this.health.state.canMove) return;

    this.handleMovement(deltaTime);
    this.handleLook();
    this.handleShooting(enemies);

    // Sync camera with collider
    this.camera.position.copyFrom(this.collider.position);
    this.camera.position.y += playerConfig.height / 2;
    this.position.copyFrom(this.camera.position);
  }

  private handleMovement(deltaTime: number): void {
    const moveVector = Vector3.Zero();

    // Keyboard input (desktop)
    if (this.input.isKeyDown('KeyW')) moveVector.z += 1;
    if (this.input.isKeyDown('KeyS')) moveVector.z -= 1;
    if (this.input.isKeyDown('KeyA')) moveVector.x -= 1;
    if (this.input.isKeyDown('KeyD')) moveVector.x += 1;

    // Mobile joystick input
    if (Math.abs(this.input.touchJoystick.x) > 0.1 || Math.abs(this.input.touchJoystick.y) > 0.1) {
      moveVector.x += this.input.touchJoystick.x;
      moveVector.z += this.input.touchJoystick.y;
    }

    // Sprint
    this.isSprinting = this.input.isKeyDown('ShiftLeft') || this.input.isKeyDown('ShiftRight');

    if (moveVector.lengthSquared() > 0) {
      moveVector.normalize();

      // Transform to camera space
      const forward = this.camera.getDirection(Vector3.Forward());
      const right = this.camera.getDirection(Vector3.Right());

      forward.y = 0;
      right.y = 0;
      forward.normalize();
      right.normalize();

      const worldMove = forward.scale(moveVector.z).add(right.scale(moveVector.x));

      const speed = this.isSprinting ? playerConfig.sprintSpeed : playerConfig.walkSpeed;
      const finalSpeed = speed * this.health.state.moveSpeedMultiplier;

      this.collider.moveWithCollisions(worldMove.scale(finalSpeed * deltaTime));
    }
  }

  private handleLook(): void {
    if (this.input.isPointerLocked) {
      const sensitivity = 0.002;

      this.camera.rotation.y += this.input.mouseDeltaX * sensitivity;
      this.camera.rotation.x += this.input.mouseDeltaY * sensitivity;

      // Clamp vertical rotation
      this.camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.camera.rotation.x));

      this.input.resetMouseDelta();
    }
  }

  private handleShooting(enemies: IEnemy[]): void {
    const shouldFire = this.input.isMouseDown || this.input.isFiring;

    if (shouldFire && this.weapon.canFire()) {
      const origin = this.camera.position.clone();
      const direction = this.camera.getDirection(Vector3.Forward());

      const result = this.weapon.fire(origin, direction, enemies);

      if (result.hit || true) { // Always apply recoil
        // Apply camera recoil
        this.camera.rotation.x -= result.recoil;
      }
    }
  }

  setPosition(position: Vector3): void {
    this.position.copyFrom(position);
    this.camera.position.copyFrom(position);
    this.collider.position.copyFrom(position);
    this.collider.position.y -= playerConfig.height / 2;
  }

  dispose(): void {
    this.collider.dispose();
    this.camera.dispose();
  }
}
