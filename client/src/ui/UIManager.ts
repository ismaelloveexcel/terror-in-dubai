/**
 * SAVE ISMAEL - UI Manager
 * Central manager for all UI systems: HUD, Menus, Dialogue
 */

import { Scene } from '@babylonjs/core';
import { HUD } from './HUD';
import { MainMenu, MainMenuCallbacks } from './MainMenu';
import { DialogueSystem, DialogueEntry } from './DialogueSystem';
import { IDialogueData } from '../types';

export interface LevelIntroData {
    levelNumber: number;
    name: string;
    subtitle: string;
    objectives: string[];
}

export interface LevelCompleteData {
    levelNumber: number;
    onContinue: () => void;
}

export interface GameOverData {
    onRetry: () => void;
    onQuit: () => void;
}

export interface PauseMenuData {
    onResume: () => void;
    onSettings: () => void;
    onQuit: () => void;
}

export interface SettingsData {
    settings: any;
    onSave: (settings: any) => void;
    onClose: () => void;
}

export class UIManager {
    private scene: Scene;
    private hud: HUD;
    private mainMenu: MainMenu | null = null;
    private dialogueSystem: DialogueSystem;
    
    // Event handlers (bound for proper cleanup)
    private boundPlayerDamagedHandler: () => void;
    private boundEvidenceCollectedHandler: (e: Event) => void;
    
    // State
    private isInitialized: boolean = false;
    private showFPS: boolean = false;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.hud = new HUD(scene);
        this.dialogueSystem = new DialogueSystem(scene);
        
