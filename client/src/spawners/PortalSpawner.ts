import { Scene, Mesh, Vector3, StandardMaterial, Color3, MeshBuilder, Animation, ParticleSystem, Texture, Color4 } from '@babylonjs/core';
import { ISpawner, IEnemy } from '../types';
import { AssetLoader } from '../utils/AssetLoader';
import { SwarmEnemy } from '../enemies/SwarmEnemy';
import { FlyingEnemy } from '../enemies/FlyingEnemy';
import { EliteEnemy } from '../enemies/EliteEnemy';
import { performanceConfig } from '../config/gameConfig';

/**
 * PortalSpawner - Special spawner using your nephew's portal models!
 * Creates dimensional rifts that spawn enemies from the Upside Down
 */
export type PortalType = 'blue' | 'standard' | 'large';

export class PortalSpawner implements ISpawner {
  public isActive: boolean = true;
  public isDestroyed: boolean = false;
  public mesh: Mesh;
  public health: number = 200;
  
  private portalType: PortalType;
  private spawnTimer: number = 0;
  private spawnInterval: number = 8; // Slower spawn rate than hive
  private maxEnemies: number = performanceConfig.maxEnemies;
  private spawnedEnemies: IEnemy[] = [];
  private particleSystem: ParticleSystem | null = null;
  private portalRing: Mesh | null = null;
  private innerVortex: Mesh | null = null;

  constructor(
    public position: Vector3,
    private scene: Scene,
    private assetLoader: AssetLoader,
    private onEnemySpawned: (enemy: IEnemy) => void,
    portalType: PortalType = 'standard'
  ) {
    this.portalType = portalType;
    this.mesh = this.createPortalMesh();
    this.setupParticles();
    this.setupAnimations();
  }

  private createPortalMesh(): Mesh {
    // Create the portal visual - swirling vortex effect
    const portalRoot = MeshBuilder.CreateDisc('portal_root', {
      radius: 0.1
    }, this.scene);
    portalRoot.position = this.position.clone();
    portalRoot.isVisible = false;

    // Outer ring (glowing)
    const ringSize = this.portalType === 'large' ? 4 : this.portalType === 'blue' ? 2 : 3;
    this.portalRing = MeshBuilder.CreateTorus('portal_ring', {
      diameter: ringSize,
      thickness: 0.3,
      tessellation: 32
    }, this.scene);
    this.portalRing.parent = portalRoot;
    this.portalRing.rotation.x = Math.PI / 2;

    const ringMat = new StandardMaterial('portalRingMat', this.scene);
    ringMat.diffuseColor = this.getPortalColor();
    ringMat.emissiveColor = this.getPortalColor().scale(0.8);
    ringMat.specularColor = Color3.White();
    ringMat.alpha = 0.9;
    this.portalRing.material = ringMat;

    // Inner vortex disc
    this.innerVortex = MeshBuilder.CreateDisc('portal_vortex', {
      radius: ringSize / 2 - 0.2
    }, this.scene);
    this.innerVortex.parent = portalRoot;
    this.innerVortex.rotation.x = Math.PI / 2;
    this.innerVortex.position.y = 0.1;

    const vortexMat = new StandardMaterial('vortexMat', this.scene);
    vortexMat.diffuseColor = Color3.Black();
    vortexMat.emissiveColor = this.getPortalColor().scale(0.3);
    vortexMat.alpha = 0.7;
    this.innerVortex.material = vortexMat;

    // Position the portal vertically (standing upright)
    portalRoot.rotation.x = -Math.PI / 2;
    portalRoot.position.y = this.position.y + ringSize / 2;

    return portalRoot;
  }

  private getPortalColor(): Color3 {
    switch (this.portalType) {
      case 'blue':
        return new Color3(0.2, 0.4, 1.0); // Blue dimensional portal
      case 'large':
        return new Color3(1.0, 0.2, 0.1); // Red danger portal
      case 'standard':
      default:
        return new Color3(0.5, 0.0, 0.8); // Purple Upside Down portal
    }
  }

  private setupParticles(): void {
    this.particleSystem = new ParticleSystem('portalParticles', 200, this.scene);
    
    // Create procedural particle texture
    const particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABnSURBVFhH7c5BDQAgDATBxr9oIfgPA3tI4NqZ2c9nVBeBCCIQgQhEIAIRiEAEIhCBCEQgAhGIQAQiEIEIRCACEYhABCIQgQhEIAIRiEAEIhCBCEQgAhGIQAQiEIEIRCACEYjgL5j5AC1XFWU5ZjcuAAAAAElFTkSuQmCC', this.scene);
    this.particleSystem.particleTexture = particleTexture;
    
    this.particleSystem.emitter = this.mesh;
    this.particleSystem.minEmitBox = new Vector3(-1, 0, -1);
    this.particleSystem.maxEmitBox = new Vector3(1, 0, 1);
    
    const color = this.getPortalColor();
    this.particleSystem.color1 = new Color4(color.r, color.g, color.b, 1);
    this.particleSystem.color2 = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0.8);
    this.particleSystem.colorDead = new Color4(0, 0, 0, 0);
    
