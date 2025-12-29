import {
  Scene,
  Vector3,
  Color4,
  ParticleSystem,
  Texture,
  MeshBuilder,
  Mesh
} from '@babylonjs/core';
import { isMobile, performanceConfig } from '../config/gameConfig';

/**
 * ParticleEffects - Enhanced visual effects using particle systems
 * 
 * Features:
 * - Ambient spores floating in the air (Upside-Down atmosphere)
 * - Muzzle flash particles on shooting
 * - Enemy death explosions
 * - Impact sparks when hitting enemies
 * - Collection sparkles for memory fragments
 * - Hazard zone ground effects
 */
export class ParticleEffects {
  private ambientSpores: ParticleSystem | null = null;
  private particleEmitter: Mesh;

  constructor(private scene: Scene) {
    // Create a hidden emitter mesh
    this.particleEmitter = MeshBuilder.CreateBox('particleEmitter', { size: 0.1 }, scene);
    this.particleEmitter.isVisible = false;

    this.setupAmbientSpores();
  }

  /**
   * Create floating spores/particles for the eerie atmosphere
   */
  private setupAmbientSpores(): void {
    const maxParticles = isMobile ? 30 : performanceConfig.particleLimit;

    this.ambientSpores = new ParticleSystem('ambientSpores', maxParticles, this.scene);

    // Use a simple circle texture (procedural)
    this.ambientSpores.particleTexture = this.createCircleTexture();

    // Emit from a large area above the player
    this.ambientSpores.emitter = new Vector3(0, 10, 0);
    this.ambientSpores.minEmitBox = new Vector3(-30, -5, -30);
    this.ambientSpores.maxEmitBox = new Vector3(30, 5, 30);

    // Color - reddish/purple spores
    this.ambientSpores.color1 = new Color4(0.8, 0.2, 0.2, 0.3);
    this.ambientSpores.color2 = new Color4(0.5, 0.1, 0.3, 0.2);
    this.ambientSpores.colorDead = new Color4(0.2, 0.05, 0.1, 0);

    // Size
    this.ambientSpores.minSize = 0.05;
    this.ambientSpores.maxSize = 0.15;

    // Lifetime
    this.ambientSpores.minLifeTime = 5;
    this.ambientSpores.maxLifeTime = 10;

    // Emit rate
    this.ambientSpores.emitRate = isMobile ? 5 : 15;

    // Speed - slow floating
    this.ambientSpores.minEmitPower = 0.1;
    this.ambientSpores.maxEmitPower = 0.3;
    this.ambientSpores.updateSpeed = 0.01;

    // Direction - mostly downward with some drift
    this.ambientSpores.direction1 = new Vector3(-0.5, -1, -0.5);
    this.ambientSpores.direction2 = new Vector3(0.5, -0.2, 0.5);

    // Gravity
    this.ambientSpores.gravity = new Vector3(0, -0.05, 0);

    // Blending
    this.ambientSpores.blendMode = ParticleSystem.BLENDMODE_ADD;

    // Start
    this.ambientSpores.start();
  }