        // Bind event handlers
        this.boundPlayerDamagedHandler = () => this.showDamageFlash();
        this.boundEvidenceCollectedHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.showEvidencePopup(detail.name, detail.description);
        };
    }
    
    /**
     * Initialize the UI manager
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
    }
    
    /**
     * Set up global UI event listeners
     */
    private setupEventListeners(): void {
        // Player damage flash
        window.addEventListener('playerDamaged', this.boundPlayerDamagedHandler);
        
        // Evidence collected
        window.addEventListener('evidenceCollected', this.boundEvidenceCollectedHandler);
    }
    
    /**
     * Remove event listeners (cleanup)
     */
    private removeEventListeners(): void {
        window.removeEventListener('playerDamaged', this.boundPlayerDamagedHandler);
        window.removeEventListener('evidenceCollected', this.boundEvidenceCollectedHandler);
    }
    
    /**
     * Show main menu
     */
    public showMainMenu(callbacks: MainMenuCallbacks): void {
        if (this.mainMenu) {
            this.mainMenu.show();
            return;
        }
        
        this.mainMenu = new MainMenu(this.scene, callbacks);
        this.mainMenu.show();
        
        // Hide HUD
        this.hud.setVisible(false);
    }
    
    /**
     * Hide main menu
     */
    public hideMainMenu(): void {
        if (this.mainMenu) {
            this.mainMenu.hide();
        }
    }
    
    /**
     * Show loading screen
     */
    public showLoading(message: string): void {
        window.dispatchEvent(new CustomEvent('showLoading', {
            detail: { message }
        }));
    }
    
    /**
     * Update loading progress
     */
    public updateLoading(percentage: number, message: string): void {
        window.dispatchEvent(new CustomEvent('updateLoading', {
            detail: { percentage, message }
        }));
    }
    
    /**
     * Hide loading screen
     */
    public hideLoading(): void {
        window.dispatchEvent(new CustomEvent('hideLoading'));
    }
    
    /**
     * Show level intro
     */
    public async showLevelIntro(data: LevelIntroData): Promise<void> {
        return new Promise((resolve) => {
            window.dispatchEvent(new CustomEvent('showLevelIntro', {
                detail: data
            }));
            
            // Auto-resolve after intro duration
            setTimeout(() => {
                this.hud.setVisible(true);
                resolve();
            }, 3000);
        });
    }
    
    /**
     * Show level complete screen
     */
    public showLevelComplete(data: LevelCompleteData): void {
        window.dispatchEvent(new CustomEvent('showLevelComplete', {
            detail: data
        }));
    }
    
    /**
     * Show pause menu
     */
    public showPauseMenu(data: PauseMenuData): void {
        window.dispatchEvent(new CustomEvent('showPauseMenu', {
            detail: data
        }));
    }
    
    /**
     * Hide pause menu
     */
    public hidePauseMenu(): void {
        window.dispatchEvent(new CustomEvent('hidePauseMenu'));
    }
    
    /**
     * Show game over screen
     */
    public showGameOver(data: GameOverData): void {
        this.hud.setVisible(false);
        window.dispatchEvent(new CustomEvent('showGameOver', {
            detail: data
        }));
    }
    
    /**
     * Show victory screen
     */
    public async showVictory(): Promise<void> {
        return new Promise((resolve) => {
            window.dispatchEvent(new CustomEvent('showVictory'));
            
            // Wait for victory sequence
            setTimeout(() => {
                resolve();
            }, 10000);
        });
    }
    
    /**
     * Show credits
     */
    public async showCredits(): Promise<void> {
        return new Promise((resolve) => {
            window.dispatchEvent(new CustomEvent('showCredits'));
            
            // Wait for credits to finish
            setTimeout(() => {
                resolve();
            }, 15000);
        });
    }
    
    /**
     * Show post credits
     */
    public async showPostCredits(): Promise<void> {
        return new Promise((resolve) => {
            window.dispatchEvent(new CustomEvent('showPostCredits'));
            
            setTimeout(() => {
                resolve();
            }, 5000);
        });
    }
    
    /**
     * Show settings menu
     */
    public showSettings(data: SettingsData): void {
        window.dispatchEvent(new CustomEvent('showSettings', {
            detail: data
        }));
    }
    
    /**
     * Show dialogue
     */
    public async showDialogue(data: IDialogueData): Promise<void> {
        return new Promise((resolve) => {
            const entry: DialogueEntry = {
                speaker: data.speaker,
                text: data.text,
                isVoiceNote: data.isVoiceNote,
                duration: data.duration || 5000
            };
            
            this.dialogueSystem.queueDialogue(entry);
            
            // Resolve after dialogue duration
            setTimeout(() => {
                resolve();
            }, entry.duration);
        });
    }
    
    /**
     * Show damage flash effect
     */
    public showDamageFlash(): void {
        this.hud.flashDamage();
    }
    
    /**
     * Show evidence popup
     */
    private showEvidencePopup(name: string, description: string): void {
        this.hud.setEvidenceCollected(true);
        
        // Also queue a dialogue
        this.dialogueSystem.queueDialogue({
            speaker: 'EVIDENCE FOUND',
            text: `${name}: ${description}`,
            duration: 4000
        });
    }
    
    /**
     * Update HUD
     */
    public update(deltaTime: number): void {
        // Update FPS display if enabled
        if (this.showFPS) {
            // FPS tracking would go here
        }
    }
    
    /**
     * Set FPS display visibility
     */
    public setShowFPS(show: boolean): void {
        this.showFPS = show;
    }
    
    /**
     * Update HUD health
     */
    public setHealth(current: number, max: number): void {
        this.hud.setHealth(current, max);
    }
    
    /**
     * Update HUD ammo
     */
    public setAmmo(current: number, max: number): void {
        this.hud.setAmmo(current, max);
    }
    
    /**
     * Update HUD weapon
     */
    public setWeapon(weapon: string): void {
        this.hud.setWeapon(weapon);
    }
    
    /**
     * Update HUD objective
     */
    public setObjective(objective: string): void {
        this.hud.setObjective(objective);
    }
    
    /**
     * Update HUD enemy count
     */
    public setEnemyCount(count: number): void {
        this.hud.setEnemyCount(count);
    }
    
    /**
     * Get HUD reference
     */
    public getHUD(): HUD {
        return this.hud;
    }
    
    /**
     * Get dialogue system reference
     */
    public getDialogueSystem(): DialogueSystem {
        return this.dialogueSystem;
    }
    
    /**
     * Dispose all UI
     */
    public dispose(): void {
        // Remove event listeners to prevent memory leaks
        this.removeEventListeners();
        
        this.hud.dispose();
        this.mainMenu?.dispose();
        this.dialogueSystem.dispose();
    }
}

export default UIManager;
