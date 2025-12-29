import { Scene } from '@babylonjs/core';

export class InputManager {
  // Keyboard state
  public keys: Map<string, boolean> = new Map();

  // Mouse state
  public mouseX: number = 0;
  public mouseY: number = 0;
  public mouseDeltaX: number = 0;
  public mouseDeltaY: number = 0;
  public isMouseDown: boolean = false;

  // Mobile touch state
  public touchJoystick: { x: number; y: number } = { x: 0, y: 0 };
  public isFiring: boolean = false;

  // Pointer lock
  public isPointerLocked: boolean = false;

  constructor(private scene: Scene) {
    this.setupKeyboard();
    this.setupMouse();
    this.setupPointerLock();
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });
  }

  private setupMouse(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      }

      // Request pointer lock on first click
      if (!this.isPointerLocked && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDeltaX = e.movementX || 0;
        this.mouseDeltaY = e.movementY || 0;
      }
    });
  }

  private setupPointerLock(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (!canvas) return;

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener('pointerlockerror', () => {
      console.warn('Pointer lock error');
      this.isPointerLocked = false;
    });
  }

  public isKeyDown(code: string): boolean {
    return this.keys.get(code) === true;
  }

  public resetMouseDelta(): void {
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  // Mobile controls integration
  public setJoystick(x: number, y: number): void {
    this.touchJoystick.x = x;
    this.touchJoystick.y = y;
  }

  public setFiring(firing: boolean): void {
    this.isFiring = firing;
  }

  public dispose(): void {
    this.keys.clear();
  }
}
