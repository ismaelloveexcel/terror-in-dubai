import { Scene } from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { PlayerController } from '../player/PlayerController';
import { MobileControls } from './MobileControls';
import { HUD } from './HUD';
import { Overlays } from './Overlays';
import { GameState } from '../types';

export class UIManager {
  public mobileControls: MobileControls;
  public hud: HUD;
  public overlays: Overlays;

  constructor(private scene: Scene, private input: InputManager) {
    this.mobileControls = new MobileControls(scene, input);
    this.hud = new HUD();
    this.overlays = new Overlays();
  }

  update(player: PlayerController): void {
    this.hud.update(player);
  }

  setState(state: GameState): void {
    // Show/hide HUD and mobile controls based on state
    const playingStates: GameState[] = ['PLAYING'];
    const isPlaying = playingStates.includes(state);

    this.hud.setVisible(isPlaying);
    this.mobileControls.setVisible(isPlaying);
  }

  dispose(): void {
    this.mobileControls.dispose();
    this.hud.dispose();
    this.overlays.dispose();
  }
}
