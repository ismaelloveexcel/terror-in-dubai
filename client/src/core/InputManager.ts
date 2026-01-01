// InputManager.ts - Input Handling (Desktop + Mobile)
// Save Ismael - Premium Controls

import { Scene, Vector2 } from '@babylonjs/core';
import { IInputState } from '../types';
import { performanceConfig } from '../config/gameConfig';

export class InputManager {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  
  // Input state
  private inputState: IInputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    crouch: false,
    shoot: false,
    reload: false,
    interact: false,
    pause: false,
    lookX: 0,
    lookY: 0,
    joystickX: 0,
    joystickY: 0,
    isMobileFirePressed: false,
  };
  
  // Mouse state
  private mouseDeltaX: number = 0;
  private mouseDeltaY: number = 0;
  private sensitivity: number = 0.002;
  private invertY: boolean = false;
  
  // Pointer lock
  private isPointerLocked: boolean = false;
  
  // Key bindings
  private keyBindings: Map<string, keyof IInputState> = new Map([
    ['KeyW', 'forward'],
    ['KeyS', 'backward'],
    ['KeyA', 'left'],
    ['KeyD', 'right'],
    ['ArrowUp', 'forward'],
    ['ArrowDown', 'backward'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['Space', 'jump'],
    ['ShiftLeft', 'sprint'],
    ['ShiftRight', 'sprint'],
    ['ControlLeft', 'crouch'],
    ['KeyC', 'crouch'],
    ['KeyR', 'reload'],
    ['KeyE', 'interact'],
    ['KeyF', 'interact'],
    ['Escape', 'pause'],
    ['KeyP', 'pause'],
  ]);
  
  // Mobile touch state
  private touchJoystickId: number | null = null;
  private touchJoystickOrigin: Vector2 = Vector2.Zero();
  private touchFireId: number | null = null;
  private touchLookId: number | null = null;
  private lastTouchLookPos: Vector2 = Vector2.Zero();
  
  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.canvas = canvas;
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  public initialize(): void {
    this.setupKeyboardEvents();
    this.setupMouseEvents();
    this.setupPointerLock();
    
    if (performanceConfig.isMobile) {
      this.setupTouchEvents();
    }
  }
  
  // ===========================================================================
  // KEYBOARD EVENTS
  // ===========================================================================
  
  private setupKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default for game keys
    if (this.keyBindings.has(event.code)) {
      event.preventDefault();
    }
    
    const action = this.keyBindings.get(event.code);
    if (action && typeof this.inputState[action] === 'boolean') {
      (this.inputState as any)[action] = true;
    }
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    const action = this.keyBindings.get(event.code);
    if (action && typeof this.inputState[action] === 'boolean') {
      (this.inputState as any)[action] = false;
    }
  }
  
  // ===========================================================================
  // MOUSE EVENTS
  // ===========================================================================
  
  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked) return;
    
    this.mouseDeltaX += event.movementX;
    this.mouseDeltaY += event.movementY;
  }
  
  private handleMouseDown(event: MouseEvent): void {
    // Request pointer lock on click if not locked
    if (!this.isPointerLocked) {
      this.requestPointer();
      return;
    }
    
    switch (event.button) {
      case 0: // Left click - shoot
        this.inputState.shoot = true;
        break;
      case 2: // Right click - aim (optional)
        break;
    }
  }
  
  private handleMouseUp(event: MouseEvent): void {
    switch (event.button) {
      case 0:
        this.inputState.shoot = false;
        break;
    }
  }
  
  // ===========================================================================
  // POINTER LOCK
  // ===========================================================================
  
  private setupPointerLock(): void {
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === (this.canvas as unknown as Element);
    });
    
    document.addEventListener('pointerlockerror', () => {
      console.warn('Pointer lock error');
      this.isPointerLocked = false;
    });
  }
  
  public requestPointer(): void {
    if (!performanceConfig.isMobile) {
      this.canvas.requestPointerLock();
    }
  }
  
  public releasePointer(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
  
  public isLocked(): boolean {
    return this.isPointerLocked;
  }
  
  // ===========================================================================
  // TOUCH EVENTS (Mobile)
  // ===========================================================================
  
  private setupTouchEvents(): void {
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }
  
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const screenWidth = rect.width;
    const screenHeight = rect.height;
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Left side of screen = joystick
      if (x < screenWidth * 0.4 && this.touchJoystickId === null) {
        this.touchJoystickId = touch.identifier;
        this.touchJoystickOrigin = new Vector2(x, y);
      }
      // Bottom right = fire button
      else if (x > screenWidth * 0.7 && y > screenHeight * 0.6 && this.touchFireId === null) {
        this.touchFireId = touch.identifier;
        this.inputState.isMobileFirePressed = true;
        this.inputState.shoot = true;
      }
      // Rest of right side = look
      else if (x > screenWidth * 0.5 && this.touchLookId === null) {
        this.touchLookId = touch.identifier;
        this.lastTouchLookPos = new Vector2(x, y);
      }
    }
  }
  
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Joystick movement
      if (touch.identifier === this.touchJoystickId) {
        const deltaX = x - this.touchJoystickOrigin.x;
        const deltaY = y - this.touchJoystickOrigin.y;
        
        const maxRadius = 50;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const clampedDistance = Math.min(distance, maxRadius);
        
        const angle = Math.atan2(deltaY, deltaX);
        const normalizedX = (Math.cos(angle) * clampedDistance) / maxRadius;
        const normalizedY = (Math.sin(angle) * clampedDistance) / maxRadius;
        
        this.inputState.joystickX = normalizedX;
        this.inputState.joystickY = normalizedY;
      }
      
      // Look movement
      if (touch.identifier === this.touchLookId) {
        const deltaX = x - this.lastTouchLookPos.x;
        const deltaY = y - this.lastTouchLookPos.y;
        
        this.mouseDeltaX += deltaX * 2; // Amplify for touch
        this.mouseDeltaY += deltaY * 2;
        
        this.lastTouchLookPos = new Vector2(x, y);
      }
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      
      if (touch.identifier === this.touchJoystickId) {
        this.touchJoystickId = null;
        this.inputState.joystickX = 0;
        this.inputState.joystickY = 0;
      }
      
      if (touch.identifier === this.touchFireId) {
        this.touchFireId = null;
        this.inputState.isMobileFirePressed = false;
        this.inputState.shoot = false;
      }
      
      if (touch.identifier === this.touchLookId) {
        this.touchLookId = null;
      }
    }
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(): void {
    // Calculate look input
    this.inputState.lookX = this.mouseDeltaX * this.sensitivity;
    this.inputState.lookY = this.mouseDeltaY * this.sensitivity * (this.invertY ? -1 : 1);
    
    // Reset deltas
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    
    // Reset one-shot inputs
    this.inputState.pause = false;
  }
  
  // ===========================================================================
  // GETTERS & SETTERS
  // ===========================================================================
  
  public getState(): IInputState {
    return { ...this.inputState };
  }
  
  public setSensitivity(value: number): void {
    this.sensitivity = value;
  }
  
  public setInvertY(value: boolean): void {
    this.invertY = value;
  }
  
  public setJoystick(x: number, y: number): void {
    this.inputState.joystickX = x;
    this.inputState.joystickY = y;
  }
  
  public setFiring(isFiring: boolean): void {
    this.inputState.isMobileFirePressed = isFiring;
  }
  
  // ===========================================================================
  // MOVEMENT HELPERS
  // ===========================================================================
  
  public getMovementVector(): Vector2 {
    let x = 0;
    let y = 0;
    
    // Keyboard
    if (this.inputState.forward) y += 1;
    if (this.inputState.backward) y -= 1;
    if (this.inputState.left) x -= 1;
    if (this.inputState.right) x += 1;
    
    // Mobile joystick
    if (performanceConfig.isMobile) {
      x += this.inputState.joystickX;
      y -= this.inputState.joystickY; // Invert Y for forward
    }
    
    // Normalize
    const length = Math.sqrt(x * x + y * y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    
    return new Vector2(x, y);
  }
  
  public isMoving(): boolean {
    const movement = this.getMovementVector();
    return Math.abs(movement.x) > 0.1 || Math.abs(movement.y) > 0.1;
  }
  
  public isShooting(): boolean {
    return this.inputState.shoot || this.inputState.isMobileFirePressed;
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
    window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
    this.releasePointer();
  }
}

export default InputManager;
