import { Scene, Engine, Vector3 } from '@babylonjs/core';
import { ILevel } from '../types';
import { PlayerController } from '../player/PlayerController';
import { Level1 } from '../levels/Level1';
import { Level2 } from '../levels/Level2';
import { Level3 } from '../levels/Level3';

export class SceneManager {
  private scene: Scene;
  private currentLevel: ILevel | null = null;
  private currentLevelIndex: number = -1;

  constructor(engine: Engine, private player: PlayerController) {
    this.scene = new Scene(engine);
    this.scene.collisionsEnabled = true;
    this.scene.gravity = new Vector3(0, -9.81, 0);
  }

  async loadLevel(levelIndex: number): Promise<void> {
    // Dispose current level
    if (this.currentLevel) {
      this.currentLevel.dispose();
      this.currentLevel = null;
    }

    // Clear scene (except player camera/collider)
    this.scene.meshes.forEach(mesh => {
      if (mesh.name !== 'playerCollider' && mesh.name !== 'playerCamera') {
        mesh.dispose();
      }
    });

    this.scene.lights.forEach(light => light.dispose());

    // Create new level
    this.currentLevelIndex = levelIndex;

    switch (levelIndex) {
      case 0:
        this.currentLevel = new Level1(this.scene, this.player);
        break;
      case 1:
        const level2 = new Level2(this.scene, this.player);
        // Set lights wall callback
        level2.setLightsWallCallback(() => {
          // This will be called from Game.ts via callback
        });
        this.currentLevel = level2;
        break;
      case 2:
        this.currentLevel = new Level3(this.scene, this.player);
        break;
      default:
        throw new Error(`Invalid level index: ${levelIndex}`);
    }

    await this.currentLevel.load();
  }

  update(deltaTime: number): void {
    if (this.currentLevel) {
      this.currentLevel.update(deltaTime);
    }
  }

  isLevelComplete(): boolean {
    return this.currentLevel?.isComplete || false;
  }

  getCurrentLevel(): ILevel | null {
    return this.currentLevel;
  }

  getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  getScene(): Scene {
    return this.scene;
  }

  dispose(): void {
    if (this.currentLevel) {
      this.currentLevel.dispose();
    }
    this.scene.dispose();
  }
}
