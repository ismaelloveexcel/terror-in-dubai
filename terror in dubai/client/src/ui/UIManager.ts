import { Scene, Engine } from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { PlayerController } from '../player/PlayerController';
import { MobileControls } from './MobileControls';
import { HUD } from './HUD';
import { Overlays } from './Overlays';
import { TutorialManager } from './TutorialManager';
import { FPSCounter } from './FPSCounter';
import { GameState } from '../types';

export class UIManager {
  public mobileControls: MobileControls;
  public hud: HUD;
  public overlays: Overlays;
  public tutorial: TutorialManager;
  public fpsCounter: FPSCounter | null = null;

  constructor(private scene: Scene, private input: InputManager) {
    this.mobileControls = new MobileControls(scene, input);
    this.hud = new HUD();
    this.overlays = new Overlays();
    this.tutorial = new TutorialManager();
    
    // FPS counter (created later when engine is available)
    const engine = scene.getEngine();
    if (engine) {
      this.fpsCounter = new FPSCounter(engine);
    }
  }

  update(player: PlayerController): void {
    this.hud.update(player);
    
    // Update FPS counter
    if (this.fpsCounter) {
      this.fpsCounter.update();
    }
  }

  setState(state: GameState): void {
    // Show/hide HUD and mobile controls based on state
    const playingStates: GameState[] = ['PLAYING'];
    const isPlaying = playingStates.includes(state);

    this.hud.setVisible(isPlaying);
    this.mobileControls.setVisible(isPlaying);
  }

  /**
   * Check if tutorial should be shown for first-time players
   */
  shouldShowTutorial(): boolean {
    return this.tutorial.shouldShowTutorial();
  }

  /**
   * Start the tutorial sequence
   */
  startTutorial(onComplete: () => void): void {
    this.tutorial.startTutorial(onComplete);
  }

  dispose(): void {
    this.mobileControls.dispose();
    this.hud.dispose();
    this.overlays.dispose();
    this.tutorial.dispose();
    if (this.fpsCounter) {
      this.fpsCounter.dispose();
    }
  }
}
