import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh } from '@babylonjs/core';
import { BaseLevel } from './BaseLevel';
import { PlayerController } from '../player/PlayerController';
import { BossSpawner } from '../spawners/BossSpawner';
import { Boss } from '../enemies/Boss';
import { SwarmEnemy } from '../enemies/SwarmEnemy';
import { memoryFragments } from '../config/storyConfig';

export class Level3 extends BaseLevel {
  private bossSpawner: BossSpawner | null = null;
  private boss: Boss | null = null;
  private runesPillars: Mesh[] = [];
  private activeRune: Mesh | null = null;
  private psychicStunTimer: number = 0;
  private isPlayerStunned: boolean = false;
  private stunWindowActive: boolean = false;

  private arenaCenter: Vector3 = new Vector3(0, 0, 0);
  private arenaRadius: number = 30;

  constructor(scene: Scene, player: PlayerController) {
    super(scene, player);
  }

  async load(): Promise<void> {
    this.createEnvironment();
    this.createDesertArena();
    this.createBoss();
    this.createRunePillars();
    this.createMemoryFragments(memoryFragments.level3);

    this.player.setPosition(new Vector3(0, 1.8, -25));
  }

  private createDesertArena(): void {
    // Desert ground (override base)
    const ground = this.scene.getMeshByName('ground');
    if (ground) {
      const mat = ground.material as StandardMaterial;
      if (mat) {
        mat.diffuseColor = new Color3(0.4, 0.3, 0.2);
      }
    }

    // Arena boundary walls
    const wallHeight = 8;
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * this.arenaRadius;
      const z = Math.sin(angle) * this.arenaRadius;

      const wall = MeshBuilder.CreateBox('arenaWall', {
        width: this.arenaRadius * 0.8,
        height: wallHeight,
        depth: 2
      }, this.scene);

      wall.position = new Vector3(x, wallHeight / 2, z);
      wall.rotation.y = angle;

      const mat = new StandardMaterial('arenaWallMat', this.scene);
      mat.diffuseColor = new Color3(0.25, 0.2, 0.2);
      wall.material = mat;
      wall.checkCollisions = true;
    }

    // Skyline silhouette in distance
    const skyline = MeshBuilder.CreateBox('skyline', {
      width: 80,
      height: 25,
      depth: 1
    }, this.scene);
    skyline.position = new Vector3(0, 12, 50);

    const skyMat = new StandardMaterial('skylineMat', this.scene);
    skyMat.emissiveColor = new Color3(0.15, 0.1, 0.15);
    skyline.material = skyMat;

    // Corrupted ground cracks
    for (let i = 0; i < 10; i++) {
      const crack = MeshBuilder.CreateBox('crack', {
        width: Math.random() * 5 + 2,
        height: 0.1,
        depth: 0.5
      }, this.scene);

      crack.position = new Vector3(
        (Math.random() - 0.5) * this.arenaRadius * 1.5,
        0.05,
        (Math.random() - 0.5) * this.arenaRadius * 1.5
      );

      const mat = new StandardMaterial('crackMat', this.scene);
      mat.emissiveColor = new Color3(0.5, 0, 0);
      crack.material = mat;
    }

