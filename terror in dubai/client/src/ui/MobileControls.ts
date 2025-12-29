import { AdvancedDynamicTexture, Ellipse, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import { Vector2 } from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { isMobile } from '../config/gameConfig';

export class MobileControls {
  private ui: AdvancedDynamicTexture;
  private joystickContainer!: Ellipse;
  private joystickThumb!: Ellipse;
  private fireButton!: Ellipse;

  private joystickPressed: boolean = false;
  private joystickOrigin: Vector2 = Vector2.Zero();
  private controlScale: number = 1;

  constructor(private input: InputManager) {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('MobileUI');
    this.updateControlScale();
    window.addEventListener('resize', () => this.updateControlScale());

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
    const pointerTarget = this.ui.rootContainer;

    // Container
    this.joystickContainer = new Ellipse('joystickContainer');
    this.joystickContainer.color = 'rgba(255, 255, 255, 0.3)';
    this.joystickContainer.thickness = 3;
    this.joystickContainer.background = 'rgba(0, 0, 0, 0.2)';
    this.joystickContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.joystickContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.ui.addControl(this.joystickContainer);

    // Thumb
    this.joystickThumb = new Ellipse('joystickThumb');
    this.joystickThumb.color = 'rgba(255, 255, 255, 0.8)';
    this.joystickThumb.thickness = 3;
    this.joystickThumb.background = 'rgba(100, 100, 100, 0.5)';
    this.joystickContainer.addControl(this.joystickThumb);

    // Touch events
    this.joystickContainer.onPointerDownObservable.add((coords) => {
      this.joystickPressed = true;
      this.joystickOrigin = new Vector2(coords.x, coords.y);
    });

    pointerTarget.onPointerUpObservable.add(() => {
      if (this.joystickPressed) {
        this.joystickPressed = false;
        this.joystickThumb.left = 0;
        this.joystickThumb.top = 0;
        this.input.setJoystick(0, 0);
      }
    });

    pointerTarget.onPointerMoveObservable.add((coords: { x: number; y: number }) => {
      if (this.joystickPressed) {
        const delta = new Vector2(coords.x - this.joystickOrigin.x, coords.y - this.joystickOrigin.y);
        const maxRadius = this.getScaledSize(30); // Half of container

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

    this.applyJoystickScale();
  }

  private createFireButton(): void {
    this.fireButton = new Ellipse('fireButton');
    this.fireButton.color = 'rgba(255, 50, 50, 0.6)';
    this.fireButton.thickness = 4;
    this.fireButton.background = 'rgba(200, 0, 0, 0.3)';
    this.fireButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.fireButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.ui.addControl(this.fireButton);

    const label = new TextBlock('fireLabel', 'FIRE');
    label.color = 'white';
    this.fireButton.addControl(label);

    this.fireButton.onPointerDownObservable.add(() => {
      this.input.setFiring(true);
      this.fireButton.background = 'rgba(255, 0, 0, 0.6)';
    });

    this.fireButton.onPointerUpObservable.add(() => {
      this.input.setFiring(false);
      this.fireButton.background = 'rgba(200, 0, 0, 0.3)';
    });

    this.applyFireButtonScale();
  }

  private createCrosshair(): void {
    const crosshair = new Rectangle('crosshair');
    crosshair.width = `${this.getScaledSize(3)}px`;
    crosshair.height = `${this.getScaledSize(20)}px`;
    crosshair.color = 'white';
    crosshair.thickness = 2;
    crosshair.background = 'transparent';
    this.ui.addControl(crosshair);

    const crosshairH = new Rectangle('crosshairH');
    crosshairH.width = `${this.getScaledSize(20)}px`;
    crosshairH.height = `${this.getScaledSize(3)}px`;
    crosshairH.color = 'white';
    crosshairH.thickness = 2;
    crosshairH.background = 'transparent';
    this.ui.addControl(crosshairH);
  }

  private updateControlScale(): void {
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    this.controlScale = Math.min(1.25, Math.max(0.8, minDimension / 720));
    this.applyJoystickScale();
    this.applyFireButtonScale();
  }

  private applyJoystickScale(): void {
    if (!this.joystickContainer || !this.joystickThumb) return;

    const containerSize = this.getScaledSize(120);
    const thumbSize = this.getScaledSize(60);

    this.joystickContainer.width = `${containerSize}px`;
    this.joystickContainer.height = `${containerSize}px`;
    this.joystickContainer.thickness = 3 * this.controlScale;
    this.joystickContainer.left = this.getScaledSize(64);
    this.joystickContainer.top = -this.getScaledSize(64);

    this.joystickThumb.width = `${thumbSize}px`;
    this.joystickThumb.height = `${thumbSize}px`;
    this.joystickThumb.thickness = 3 * this.controlScale;
  }

  private applyFireButtonScale(): void {
    if (!this.fireButton) return;

    const size = this.getScaledSize(100);
    this.fireButton.width = `${size}px`;
    this.fireButton.height = `${size}px`;
    this.fireButton.thickness = 4 * this.controlScale;
    this.fireButton.left = -this.getScaledSize(64);
    this.fireButton.top = -this.getScaledSize(64);

    const label = this.fireButton.children?.[0] as TextBlock | undefined;
    if (label) {
      label.fontSize = Math.round(18 * this.controlScale);
    }
  }

  private getScaledSize(base: number): number {
    return Math.round(base * this.controlScale);
  }

  setVisible(visible: boolean): void {
    this.ui.rootContainer.isVisible = visible;
  }

  dispose(): void {
    this.ui.dispose();
  }
}