    this.particleSystem.minSize = 0.1;
    this.particleSystem.maxSize = 0.3;
    this.particleSystem.minLifeTime = 0.5;
    this.particleSystem.maxLifeTime = 1.5;
    this.particleSystem.emitRate = 50;
    
    this.particleSystem.direction1 = new Vector3(-1, 1, -1);
    this.particleSystem.direction2 = new Vector3(1, 2, 1);
    this.particleSystem.minEmitPower = 0.5;
    this.particleSystem.maxEmitPower = 1.5;
    
    this.particleSystem.start();
  }

  private setupAnimations(): void {
    // Ring rotation animation
    if (this.portalRing) {
      const rotationAnim = new Animation(
        'portalRingRotation',
        'rotation.z',
        30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      rotationAnim.setKeys([
        { frame: 0, value: 0 },
        { frame: 120, value: Math.PI * 2 }
      ]);
      this.portalRing.animations.push(rotationAnim);
      this.scene.beginAnimation(this.portalRing, 0, 120, true);
    }

    // Vortex pulse animation
    if (this.innerVortex) {
      const pulseAnim = new Animation(
        'vortexPulse',
        'scaling',
        30,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      pulseAnim.setKeys([
        { frame: 0, value: new Vector3(1, 1, 1) },
        { frame: 30, value: new Vector3(1.1, 1.1, 1.1) },
        { frame: 60, value: new Vector3(1, 1, 1) }
      ]);
      this.innerVortex.animations.push(pulseAnim);
      this.scene.beginAnimation(this.innerVortex, 0, 60, true);
    }
  }

  spawn(): void {
    if (this.isDestroyed || !this.isActive) return;

    const aliveEnemies = this.spawnedEnemies.filter(e => e.isAlive);
    if (aliveEnemies.length >= this.maxEnemies) return;

    // Spawn position is slightly in front of the portal
    const spawnPos = this.position.clone();
    spawnPos.z += 2;
    spawnPos.x += (Math.random() - 0.5) * 2;
    spawnPos.y = 0.5;

    let enemy: IEnemy;

    // Different portals spawn different enemy types
    if (this.portalType === 'large') {
      // Large portals spawn elite enemies
      const mesh = this.assetLoader.createFallbackElite();
      mesh.position = spawnPos;
      enemy = new EliteEnemy(mesh, this.scene);
    } else if (this.portalType === 'blue') {
      // Blue portals spawn flying enemies
      const mesh = this.assetLoader.createFallbackFlyingEnemy();
      mesh.position = spawnPos;
      enemy = new FlyingEnemy(mesh, this.scene);
    } else {
      // Standard portals spawn swarm enemies
      const mesh = this.assetLoader.createFallbackSwarmEnemy();
      mesh.position = spawnPos;
      enemy = new SwarmEnemy(mesh, this.scene);
    }

    // Spawn effect - brief flash
    this.flashEffect();

    this.spawnedEnemies.push(enemy);
    this.onEnemySpawned(enemy);
  }

  private flashEffect(): void {
    if (this.portalRing) {
      const mat = this.portalRing.material as StandardMaterial;
      if (mat) {
        const originalEmissive = mat.emissiveColor.clone();
        mat.emissiveColor = Color3.White();
        setTimeout(() => {
          mat.emissiveColor = originalEmissive;
        }, 100);
      }
    }
  }

  update(deltaTime: number): void {
    if (this.isDestroyed) return;

    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawn();
      this.spawnTimer = 0;
    }

    // Clean up dead enemies
    this.spawnedEnemies = this.spawnedEnemies.filter(e => e.isAlive || e.isDying);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    
    // Visual damage feedback
    if (this.portalRing) {
      const mat = this.portalRing.material as StandardMaterial;
      if (mat) {
        mat.emissiveColor = Color3.White();
        setTimeout(() => {
          mat.emissiveColor = this.getPortalColor().scale(0.8);
        }, 50);
      }
    }

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.isActive = false;

    console.log(`Portal destroyed! Type: ${this.portalType}`);

    // Collapse animation
    if (this.portalRing) {
      const collapseAnim = new Animation(
        'collapse',
        'scaling',
        30,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      collapseAnim.setKeys([
        { frame: 0, value: this.portalRing.scaling.clone() },
        { frame: 30, value: Vector3.Zero() }
      ]);
      this.portalRing.animations = [collapseAnim];
      this.scene.beginAnimation(this.portalRing, 0, 30, false, 1, () => {
        this.dispose();
      });
    } else {
      this.dispose();
    }
  }

  dispose(): void {
    if (this.particleSystem) {
      this.particleSystem.stop();
      this.particleSystem.dispose();
    }
    if (this.portalRing) {
      this.portalRing.dispose();
    }
    if (this.innerVortex) {
      this.innerVortex.dispose();
    }
    if (this.mesh) {
      this.mesh.dispose();
    }
  }
}