  /**
   * Create a procedural circle texture for particles
   */
  private createCircleTexture(): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw a radial gradient circle
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }

    const texture = new Texture('data:' + canvas.toDataURL(), this.scene, true, false);
    return texture;
  }

  /**
   * Create muzzle flash effect at weapon position
   */
  createMuzzleFlash(position: Vector3, direction: Vector3): void {
    if (isMobile && Math.random() > 0.3) return; // Reduce on mobile

    const flash = new ParticleSystem('muzzleFlash', 20, this.scene);
    flash.particleTexture = this.createCircleTexture();

    flash.emitter = position;
    flash.minEmitBox = Vector3.Zero();
    flash.maxEmitBox = Vector3.Zero();

    // Bright orange/yellow flash
    flash.color1 = new Color4(1, 0.8, 0.3, 1);
    flash.color2 = new Color4(1, 0.5, 0.1, 0.8);
    flash.colorDead = new Color4(0.5, 0.2, 0, 0);

    flash.minSize = 0.1;
    flash.maxSize = 0.3;

    flash.minLifeTime = 0.05;
    flash.maxLifeTime = 0.1;

    flash.emitRate = 100;
    flash.manualEmitCount = 15;

    flash.minEmitPower = 2;
    flash.maxEmitPower = 5;

    flash.direction1 = direction.scale(0.8);
    flash.direction2 = direction.scale(1.2);

    flash.blendMode = ParticleSystem.BLENDMODE_ADD;

    flash.start();

    // Dispose after effect completes
    setTimeout(() => {
      flash.dispose();
    }, 200);
  }

  /**
   * Create impact sparks when hitting an enemy
   */
  createImpactSparks(position: Vector3): void {
    if (isMobile && Math.random() > 0.5) return;

    const sparks = new ParticleSystem('impactSparks', 30, this.scene);
    sparks.particleTexture = this.createCircleTexture();

    sparks.emitter = position;
    sparks.minEmitBox = Vector3.Zero();
    sparks.maxEmitBox = Vector3.Zero();

    // Red/orange sparks
    sparks.color1 = new Color4(1, 0.3, 0.1, 1);
    sparks.color2 = new Color4(0.8, 0.1, 0.1, 0.8);
    sparks.colorDead = new Color4(0.3, 0, 0, 0);

    sparks.minSize = 0.05;
    sparks.maxSize = 0.15;

    sparks.minLifeTime = 0.1;
    sparks.maxLifeTime = 0.3;

    sparks.emitRate = 100;
    sparks.manualEmitCount = 20;

    sparks.minEmitPower = 3;
    sparks.maxEmitPower = 8;

    sparks.direction1 = new Vector3(-1, -1, -1);
    sparks.direction2 = new Vector3(1, 1, 1);

    sparks.gravity = new Vector3(0, -10, 0);

    sparks.blendMode = ParticleSystem.BLENDMODE_ADD;

    sparks.start();

    setTimeout(() => {
      sparks.dispose();
    }, 400);
  }

  /**
   * Create explosion effect for enemy death
   */
  createDeathExplosion(position: Vector3, color: Color4 = new Color4(0.8, 0.2, 0.1, 1)): void {
    const maxParticles = isMobile ? 30 : 60;
    const explosion = new ParticleSystem('deathExplosion', maxParticles, this.scene);
    explosion.particleTexture = this.createCircleTexture();

    explosion.emitter = position;
    explosion.minEmitBox = Vector3.Zero();
    explosion.maxEmitBox = Vector3.Zero();

    explosion.color1 = color;
    explosion.color2 = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0.8);
    explosion.colorDead = new Color4(0, 0, 0, 0);

    explosion.minSize = 0.2;
    explosion.maxSize = 0.6;

    explosion.minLifeTime = 0.3;
    explosion.maxLifeTime = 0.8;

    explosion.emitRate = 200;
    explosion.manualEmitCount = maxParticles;

    explosion.minEmitPower = 5;
    explosion.maxEmitPower = 15;

    explosion.direction1 = new Vector3(-1, -0.5, -1);
    explosion.direction2 = new Vector3(1, 2, 1);

    explosion.gravity = new Vector3(0, -5, 0);

    explosion.blendMode = ParticleSystem.BLENDMODE_ADD;

    explosion.start();

    setTimeout(() => {
      explosion.dispose();
    }, 1000);
  }

  /**
   * Create sparkle effect for collecting memory fragments
   */
  createCollectionSparkle(position: Vector3): void {
    const sparkle = new ParticleSystem('collectionSparkle', 50, this.scene);
    sparkle.particleTexture = this.createCircleTexture();

    sparkle.emitter = position;
    sparkle.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
    sparkle.maxEmitBox = new Vector3(0.5, 0.5, 0.5);

    // Golden sparkles
    sparkle.color1 = new Color4(1, 0.9, 0.3, 1);
    sparkle.color2 = new Color4(1, 0.7, 0.1, 0.8);
    sparkle.colorDead = new Color4(1, 0.5, 0, 0);

    sparkle.minSize = 0.1;
    sparkle.maxSize = 0.3;

    sparkle.minLifeTime = 0.5;
    sparkle.maxLifeTime = 1.5;

    sparkle.emitRate = 100;
    sparkle.manualEmitCount = 40;

    sparkle.minEmitPower = 2;
    sparkle.maxEmitPower = 5;

    sparkle.direction1 = new Vector3(-1, 1, -1);
    sparkle.direction2 = new Vector3(1, 3, 1);

    sparkle.gravity = new Vector3(0, -2, 0);

    sparkle.blendMode = ParticleSystem.BLENDMODE_ADD;

    sparkle.start();

    setTimeout(() => {
      sparkle.dispose();
    }, 2000);
  }

  /**
   * Create ground hazard effect (for boss phase 3)
   */
  createHazardGroundEffect(position: Vector3): ParticleSystem {
    const hazard = new ParticleSystem('hazardEffect', isMobile ? 20 : 40, this.scene);
    hazard.particleTexture = this.createCircleTexture();

    hazard.emitter = position;
    hazard.minEmitBox = new Vector3(-2, 0, -2);
    hazard.maxEmitBox = new Vector3(2, 0.1, 2);

    // Red dangerous particles rising
    hazard.color1 = new Color4(1, 0, 0, 0.8);
    hazard.color2 = new Color4(0.8, 0.2, 0, 0.5);
    hazard.colorDead = new Color4(0.3, 0, 0, 0);

    hazard.minSize = 0.1;
    hazard.maxSize = 0.4;

    hazard.minLifeTime = 0.5;
    hazard.maxLifeTime = 1.5;

    hazard.emitRate = 20;

    hazard.minEmitPower = 1;
    hazard.maxEmitPower = 3;

    hazard.direction1 = new Vector3(-0.2, 1, -0.2);
    hazard.direction2 = new Vector3(0.2, 2, 0.2);

    hazard.blendMode = ParticleSystem.BLENDMODE_ADD;

    hazard.start();

    return hazard;
  }

  /**
   * Update the ambient spores emitter to follow player
   */
  updateSporesPosition(playerPosition: Vector3): void {
    if (this.ambientSpores) {
      (this.ambientSpores.emitter as Vector3).x = playerPosition.x;
      (this.ambientSpores.emitter as Vector3).z = playerPosition.z;
    }
  }

  /**
   * Set low performance mode
   */
  setLowPerformanceMode(enabled: boolean): void {
    if (this.ambientSpores) {
      this.ambientSpores.emitRate = enabled ? 3 : (isMobile ? 5 : 15);
    }
  }

  dispose(): void {
    if (this.ambientSpores) {
      this.ambientSpores.dispose();
      this.ambientSpores = null;
    }

    this.particleEmitter.dispose();
  }
}
