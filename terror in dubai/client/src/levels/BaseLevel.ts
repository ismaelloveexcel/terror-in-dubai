import { Scene, MeshBuilder, StandardMaterial, Color3, HemisphericLight, Vector3, PointLight, DirectionalLight, ShadowGenerator } from '@babylonjs/core';
import { ILevel, IEnemy, MemoryFragment } from '../types';
import { AssetLoader } from '../utils/AssetLoader';
import { PlayerController } from '../player/PlayerController';
import { isMobile, performanceConfig } from '../config/gameConfig';

export abstract class BaseLevel implements ILevel {
  public isComplete: boolean = false;
  protected assetLoader: AssetLoader;
  protected enemies: IEnemy[] = [];
  protected memoryFragments: MemoryFragment[] = [];
  protected shadowGenerator: ShadowGenerator | null = null;

  constructor(public scene: Scene, protected player: PlayerController) {
    this.assetLoader = new AssetLoader(scene);
  }

  abstract load(): Promise<void>;
  abstract update(deltaTime: number): void;
  abstract checkWinCondition(): boolean;

  protected createEnvironment(): void {
    // Enhanced lighting system
    this.createLighting();

    // Fog - exponential fog mode (1 = FOGMODE_EXP for eerie atmosphere)
    this.scene.fogMode = 1;
    this.scene.fogDensity = 0.02;
    this.scene.fogColor = new Color3(0.1, 0.05, 0.05);

    // Ambient color for the scene
    this.scene.ambientColor = new Color3(0.15, 0.08, 0.08);

    // Clear color (background)
    this.scene.clearColor.set(0.05, 0.02, 0.02, 1);

    // Ground
    this.createGround();
  }

  protected createLighting(): void {
    // Main hemispheric light - dim and eerie
    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.25;
    hemiLight.diffuse = new Color3(0.6, 0.3, 0.3);
    hemiLight.groundColor = new Color3(0.1, 0.05, 0.1);
    hemiLight.specular = new Color3(0.1, 0.1, 0.1);

    // Directional light for shadows (desktop only)
    if (performanceConfig.shadowsEnabled && !isMobile) {
      const dirLight = new DirectionalLight('dirLight', new Vector3(-0.5, -1, -0.3), this.scene);
      dirLight.position = new Vector3(20, 40, 20);
      dirLight.intensity = 0.3;
      dirLight.diffuse = new Color3(0.8, 0.4, 0.4);

      // Shadow generator
      this.shadowGenerator = new ShadowGenerator(1024, dirLight);
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurKernel = 32;
      this.shadowGenerator.darkness = 0.6;
    }

    // Accent point lights for atmosphere
    this.createAccentLight(new Vector3(-20, 8, -20), new Color3(0.8, 0.2, 0.2), 0.5, 25);
    this.createAccentLight(new Vector3(20, 8, -20), new Color3(0.6, 0.1, 0.3), 0.4, 25);
    this.createAccentLight(new Vector3(0, 10, 20), new Color3(0.5, 0.1, 0.1), 0.6, 30);
  }

  protected createAccentLight(position: Vector3, color: Color3, intensity: number, range: number): PointLight {
    const light = new PointLight(`accentLight_${position.toString()}`, position, this.scene);
    light.diffuse = color;
    light.specular = color.scale(0.3);
    light.intensity = intensity;
    light.range = range;
    return light;
  }

  protected createGround(): void {
    const ground = MeshBuilder.CreateGround('ground', {
      width: 100,
      height: 100
    }, this.scene);

    const mat = new StandardMaterial('groundMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.1, 0.1);
    mat.specularColor = new Color3(0, 0, 0);
    ground.material = mat;
    ground.checkCollisions = true;
  }

  protected createWalls(positions: Vector3[], size: { width: number; height: number; depth: number }[]): void {
    positions.forEach((pos, i) => {
      const wall = MeshBuilder.CreateBox('wall', size[i] || { width: 10, height: 5, depth: 1 }, this.scene);
      wall.position = pos;

      const mat = new StandardMaterial('wallMat', this.scene);
      mat.diffuseColor = new Color3(0.15, 0.1, 0.15);
      wall.material = mat;
      wall.checkCollisions = true;
    });
  }

  protected createVineDecoration(position: Vector3): void {
    const vine = MeshBuilder.CreateCylinder('vine', {
      height: 3,
      diameter: 0.2
    }, this.scene);
    vine.position = position;

    const mat = new StandardMaterial('vineMat', this.scene);
    mat.diffuseColor = new Color3(0.1, 0.3, 0.1);
    mat.emissiveColor = new Color3(0.05, 0.15, 0.05);
    vine.material = mat;
  }

  protected updateEnemies(deltaTime: number): void {
    this.enemies.forEach(enemy => {
      if (enemy.isAlive) {
        enemy.update(deltaTime, this.player.position);

        // Check if enemy should attack player
        const distance = Vector3.Distance(enemy.mesh.position, this.player.position);
        if (distance < enemy.attackRange) {
          // Enemy attacks handled in enemy classes via callbacks
        }
      }
    });

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.isAlive || e.isDying);
  }

  protected checkMemoryCollection(): void {
    this.memoryFragments.forEach(fragment => {
      if (!fragment.collected && fragment.mesh) {
        const distance = Vector3.Distance(fragment.mesh.position, this.player.position);
        if (distance < 2) {
          this.collectMemory(fragment);
        }
      }
    });
  }

  protected collectMemory(fragment: MemoryFragment): void {
    fragment.collected = true;
    if (fragment.mesh) {
      fragment.mesh.dispose();
    }
    console.log(`Memory collected: ${fragment.text}`);
    // Could show UI message here
  }

  protected createMemoryFragments(fragments: MemoryFragment[]): void {
    this.memoryFragments = fragments;

    fragments.forEach(fragment => {
      const mesh = this.assetLoader.createFallbackMemoryFragment();
      mesh.position = fragment.position;

      const mat = new StandardMaterial('memoryMat', this.scene);
      mat.emissiveColor = new Color3(1, 0.8, 0);
      mesh.material = mat;

      fragment.mesh = mesh;

      // Floating animation
      const startY = mesh.position.y;
      this.scene.onBeforeRenderObservable.add(() => {
        if (mesh && !fragment.collected) {
          const time = performance.now() / 1000;
          mesh.position.y = startY + Math.sin(time * 2) * 0.3;
          mesh.rotation.y += 0.02;
        }
      });
    });
  }

  dispose(): void {
    this.enemies.forEach(e => e.dispose());
    this.enemies = [];

    this.memoryFragments.forEach(f => f.mesh?.dispose());
    this.memoryFragments = [];

    // Dispose all meshes in scene
    this.scene.meshes.forEach(m => {
      if (m.name !== 'playerCollider' && m.name !== 'playerCamera') {
        m.dispose();
      }
    });
  }
}
