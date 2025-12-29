/**
 * SAVE ISMAEL - Level Manager
 * Handles level transitions and game flow
 */

import { Scene, Vector3 } from '@babylonjs/core';
import { Level } from './Level';
import { Level1_IbnBattuta } from './Level1_IbnBattuta';
import { Level2_Metro } from './Level2_Metro';
import { Level3_Frame } from './Level3_Frame';
import { Level4_Marina } from './Level4_Marina';
import { Level5_Downtown } from './Level5_Downtown';
import { Level6_BurjKhalifa } from './Level6_BurjKhalifa';

export interface LevelProgress {
    levelId: number;
    completed: boolean;
    evidenceCollected: boolean;
    completionTime: number;
    enemiesDefeated: number;
}

export class LevelManager {
    private scene: Scene;
    private levels: Map<number, Level> = new Map();
    private currentLevel: Level | null = null;
    private currentLevelId: number = 0;
    private progress: LevelProgress[] = [];
    private isTransitioning: boolean = false;
    
    // Event handlers
    private boundLevelCompleteHandler: (e: Event) => void;
    private boundGameVictoryHandler: (e: Event) => void;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeLevels();
        this.initializeProgress();
        
        // Bind event handlers
        this.boundLevelCompleteHandler = this.onLevelComplete.bind(this);
        this.boundGameVictoryHandler = this.onGameVictory.bind(this);
        
