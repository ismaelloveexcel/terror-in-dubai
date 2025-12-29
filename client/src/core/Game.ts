// Game.ts - Main Game Controller
// Save Ismael - Premium Web Game

import { Engine, Scene, Vector3, Color4 } from '@babylonjs/core';
import { gameConfig, performanceConfig, visualConfig, levelConfig, storyConfig } from '../config/gameConfig';
import { GameState, IGameEvents, ILoadingProgress, LoadingCallback } from '../types';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { UIManager } from '../ui/UIManager';
import { PlayerController } from '../player/PlayerController';
import { LevelManager } from '../levels/LevelManager';
import { SaveSystem } from './SaveSystem';

export class Game {
  // Engine & Scene
  private engine: Engine;
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  
  // Managers
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private uiManager: UIManager;
  private levelManager: LevelManager;
  private saveSystem: SaveSystem;
  
  // Player
  private player: PlayerController | null = null;
  
  // State
  private gameState: GameState = GameState.LOADING;
  private currentLevel: number = 1;
  private isPaused: boolean = false;
  private isInitialized: boolean = false;
  
  // Callbacks
  private loadingCallback: LoadingCallback | null = null;
  
  // Events
  public events: Partial<IGameEvents> = {};
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    // Initialize Babylon.js Engine
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: !performanceConfig.isMobile,
    });
    
    // Apply render scale for mobile
    if (performanceConfig.renderScale < 1) {
      this.engine.setHardwareScalingLevel(1 / performanceConfig.renderScale);
    }
    
    // Create initial scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(
      visualConfig.colors.shadowDark.charAt(1) === '0' ? 0.04 : 0.1,
      visualConfig.colors.shadowDark.charAt(3) === '0' ? 0.04 : 0.1,
      visualConfig.colors.shadowDark.charAt(5) === '1' ? 0.07 : 0.1,
      1
    );
    
    // Initialize managers
    this.sceneManager = new SceneManager(this.scene);
    this.inputManager = new InputManager(this.scene, canvas);
    this.audioManager = new AudioManager(this.scene);
    this.uiManager = new UIManager(this.scene);
    this.levelManager = new LevelManager(this.scene);
    this.saveSystem = new SaveSystem();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    
    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameState === GameState.PLAYING) {
        this.pause();
      }
    });
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  public async initialize(onProgress?: LoadingCallback): Promise<void> {
    this.loadingCallback = onProgress || null;
    
    try {
      // Load saved data
      this.updateLoading(0, 5, 'Loading save data...');
      await this.saveSystem.load();
      
      // Initialize audio
      this.updateLoading(1, 5, 'Initializing audio...');
      await this.audioManager.initialize();
      
      // Initialize UI
      this.updateLoading(2, 5, 'Setting up interface...');
      await this.uiManager.initialize();
      
      // Initialize input
      this.updateLoading(3, 5, 'Configuring controls...');
      this.inputManager.initialize();
      
      // Setup scene
      this.updateLoading(4, 5, 'Preparing scene...');
      this.sceneManager.setupPostProcessing();
      this.sceneManager.setupFog();
      
      // Complete
      this.updateLoading(5, 5, 'Ready');
      this.isInitialized = true;
      
      // Start render loop
      this.startRenderLoop();
      
      // Show main menu
      this.showMainMenu();
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }
  
  private updateLoading(current: number, total: number, message: string): void {
    if (this.loadingCallback) {
      this.loadingCallback({
        current,
        total,
        message,
        percentage: Math.round((current / total) * 100),
      });
    }
  }
  
  // ===========================================================================
  // GAME LOOP
  // ===========================================================================
  
  private startRenderLoop(): void {
    let lastTime = performance.now();
    
    this.engine.runRenderLoop(() => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Cap delta time to prevent huge jumps
      const cappedDelta = Math.min(deltaTime, 0.1);
      
      // Update game logic
      if (this.gameState === GameState.PLAYING && !this.isPaused) {
        this.update(cappedDelta);
      }
      
      // Render
      this.scene.render();
    });
  }
  
  private update(deltaTime: number): void {
    // Update input
    this.inputManager.update();
    
    // Check for pause
    if (this.inputManager.getState().pause) {
      this.pause();
      return;
    }
    
    // Update player
    if (this.player) {
      this.player.update(deltaTime);
      
      // Check player death
      if (this.player.isDead()) {
        this.handlePlayerDeath();
        return;
      }
    }
    
    // Update current level
    this.levelManager.update(deltaTime);
    
    // Check level completion
    if (this.levelManager.isLevelComplete()) {
      this.handleLevelComplete();
    }
    
    // Update UI
    this.uiManager.update(deltaTime);
    
    // Update audio (ambient, etc.)
    this.audioManager.update(deltaTime);
  }
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  public showMainMenu(): void {
    this.gameState = GameState.MENU;
    this.uiManager.showMainMenu({
      onNewGame: () => this.startNewGame(),
      onContinue: () => this.continueGame(),
      onSettings: () => this.showSettings(),
    });
    this.audioManager.playMusic('menu');
  }
  
  public async startNewGame(): Promise<void> {
    this.currentLevel = 1;
    this.saveSystem.reset();
    await this.showPrologue();
  }
  
  public async continueGame(): Promise<void> {
    const saveData = this.saveSystem.getData();
    this.currentLevel = saveData.currentLevel;
    await this.startLevel(this.currentLevel);
  }
  
  private async showPrologue(): Promise<void> {
    this.gameState = GameState.PROLOGUE;
    
    // Show opening voicemail
    await this.uiManager.showDialogue({
      speaker: gameConfig.rescueTarget,
      text: storyConfig.openingMessage,
      isVoiceNote: true,
    });
    
    // Start first level
    await this.startLevel(1);
  }
  
  public async startLevel(levelNumber: number): Promise<void> {
    this.gameState = GameState.LOADING;
    this.currentLevel = levelNumber;
    
    const config = levelConfig[levelNumber as keyof typeof levelConfig];
    if (!config) {
      console.error(`Level ${levelNumber} not found`);
      return;
    }
    
    // Show loading screen
    this.uiManager.showLoading(`Loading ${config.name}...`);
    
    try {
      // Load level
      await this.levelManager.loadLevel(levelNumber);
      
      // Create player
      this.player = new PlayerController(
        this.scene,
        this.inputManager,
        this.levelManager.getPlayerStartPosition()
      );
      
      // Setup player callbacks
      this.player.onDamage = (amount) => {
        this.uiManager.showDamageFlash();
        this.audioManager.playSFX('playerDamage');
        this.events.onPlayerDamage?.(amount);
      };
      
      // Connect player to level
      this.levelManager.setPlayer(this.player);
      
      // Hide loading
      this.uiManager.hideLoading();
      
      // Show level intro
      await this.showLevelIntro(levelNumber);
      
      // Start playing
      this.gameState = GameState.PLAYING;
      this.audioManager.playMusic('ambient');
      
      // Fire event
      this.events.onLevelStart?.(levelNumber);
      
    } catch (error) {
      console.error('Failed to load level:', error);
      this.uiManager.hideLoading();
      this.showMainMenu();
    }
  }
  
  private async showLevelIntro(levelNumber: number): Promise<void> {
    const config = levelConfig[levelNumber as keyof typeof levelConfig];
    if (!config) return;
    
    await this.uiManager.showLevelIntro({
      levelNumber,
      name: config.name,
      subtitle: config.subtitle,
      objectives: config.objectives,
    });
  }
  
  private handleLevelComplete(): void {
    this.gameState = GameState.LEVEL_COMPLETE;
    
    const config = levelConfig[this.currentLevel as keyof typeof levelConfig];
    
    // Save progress
    this.saveSystem.setLevel(this.currentLevel + 1);
    this.saveSystem.save();
    
    // Fire event
    this.events.onLevelComplete?.(this.currentLevel);
    
    // Check if game complete
    if ((config as any)?.isFinalLevel) {
      this.showVictory();
    } else {
      this.uiManager.showLevelComplete({
        levelNumber: this.currentLevel,
        onContinue: () => this.startLevel(this.currentLevel + 1),
      });
    }
  }
  
  private handlePlayerDeath(): void {
    this.gameState = GameState.GAME_OVER;
    this.events.onPlayerDeath?.();
    
    this.uiManager.showGameOver({
      onRetry: () => this.startLevel(this.currentLevel),
      onQuit: () => this.showMainMenu(),
    });
    
    this.audioManager.stopMusic();
  }
  
  private async showVictory(): Promise<void> {
    this.gameState = GameState.VICTORY;
    
    // Play victory music
    this.audioManager.playMusic('victory');
    
    // Show victory sequence
    await this.uiManager.showVictory();
    
    // Show credits
    await this.showCredits();
    
    // Return to menu
    this.showMainMenu();
  }
  
  private async showCredits(): Promise<void> {
    this.gameState = GameState.CREDITS;
    await this.uiManager.showCredits();
    
    // Post credits
    await this.uiManager.showPostCredits();
  }
  
  public pause(): void {
    if (this.gameState !== GameState.PLAYING) return;
    
    this.isPaused = true;
    this.gameState = GameState.PAUSED;
    this.inputManager.releasePointer();
    
    this.uiManager.showPauseMenu({
      onResume: () => this.resume(),
      onSettings: () => this.showSettings(),
      onQuit: () => this.showMainMenu(),
    });
  }
  
  public resume(): void {
    if (this.gameState !== GameState.PAUSED) return;
    
    this.uiManager.hidePauseMenu();
    this.inputManager.requestPointer();
    this.isPaused = false;
    this.gameState = GameState.PLAYING;
  }
  
  public showSettings(): void {
    this.uiManager.showSettings({
      settings: this.saveSystem.getData().settings,
      onSave: (settings) => {
        this.saveSystem.updateSettings(settings);
        this.applySettings(settings);
      },
      onClose: () => {
        if (this.isPaused) {
          this.uiManager.showPauseMenu({
            onResume: () => this.resume(),
            onSettings: () => this.showSettings(),
            onQuit: () => this.showMainMenu(),
          });
        } else {
          this.showMainMenu();
        }
      },
    });
  }
  
  private applySettings(settings: any): void {
    this.audioManager.setMasterVolume(settings.masterVolume);
    this.audioManager.setMusicVolume(settings.musicVolume);
    this.audioManager.setSFXVolume(settings.sfxVolume);
    this.inputManager.setSensitivity(settings.sensitivity);
    this.inputManager.setInvertY(settings.invertY);
    this.uiManager.setShowFPS(settings.showFPS);
  }
  
  // ===========================================================================
  // DIALOGUE & STORY
  // ===========================================================================
  
  public async showDialogue(speaker: string, text: string, isVoiceNote = false): Promise<void> {
    const previousState = this.gameState;
    this.gameState = GameState.DIALOGUE;
    
    this.events.onDialogueStart?.({ speaker, text, isVoiceNote });
    
    await this.uiManager.showDialogue({ speaker, text, isVoiceNote });
    
    this.events.onDialogueEnd?.();
    this.gameState = previousState;
  }
  
  public async showVoiceNote(levelNumber: number): Promise<void> {
    const note = storyConfig.voiceNotes[levelNumber as keyof typeof storyConfig.voiceNotes];
    if (!note) return;
    
    await this.showDialogue(gameConfig.rescueTarget, note, true);
  }
  
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  
  public getState(): GameState {
    return this.gameState;
  }
  
  public getCurrentLevel(): number {
    return this.currentLevel;
  }
  
  public getPlayer(): PlayerController | null {
    return this.player;
  }
  
  public getScene(): Scene {
    return this.scene;
  }
  
  public getEngine(): Engine {
    return this.engine;
  }
  
  public getAudioManager(): AudioManager {
    return this.audioManager;
  }
  
  public getUIManager(): UIManager {
    return this.uiManager;
  }
  
  public getLevelManager(): LevelManager {
    return this.levelManager;
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.levelManager.dispose();
    this.player?.dispose();
    this.uiManager.dispose();
    this.audioManager.dispose();
    this.inputManager.dispose();
    this.sceneManager.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
  
  // ===========================================================================
  // NAVIGATION METHODS (for UI callbacks)
  // ===========================================================================
  
  public returnToMenu(): void {
    this.showMainMenu();
  }
  
  public async nextLevel(): Promise<void> {
    this.currentLevel++;
    await this.startLevel(this.currentLevel);
  }
  
  public async retry(): Promise<void> {
    await this.startLevel(this.currentLevel);
  }
}

export default Game;
