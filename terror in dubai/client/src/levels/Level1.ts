import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { BaseLevel } from './BaseLevel';
import { PlayerController } from '../player/PlayerController';
import { HiveSpawner } from '../spawners/HiveSpawner';
import { EliteEnemy } from '../enemies/EliteEnemy';
import { IEnemy, ISpawner } from '../types';
import { memoryFragments } from '../config/storyConfig';

export class Level1 extends BaseLevel {
  private hives: ISpawner[] = [];
  private eliteSpawned: boolean = false;
  private hivesDestroyed: number = 0;

  constructor(scene: Scene, player: PlayerController) {
    super(scene, player);
  }

  async load(): Promise<void> {
    this.createEnvironment();
    this.createMetroEnvironment();
    this.createHives();
    this.createMemoryFragments(memoryFragments.level1);

    // Set player start position
    this.player.setPosition(new Vector3(0, 1.8, -20));
  }

  private createMetroEnvironment(): void {
    // Metro corridor walls
    this.createWalls([
      new Vector3(0, 2.5, 30), // North wall
      new Vector3(0, 2.5, -30), // South wall
      new Vector3(-15, 2.5, 0), // West wall
      new Vector3(15, 2.5, 0), // East wall
    ], [
      { width: 30, height: 5, depth: 1 },
      { width: 30, height: 5, depth: 1 },
      { width: 1, height: 5, depth: 60 },
      { width: 1, height: 5, depth: 60 }
    ]);

    // Metro pillars
    for (let i = -20; i <= 20; i += 10) {
      const pillar = MeshBuilder.CreateCylinder('pillar', {
        height: 5,
        diameter: 1.5
      }, this.scene);
      pillar.position = new Vector3(i, 2.5, 0);

      const mat = new StandardMaterial('pillarMat', this.scene);
      mat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      pillar.material = mat;
      pillar.checkCollisions = true;

      // Add vines
      this.createVineDecoration(new Vector3(i, 2, 2));
    }

    // Skyline silhouette in distance (visible through gaps)
    const skyline = MeshBuilder.CreateBox('skyline', {
      width: 50,
      height: 20,
      depth: 1
    }, this.scene);
    skyline.position = new Vector3(0, 10, 45);

    const skyMat = new StandardMaterial('skylineMat', this.scene);
    skyMat.emissiveColor = new Color3(0.1, 0.1, 0.2);
    skyline.material = skyMat;
  }

  private createHives(): void {
    const hivePositions = [
      new Vector3(-10, 0, 10),
      new Vector3(10, 0, 15),
      new Vector3(0, 0, 20),
      new Vector3(-8, 0, -10),
      new Vector3(8, 0, -5)
    ];

    hivePositions.forEach(pos => {
      const hive = new HiveSpawner(pos, this.scene, this.assetLoader, (enemy) => {
        this.enemies.push(enemy);
        this.setupEnemyCallbacks(enemy);
      });
      this.hives.push(hive);
    });
  }

  private setupEnemyCallbacks(enemy: IEnemy): void {
    if ('onAttack' in enemy) {
      (enemy as any).onAttack((damage: number) => {
        this.player.health.takeDamage(damage);
      });
    }
  }

  update(deltaTime: number): void {
    // Update hives
    this.hives.forEach(hive => {
      if (!hive.isDestroyed) {
        hive.update(deltaTime);

        // Player can shoot hives
        const distance = Vector3.Distance(hive.mesh.position, this.player.position);
        if (distance < 50) {
          // Hive visible and in range
        }
      }
    });

    // Check hive destruction
    const justDestroyed = this.hives.filter(h => h.isDestroyed).length;
    if (justDestroyed > this.hivesDestroyed) {
      this.hivesDestroyed = justDestroyed;

      // Spawn elite after 2 hives destroyed
      if (!this.eliteSpawned && this.hivesDestroyed >= 2) {
        this.spawnElite();
      }
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

  private spawnElite(): void {
    this.eliteSpawned = true;

    const mesh = this.assetLoader.createFallbackEliteEnemy();
    mesh.position = new Vector3(0, 0, 25);

    const elite = new EliteEnemy(mesh, this.scene);
    elite.onAttack((damage) => {
      this.player.health.takeDamage(damage);
    });

    this.enemies.push(elite);
  }

  checkWinCondition(): boolean {
    return this.hives.every(h => h.isDestroyed);
  }

  // Allow player to damage hives
  public damageHive(hiveIndex: number, damage: number): void {
    if (hiveIndex >= 0 && hiveIndex < this.hives.length) {
      const hive = this.hives[hiveIndex] as HiveSpawner;
      if (!hive.isDestroyed) {
        hive.takeDamage(damage);
      }
    }
  }
}
