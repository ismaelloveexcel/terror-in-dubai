import { AdvancedDynamicTexture, Ellipse, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import { Scene, Vector2 } from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { isMobile } from '../config/gameConfig';

export class MobileControls {
  private ui: AdvancedDynamicTexture;
  private joystickContainer!: Ellipse;
  private joystickThumb!: Ellipse;
  private fireButton!: Ellipse;

  private joystickPressed: boolean = false;
  private joystickPointerId: number = -1;
  private joystickOrigin: Vector2 = Vector2.Zero();

  constructor(private scene: Scene, private input: InputManager) {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('MobileUI');

    if (isMobile) {
      this.createJoystick();
      this.createFireButton();
      this.createCrosshair();
    } else {
      // Desktop - just crosshair
      this.createCrosshair();
    }
  }

  private createJoystick(): void {
    // Container
    this.joystickContainer = new Ellipse('joystickContainer');
    this.joystickContainer.width = '120px';
    this.joystickContainer.height = '120px';
    this.joystickContainer.color = 'rgba(255, 255, 255, 0.3)';
    this.joystickContainer.thickness = 3;
    this.joystickContainer.background = 'rgba(0, 0, 0, 0.2)';
    this.joystickContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.joystickContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.joystickContainer.left = 80;
    this.joystickContainer.top = -80;
    this.ui.addControl(this.joystickContainer);

    // Thumb
    this.joystickThumb = new Ellipse('joystickThumb');
    this.joystickThumb.width = '60px';
    this.joystickThumb.height = '60px';
    this.joystickThumb.color = 'rgba(255, 255, 255, 0.8)';
    this.joystickThumb.thickness = 3;
    this.joystickThumb.background = 'rgba(100, 100, 100, 0.5)';
    this.joystickContainer.addControl(this.joystickThumb);

    // Touch events
    this.joystickContainer.onPointerDownObservable.add((coords) => {
      this.joystickPressed = true;
      this.joystickOrigin = new Vector2(coords.x, coords.y);
    });

    this.ui.onPointerUpObservable.add(() => {
      if (this.joystickPressed) {
        this.joystickPressed = false;
        this.joystickThumb.left = 0;
        this.joystickThumb.top = 0;
        this.input.setJoystick(0, 0);
      }
    });

    this.ui.onPointerMoveObservable.add((coords) => {
      if (this.joystickPressed) {
        const delta = new Vector2(coords.x - this.joystickOrigin.x, coords.y - this.joystickOrigin.y);
        const maxRadius = 30; // Half of container

        // Clamp to circle
        const distance = delta.length();
        if (distance > maxRadius) {
          delta.normalize().scaleInPlace(maxRadius);
        }

        this.joystickThumb.left = delta.x;
        this.joystickThumb.top = delta.y;

        // Normalize to -1 to 1
        const normalizedX = delta.x / maxRadius;
        const normalizedY = delta.y / maxRadius;

        this.input.setJoystick(normalizedX, normalizedY);
      }
    });
  }

  private createFireButton(): void {
    this.fireButton = new Ellipse('fireButton');
    this.fireButton.width = '100px';
    this.fireButton.height = '100px';
    this.fireButton.color = 'rgba(255, 50, 50, 0.6)';
    this.fireButton.thickness = 4;
    this.fireButton.background = 'rgba(200, 0, 0, 0.3)';
    this.fireButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.fireButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.fireButton.left = -80;
    this.fireButton.top = -80;
    this.ui.addControl(this.fireButton);

    const label = new TextBlock('fireLabel', 'FIRE');
    label.color = 'white';
    label.fontSize = 18;
    this.fireButton.addControl(label);

    this.fireButton.onPointerDownObservable.add(() => {
      this.input.setFiring(true);
      this.fireButton.background = 'rgba(255, 0, 0, 0.6)';
    });

    this.fireButton.onPointerUpObservable.add(() => {
      this.input.setFiring(false);
      this.fireButton.background = 'rgba(200, 0, 0, 0.3)';
    });
  }

  private createCrosshair(): void {
    const crosshair = new Rectangle('crosshair');
    crosshair.width = '3px';
    crosshair.height = '20px';
    crosshair.color = 'white';
    crosshair.thickness = 2;
    crosshair.background = 'transparent';
    this.ui.addControl(crosshair);

    const crosshairH = new Rectangle('crosshairH');
    crosshairH.width = '20px';
    crosshairH.height = '3px';
    crosshairH.color = 'white';
    crosshairH.thickness = 2;
    crosshairH.background = 'transparent';
    this.ui.addControl(crosshairH);
  }

  setVisible(visible: boolean): void {
    this.ui.rootContainer.isVisible = visible;
  }

  dispose(): void {
    this.ui.dispose();
  }
}
