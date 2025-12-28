import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh } from '@babylonjs/core';
import { BaseLevel } from './BaseLevel';
import { PlayerController } from '../player/PlayerController';
import { AnchorSpawner } from '../spawners/AnchorSpawner';
import { SwarmEnemy } from '../enemies/SwarmEnemy';
import { IEnemy, ISpawner } from '../types';
import { memoryFragments, lightsWallMessages } from '../config/storyConfig';

export class Level2 extends BaseLevel {
  private anchors: ISpawner[] = [];
  private interferenceTimer: number = 0;
  private interferenceActive: boolean = false;
  private lightsWallIndex: number = 0;
  private lightsWallCallback: ((text: string) => void) | null = null;

  private shadowEnemies: Mesh[] = [];
  private audioTimer: number = 0;
  private moveDragTimer: number = 0;

  constructor(scene: Scene, player: PlayerController) {
    super(scene, player);
  }

  async load(): Promise<void> {
    this.createEnvironment();
    this.createDowntownEnvironment();
    this.createAnchors();
    this.createMemoryFragments(memoryFragments.level2);

    this.player.setPosition(new Vector3(0, 1.8, -25));
  }

  private createDowntownEnvironment(): void {
    // Boulevard/plaza layout
    this.createWalls([
      new Vector3(0, 2.5, 35), // North
      new Vector3(0, 2.5, -35), // South
      new Vector3(-25, 2.5, 0), // West
      new Vector3(25, 2.5, 0), // East
    ], [
      { width: 50, height: 5, depth: 1 },
      { width: 50, height: 5, depth: 1 },
      { width: 1, height: 5, depth: 70 },
      { width: 1, height: 5, depth: 70 }
    ]);

    // Tower silhouette in distance
    const tower = MeshBuilder.CreateBox('tower', {
      width: 8,
      height: 40,
      depth: 8
    }, this.scene);
    tower.position = new Vector3(0, 20, 50);

    const towerMat = new StandardMaterial('towerMat', this.scene);
    towerMat.emissiveColor = new Color3(0.2, 0.1, 0.1);
    tower.material = towerMat;

    // Buildings along boulevard
    for (let i = -20; i <= 20; i += 15) {
      const building = MeshBuilder.CreateBox('building', {
        width: 5,
        height: 10,
        depth: 5
      }, this.scene);
      building.position = new Vector3(i, 5, 20);

      const mat = new StandardMaterial('buildingMat', this.scene);
      mat.diffuseColor = new Color3(0.2, 0.15, 0.2);
      building.material = mat;
      building.checkCollisions = true;

      // Vines
      this.createVineDecoration(new Vector3(i, 3, 18));
    }
  }

  private createAnchors(): void {
    const anchorPositions = [
      new Vector3(-15, 0, 10),
      new Vector3(15, 0, 5),
      new Vector3(0, 0, 20)
    ];

    anchorPositions.forEach(pos => {
      const anchor = new AnchorSpawner(pos, this.scene, this.assetLoader);
      this.anchors.push(anchor);
    });
  }

  public setLightsWallCallback(callback: (text: string) => void): void {
    this.lightsWallCallback = callback;
  }

  update(deltaTime: number): void {
    // Update anchors
    this.anchors.forEach(anchor => {
      if (!anchor.isDestroyed) {
        anchor.update(deltaTime);
      }
    });

    // Interference mechanics
    const activeAnchors = this.anchors.filter(a => !a.isDestroyed).length;
    if (activeAnchors > 0) {
      this.updateInterference(deltaTime, activeAnchors);
    }

    // Update enemies
    this.updateEnemies(deltaTime);

    // Check memory collection
    this.checkMemoryCollection();

    // Check win condition
    if (this.checkWinCondition()) {
      this.isComplete = true;
    }
  }

  private updateInterference(deltaTime: number, anchorCount: number): void {
    this.interferenceTimer += deltaTime;

    // Interference pulse every 15 seconds
    if (this.interferenceTimer > 15) {
      this.triggerInterferencePulse();
      this.interferenceTimer = 0;
    }

    // Shadow enemies (visual deception)
    if (Math.random() < 0.01 && this.shadowEnemies.length < 3) {
      this.spawnShadowEnemy();
    }

    // Audio bait (phantom sounds)
    this.audioTimer += deltaTime;
    if (this.audioTimer > 10) {
      this.playPhantomAudio();
      this.audioTimer = 0;
    }

    // Movement drag pulse
    this.moveDragTimer += deltaTime;
    if (this.moveDragTimer > 20) {
      this.applyMoveDrag();
      this.moveDragTimer = 0;
    }
  }

  private triggerInterferencePulse(): void {
    // HUD flicker (handled in UI layer)
    console.log('Interference pulse!');

    // Show lights wall message
    if (this.lightsWallCallback && this.lightsWallIndex < lightsWallMessages.length) {
      this.lightsWallCallback(lightsWallMessages[this.lightsWallIndex]);
      this.lightsWallIndex++;
    }
  }

  private spawnShadowEnemy(): void {
    const shadowMesh = this.assetLoader.createFallbackSwarmEnemy();
    shadowMesh.position = new Vector3(
      (Math.random() - 0.5) * 30,
      0.5,
      (Math.random() - 0.5) * 30
    );

    const mat = new StandardMaterial('shadowMat', this.scene);
    mat.alpha = 0.5;
    mat.emissiveColor = new Color3(0.1, 0, 0.1);
    shadowMesh.material = mat;

    this.shadowEnemies.push(shadowMesh);

    // Dissolve after 3 seconds
    setTimeout(() => {
      const index = this.shadowEnemies.indexOf(shadowMesh);
      if (index > -1) {
        this.shadowEnemies.splice(index, 1);
      }
      shadowMesh.dispose();
    }, 3000);
  }

  private playPhantomAudio(): void {
    // Phantom footsteps/whispers (visual log for now)
    console.log('Phantom audio from random direction');
    // Could add positional audio here
  }

  private applyMoveDrag(): void {
    console.log('Movement drag applied');
    this.player.health.setMoveSpeedMultiplier(0.5, 2000); // 50% speed for 2 seconds
  }

  checkWinCondition(): boolean {
    return this.anchors.every(a => a.isDestroyed);
  }

  public damageAnchor(anchorIndex: number, damage: number): void {
    if (anchorIndex >= 0 && anchorIndex < this.anchors.length) {
      const anchor = this.anchors[anchorIndex] as AnchorSpawner;
      if (!anchor.isDestroyed) {
        anchor.takeDamage(damage);
      }
    }
  }
}
