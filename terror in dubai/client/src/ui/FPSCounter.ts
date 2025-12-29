import { AdvancedDynamicTexture, TextBlock, Control, Rectangle } from '@babylonjs/gui';
import { Engine } from '@babylonjs/core';
import { settings } from '../config/gameConfig';

/**
 * FPSCounter - Displays current frame rate
 */
export class FPSCounter {
  private ui: AdvancedDynamicTexture;
  private fpsText: TextBlock;
  private container: Rectangle;
  private engine: Engine;
  private lastUpdate: number = 0;
  private frameCount: number = 0;

  constructor(engine: Engine) {
    this.engine = engine;
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('FPSCounter');
    
    // Container
    this.container = new Rectangle('fpsContainer');
    this.container.width = '80px';
    this.container.height = '30px';
    this.container.cornerRadius = 5;
    this.container.color = '#00ff00';
    this.container.thickness = 1;
    this.container.background = 'rgba(0, 0, 0, 0.7)';
    this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.container.top = 20;
    this.container.left = -20;
    this.ui.addControl(this.container);

    // FPS text
    this.fpsText = new TextBlock('fpsText', '60 FPS');
    this.fpsText.fontSize = 14;
    this.fpsText.color = '#00ff00';
    this.container.addControl(this.fpsText);

    // Initially hidden
    this.setVisible(settings.showFPS);
  }

  update(): void {
    if (!settings.showFPS) {
      if (this.container.isVisible) {
        this.setVisible(false);
      }
      return;
    }

    if (!this.container.isVisible) {
      this.setVisible(true);
    }

    this.frameCount++;
    const now = performance.now();
    
    // Update every 500ms for smoother display
    if (now - this.lastUpdate >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastUpdate));
      this.fpsText.text = `${fps} FPS`;
      
      // Color coding
      if (fps >= 55) {
        this.fpsText.color = '#00ff00'; // Green
        this.container.color = '#00ff00';
      } else if (fps >= 30) {
        this.fpsText.color = '#ffff00'; // Yellow
        this.container.color = '#ffff00';
      } else {
        this.fpsText.color = '#ff0000'; // Red
        this.container.color = '#ff0000';
      }

      this.frameCount = 0;
      this.lastUpdate = now;
    }
  }

  setVisible(visible: boolean): void {
    this.container.isVisible = visible;
  }

  dispose(): void {
    this.ui.dispose();
  }
}
