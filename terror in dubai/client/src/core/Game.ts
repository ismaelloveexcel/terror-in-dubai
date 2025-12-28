import { Engine, Scene } from '@babylonjs/core';
import { GameState } from '../types';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { PostProcessing } from './PostProcessing';
import { ParticleEffects } from './ParticleEffects';
import { PlayerController } from '../player/PlayerController';
import { UIManager } from '../ui/UIManager';
import { levelConfigs } from '../config/storyConfig';
import { Level2 } from '../levels/Level2';

export class Game {
  private engine: Engine;
  private scene: Scene;
  private sceneManager: SceneManager;
  private input: InputManager;
  private audio: AudioManager;
  private postProcessing: PostProcessing | null = null;
  private particleEffects: ParticleEffects | null = null;
  private player: PlayerController;
  private ui: UIManager;

  private gameState: GameState = 'MENU';
  private currentLevelIndex: number = 0;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    // Create engine
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });

    // Create initial scene (will be replaced by SceneManager)
    this.scene = new Scene(this.engine);

    // Core systems
    this.input = new InputManager(this.scene);
    this.audio = new AudioManager(this.scene);
    this.player = new PlayerController(this.scene, this.input);

    // UI
    this.ui = new UIManager(this.scene, this.input);

    // Scene manager
    this.sceneManager = new SceneManager(this.engine, this.player, this.input);
    this.scene = this.sceneManager.getScene();

    // Setup
    this.setupPlayerCallbacks();
    this.showMainMenu();

    // Start render loop
    this.engine.runRenderLoop(() => this.render());

    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private setupPlayerCallbacks(): void {
    this.player.health.onDeath(() => {
      this.setState('GAME_OVER');
    });

    this.player.health.onDamage(() => {
      this.ui.hud.showDamageFlash();
      // Trigger post-processing damage effect
      if (this.postProcessing) {
        this.postProcessing.triggerDamageEffect();
      }
    });
  }

  private initializeEffects(): void {
    // Initialize post-processing
    if (!this.postProcessing) {
      this.postProcessing = new PostProcessing(this.scene, this.player.camera);
    }

    // Initialize particle effects
    if (!this.particleEffects) {
      this.particleEffects = new ParticleEffects(this.scene);
    }
  }

  private render(): void {
    const now = performance.now() / 1000;
    const deltaTime = this.lastTime === 0 ? 0 : now - this.lastTime;
    this.lastTime = now;

    if (this.gameState === 'PLAYING') {
      this.update(deltaTime);
    }

    this.scene.render();
  }

  private update(deltaTime: number): void {
    // Update player
    this.player.update(deltaTime, this.getAllEnemies());

    // Update scene/level
    this.sceneManager.update(deltaTime);

    // Update UI
    this.ui.update(this.player);

    // Update particle effects (follow player)
    if (this.particleEffects) {
      this.particleEffects.updateSporesPosition(this.player.position);
    }

    // Check level complete
    if (this.sceneManager.isLevelComplete()) {
      this.onLevelComplete();
    }
  }

  private getAllEnemies(): any[] {
    const level = this.sceneManager.getCurrentLevel();
    if (level && 'enemies' in level) {
      return (level as any).enemies || [];
    }
    return [];
  }

  private async setState(state: GameState): Promise<void> {
    this.gameState = state;
    this.ui.setState(state);

    switch (state) {
      case 'MENU':
        this.showMainMenu();
        break;
      case 'PROLOGUE':
        this.showPrologue();
        break;
      case 'LEVEL_INTRO':
        this.showLevelIntro();
        break;
      case 'PLAYING':
        await this.startLevel();
        break;
      case 'LEVEL_COMPLETE':
        this.showLevelComplete();
        break;
      case 'GAME_OVER':
        this.showGameOver();
        break;
      case 'FINALE':
        this.showFinale();
        break;
      case 'CREDITS':
        this.showCredits();
        break;
    }
  }

  private showMainMenu(): void {
    this.ui.overlays.showMenu(
      async () => {
        await this.audio.unlock();
        this.setState('PROLOGUE');
      },
      () => {
        this.ui.overlays.showSettings(() => {
          this.setState('MENU');
        });
      }
    );
  }

  private showPrologue(): void {
    this.ui.overlays.showPrologue(() => {
      this.currentLevelIndex = 0;
      
      // Check if this is first time - show tutorial
      if (this.ui.shouldShowTutorial()) {
        this.ui.startTutorial(() => {
          this.setState('LEVEL_INTRO');
        });
      } else {
        this.setState('LEVEL_INTRO');
      }
    });
  }

  private showLevelIntro(): void {
    const config = levelConfigs[this.currentLevelIndex];
    this.ui.overlays.showLevelIntro(config.title, config.storyCard, () => {
      this.setState('PLAYING');
    });
  }

  private async startLevel(): Promise<void> {
    this.ui.overlays.clear();

    // Reset player
    this.player.health.reset();

    // Load level
    await this.sceneManager.loadLevel(this.currentLevelIndex);

    // Initialize visual effects (after scene is ready)
    this.initializeEffects();

    // Set up level-specific callbacks
    const level = this.sceneManager.getCurrentLevel();
    if (level instanceof Level2) {
      level.setLightsWallCallback((text) => {
        this.ui.overlays.showLightsWall(text, 2000);
      });
    }

    // Show Ismael's message for this level
    const config = levelConfigs[this.currentLevelIndex];
    if (config.ismaelMessages && config.ismaelMessages.length > 0) {
      setTimeout(() => {
        this.ui.overlays.showIsmaelMessage(config.ismaelMessages![0], 4000);
      }, 2000);
    }
  }

  private onLevelComplete(): void {
    this.setState('LEVEL_COMPLETE');
  }

  private showLevelComplete(): void {
    this.ui.overlays.showLevelComplete(() => {
      this.currentLevelIndex++;

      if (this.currentLevelIndex >= levelConfigs.length) {
        // Game complete
        this.setState('FINALE');
      } else {
        // Next level
        this.setState('LEVEL_INTRO');
      }
    });
  }

  private showGameOver(): void {
    this.ui.overlays.showGameOver(() => {
      this.setState('PLAYING'); // Restart current level
    });
  }

  private showFinale(): void {
    this.ui.overlays.showFinale(() => {
      this.setState('CREDITS');
    });
  }

  private showCredits(): void {
    this.ui.overlays.showCredits(() => {
      this.setState('MENU');
    });
  }
}