        window.addEventListener('levelComplete', this.boundLevelCompleteHandler);
        window.addEventListener('gameVictory', this.boundGameVictoryHandler);
    }
    
    /**
     * Initialize all levels
     */
    private initializeLevels(): void {
        this.levels.set(1, new Level1_IbnBattuta(this.scene));
        this.levels.set(2, new Level2_Metro(this.scene));
        this.levels.set(3, new Level3_Frame(this.scene));
        this.levels.set(4, new Level4_Marina(this.scene));
        this.levels.set(5, new Level5_Downtown(this.scene));
        this.levels.set(6, new Level6_BurjKhalifa(this.scene));
    }
    
    /**
     * Initialize progress tracking
     */
    private initializeProgress(): void {
        for (let i = 1; i <= 6; i++) {
            this.progress.push({
                levelId: i,
                completed: false,
                evidenceCollected: false,
                completionTime: 0,
                enemiesDefeated: 0
            });
        }
    }
    
    /**
     * Load a specific level
     */
    public async loadLevel(levelId: number): Promise<boolean> {
        if (this.isTransitioning) {
            console.warn('Level transition in progress');
            return false;
        }
        
        const level = this.levels.get(levelId);
        if (!level) {
            console.error(`Level ${levelId} not found`);
            return false;
        }
        
        this.isTransitioning = true;
        
        // Unload current level if exists
        if (this.currentLevel) {
            await this.unloadCurrentLevel();
        }
        
        // Show loading screen
        window.dispatchEvent(new CustomEvent('showLoading', {
            detail: { 
                message: `Loading ${level.getConfig().name}...`,
                subtitle: level.getConfig().subtitle
            }
        }));
        
        try {
            // Load new level
            await level.load();
            
            this.currentLevel = level;
            this.currentLevelId = levelId;
            
            // Hide loading screen
            window.dispatchEvent(new CustomEvent('hideLoading'));
            
            // Notify UI
            window.dispatchEvent(new CustomEvent('levelLoaded', {
                detail: {
                    levelId,
                    config: level.getConfig()
                }
            }));
            
            this.isTransitioning = false;
            return true;
            
        } catch (error) {
            console.error(`Failed to load level ${levelId}:`, error);
            this.isTransitioning = false;
            return false;
        }
    }
    
    /**
     * Unload the current level
     */
    private async unloadCurrentLevel(): Promise<void> {
        if (this.currentLevel) {
            this.currentLevel.unload();
            this.currentLevel = null;
        }
    }
    
    /**
     * Start the game from level 1
     */
    public async startGame(): Promise<void> {
        await this.loadLevel(1);
    }
    
    /**
     * Continue to next level
     */
    public async nextLevel(): Promise<boolean> {
        const nextLevelId = this.currentLevelId + 1;
        
        if (nextLevelId > 6) {
            // Game complete!
            this.onGameComplete();
            return false;
        }
        
        return await this.loadLevel(nextLevelId);
    }
    
    /**
     * Handle level completion
     */
    private onLevelComplete(event: Event): void {
        const detail = (event as CustomEvent).detail;
        
        // Update progress
        const levelProgress = this.progress.find(p => p.levelId === detail.level);
        if (levelProgress) {
            levelProgress.completed = true;
            levelProgress.evidenceCollected = detail.evidenceCollected;
            levelProgress.completionTime = detail.time;
            levelProgress.enemiesDefeated = detail.enemiesDefeated;
        }
        
        // Show level complete screen
        window.dispatchEvent(new CustomEvent('showLevelComplete', {
            detail: {
                level: detail.level,
                time: detail.time,
                evidenceCollected: detail.evidenceCollected,
                nextLevel: detail.level + 1
            }
        }));
    }
    
    /**
     * Handle game victory
     */
    private onGameVictory(event: Event): void {
        const detail = (event as CustomEvent).detail;
        
        // Mark level 6 complete
        const finalProgress = this.progress.find(p => p.levelId === 6);
        if (finalProgress) {
            finalProgress.completed = true;
            finalProgress.completionTime = detail.time;
        }
        
        // Don't show completion yet - escape sequence first
        setTimeout(() => {
            this.showVictorySequence();
        }, 10000);
    }
    
    /**
     * Show victory sequence
     */
    private showVictorySequence(): void {
        // Calculate total stats
        const totalTime = this.progress.reduce((sum, p) => sum + p.completionTime, 0);
        const evidenceCount = this.progress.filter(p => p.evidenceCollected).length;
        const totalEnemies = this.progress.reduce((sum, p) => sum + p.enemiesDefeated, 0);
        
        window.dispatchEvent(new CustomEvent('showVictory', {
            detail: {
                totalTime,
                evidenceCollected: evidenceCount,
                totalEnemies,
                progress: this.progress
            }
        }));
    }
    
    /**
     * Handle full game completion
     */
    private onGameComplete(): void {
        this.showVictorySequence();
    }
    
    /**
     * Update current level
     */
    public update(deltaTime: number, playerPosition?: Vector3): void {
        if (this.currentLevel && !this.isTransitioning) {
            // Pass player position if available, otherwise use a default
            const pos = playerPosition || new Vector3(0, 0, 0);
            this.currentLevel.update(deltaTime, pos);
        }
    }
    
    /**
     * Get player spawn point for current level
     */
    public getPlayerSpawnPoint(): Vector3 {
        if (this.currentLevel) {
            return this.currentLevel.getPlayerSpawnPoint();
        }
        return new Vector3(0, 1, 0);
    }
    
    /**
     * Get current level
     */
    public getCurrentLevel(): Level | null {
        return this.currentLevel;
    }
    
    /**
     * Get current level ID
     */
    public getCurrentLevelId(): number {
        return this.currentLevelId;
    }
    
    /**
     * Get progress for all levels
     */
    public getProgress(): LevelProgress[] {
        return [...this.progress];
    }
    
    /**
     * Check if level is unlocked
     */
    public isLevelUnlocked(levelId: number): boolean {
        if (levelId === 1) return true;
        
        const previousProgress = this.progress.find(p => p.levelId === levelId - 1);
        return previousProgress?.completed || false;
    }
    
    /**
     * Save progress to local storage
     */
    public saveProgress(): void {
        const saveData = {
            currentLevel: this.currentLevelId,
            progress: this.progress
        };
        
        localStorage.setItem('saveIsmael_progress', JSON.stringify(saveData));
    }
    
    /**
     * Load progress from local storage
     */
    public loadProgress(): boolean {
        const saveData = localStorage.getItem('saveIsmael_progress');
        
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.progress = data.progress;
                return true;
            } catch (error) {
                console.error('Failed to load save data:', error);
                return false;
            }
        }
        
        return false;
    }
    
    /**
     * Reset progress
     */
    public resetProgress(): void {
        this.initializeProgress();
        localStorage.removeItem('saveIsmael_progress');
    }
    
    /**
     * Check if current level is complete
     */
    public isLevelComplete(): boolean {
        if (!this.currentLevel) return false;
        return this.currentLevel.getIsComplete();
    }
    
    /**
     * Get player start position (alias for getPlayerSpawnPoint)
     */
    public getPlayerStartPosition(): Vector3 {
        return this.getPlayerSpawnPoint();
    }
    
    /**
     * Set the player reference (for levels that need it)
     */
    public setPlayer(player: any): void {
        // Store player reference if levels need it
        // This is a placeholder for compatibility
    }
    
    /**
     * Cleanup
     */
    public dispose(): void {
        window.removeEventListener('levelComplete', this.boundLevelCompleteHandler);
        window.removeEventListener('gameVictory', this.boundGameVictoryHandler);
        
        this.levels.forEach(level => level.unload());
        this.levels.clear();
    }
}

export default LevelManager;
