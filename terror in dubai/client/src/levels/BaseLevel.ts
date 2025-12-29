import { Scene, MeshBuilder, StandardMaterial, Color3, HemisphericLight, Vector3 } from '@babylonjs/core';
import { ILevel, IEnemy, MemoryFragment } from '../types';
import { AssetLoader } from '../utils/AssetLoader';
import { PlayerController } from '../player/PlayerController';

export abstract class BaseLevel implements ILevel {
  public isComplete: boolean = false;
  protected assetLoader: AssetLoader;
  protected enemies: IEnemy[] = [];
  protected memoryFragments: MemoryFragment[] = [];

  constructor(public scene: Scene, protected player: PlayerController) {
    this.assetLoader = new AssetLoader(scene);
  }

  abstract load(): Promise<void>;
  abstract update(deltaTime: number): void;
  abstract checkWinCondition(): boolean;

  protected createEnvironment(): void {
    // Lighting - dim and eerie
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.3;
    light.diffuse = new Color3(0.5, 0.3, 0.3);

    // Fog
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.02;
    this.scene.fogColor = new Color3(0.1, 0.05, 0.05);

    // Ground
    this.createGround();
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