    // Vines
    for (let i = 0; i < 15; i++) {
      this.createVineDecoration(new Vector3(
        (Math.random() - 0.5) * this.arenaRadius,
        0,
        (Math.random() - 0.5) * this.arenaRadius
      ));
    }
  }

  private createBoss(): void {
    this.bossSpawner = new BossSpawner(
      new Vector3(0, 0, 15),
      this.scene,
      this.assetLoader,
      this.arenaCenter,
      this.arenaRadius
    );

    this.bossSpawner.spawn();
    this.boss = this.bossSpawner.boss;

    if (this.boss) {
      this.boss.onAttack((damage) => {
        this.player.health.takeDamage(damage);
      });

      this.boss.onStun((duration) => {
        console.log(`Boss stunned for ${duration}s`);
      });
    }
  }

  private createRunePillars(): void {
    const positions = [
      new Vector3(-15, 0, 0),
      new Vector3(15, 0, 0),
      new Vector3(0, 0, 15),
      new Vector3(0, 0, -15)
    ];

    positions.forEach(pos => {
      const pillar = MeshBuilder.CreateCylinder('rune', {
        height: 4,
        diameter: 1
      }, this.scene);

      pillar.position = pos;
      pillar.position.y = 2;

      const mat = new StandardMaterial('runeMat', this.scene);
      mat.emissiveColor = new Color3(0.5, 0.5, 1);
      pillar.material = mat;

      this.runesPillars.push(pillar);
    });
  }

  update(deltaTime: number): void {
    if (!this.boss || !this.boss.isAlive) {
      if (this.boss && !this.boss.isAlive) {
        this.isComplete = true;
      }
      return;
    }

    // Update boss
    this.boss.update(deltaTime, this.player.position);

    // Phase 1: Psychic stun mechanic
    if (this.boss.currentPhase === 1) {
      this.updatePsychicStun(deltaTime);
    }

    // Phase 2: Minion spawning
    if (this.boss.currentPhase === 2) {
      this.updatePhase2(deltaTime);
    }

    // Phase 3: Hazard zones
    if (this.boss.currentPhase === 3) {
      this.updatePhase3(deltaTime);
    }

    // Update enemies (minions)
    this.updateEnemies(deltaTime);

    // Check memory collection
    this.checkMemoryCollection();
  }

  private updatePsychicStun(deltaTime: number): void {
    this.psychicStunTimer += deltaTime;

    if (this.psychicStunTimer > 12 && !this.stunWindowActive) {
      this.triggerPsychicStun();
      this.psychicStunTimer = 0;
    }

    if (this.stunWindowActive) {
      // Player has limited time to shoot a rune
      this.updateRunePillars();
    }
  }

  private triggerPsychicStun(): void {
    console.log('Boss is channeling psychic stun! Shoot a rune pillar!');
    this.stunWindowActive = true;
    this.isPlayerStunned = false;

    // Activate random rune
    const randomRune = this.runesPillars[Math.floor(Math.random() * this.runesPillars.length)];
    this.activeRune = randomRune;

    const mat = randomRune.material as StandardMaterial;
    if (mat) {
      mat.emissiveColor = new Color3(1, 1, 0); // Highlight
    }

    // If player doesn't shoot rune in 3 seconds, stun them
    setTimeout(() => {
      if (this.stunWindowActive && this.activeRune) {
        this.playerStunned();
      }
    }, 3000);
  }

  private updateRunePillars(): void {
    // Check if player shot the active rune
    // This would be handled by raycast in weapon system
    // For now, placeholder
  }

  public shootRune(runeIndex: number): void {
    if (this.activeRune && this.runesPillars[runeIndex] === this.activeRune) {
      console.log('Rune destroyed! Boss stun prevented!');
      this.stunWindowActive = false;

      // Reset rune color
      const mat = this.activeRune.material as StandardMaterial;
      if (mat) {
        mat.emissiveColor = new Color3(0.5, 0.5, 1);
      }

      this.activeRune = null;

      // Bonus: stun the boss briefly
      if (this.boss) {
        this.boss.stun(2);
      }
    }
  }

  private playerStunned(): void {
    console.log('Player stunned!');
    this.isPlayerStunned = true;
    this.stunWindowActive = false;
    this.activeRune = null;

    this.player.health.setMoveSpeedMultiplier(0, 2000); // Freeze for 2 seconds
  }

  private updatePhase2(deltaTime: number): void {
    // Spawn minions periodically
    if (Math.random() < 0.005 && this.enemies.length < 5) {
      this.spawnMinion();
    }
  }

  private spawnMinion(): void {
    const mesh = this.assetLoader.createFallbackSwarmEnemy();
    mesh.position = new Vector3(
      (Math.random() - 0.5) * this.arenaRadius * 0.8,
      0.5,
      (Math.random() - 0.5) * this.arenaRadius * 0.8
    );

    const minion = new SwarmEnemy(mesh, this.scene);
    minion.onAttack((damage) => {
      this.player.health.takeDamage(damage);
    });

    this.enemies.push(minion);
  }

  private updatePhase3(deltaTime: number): void {
    // Check if player is in hazard zone
    if (this.boss && this.boss.isInHazardZone(this.player.position)) {
      this.player.health.takeDamage(5 * deltaTime); // Damage over time
    }
  }

  checkWinCondition(): boolean {
    return this.boss !== null && !this.boss.isAlive;
  }

  dispose(): void {
    this.runesPillars.forEach(r => r.dispose());
    this.runesPillars = [];

    if (this.bossSpawner) {
      this.bossSpawner.dispose();
    }

    super.dispose();
  }
}
