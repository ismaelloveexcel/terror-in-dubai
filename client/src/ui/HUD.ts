/**
 * SAVE ISMAEL - HUD (Heads Up Display)
 * In-game UI showing health, ammo, objectives, etc.
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle, Image, StackPanel, Control } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';

export interface HUDState {
    health: number;
    maxHealth: number;
    ammo: number;
    maxAmmo: number;
    currentWeapon: string;
    levelName: string;
    objective: string;
    enemiesRemaining: number;
    evidenceCollected: boolean;
}

export class HUD {
    private scene: Scene;
    private gui: AdvancedDynamicTexture;
    private isVisible: boolean = true;
    
    // UI Elements
    private healthBar: Rectangle | null = null;
    private healthText: TextBlock | null = null;
    private ammoText: TextBlock | null = null;
    private weaponText: TextBlock | null = null;
    private levelText: TextBlock | null = null;
    private objectiveText: TextBlock | null = null;
    private enemyCountText: TextBlock | null = null;
    private evidenceIcon: Rectangle | null = null;
    private crosshair: Rectangle | null = null;
    private damageOverlay: Rectangle | null = null;
    private waveText: TextBlock | null = null;
    
    // State
    private state: HUDState = {
        health: 100,
        maxHealth: 100,
        ammo: 30,
        maxAmmo: 30,
        currentWeapon: 'Flashlight',
        levelName: '',
        objective: '',
        enemiesRemaining: 0,
        evidenceCollected: false
    };
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);
        this.createHUD();
        this.setupEventListeners();
    }
    
    private createHUD(): void {
        this.createHealthBar();
        this.createAmmoDisplay();
        this.createWeaponDisplay();
        this.createLevelInfo();
        this.createObjectiveDisplay();
        this.createEnemyCounter();
        this.createEvidenceIndicator();
        this.createCrosshair();
        this.createDamageOverlay();
        this.createWaveIndicator();
    }
    
    private createHealthBar(): void {
        // Container
        const container = new Rectangle('healthContainer');
        container.width = '250px';
        container.height = '30px';
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        container.left = '20px';
        container.top = '-60px';
        container.thickness = 2;
        container.color = '#333';
        container.background = '#111';
        this.gui.addControl(container);
        
        // Health bar
        this.healthBar = new Rectangle('healthBar');
        this.healthBar.width = '100%';
        this.healthBar.height = '100%';
        this.healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.healthBar.background = '#cc0000';
        container.addControl(this.healthBar);
        
        // Health text
        this.healthText = new TextBlock('healthText');
        this.healthText.text = '100/100';
        this.healthText.color = 'white';
        this.healthText.fontSize = 16;
        this.healthText.fontFamily = 'Arial';
        container.addControl(this.healthText);
        
        // Health label
        const label = new TextBlock('healthLabel');
        label.text = 'HEALTH';
        label.color = '#888';
        label.fontSize = 12;
        label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        label.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        label.left = '20px';
        label.top = '-95px';
        this.gui.addControl(label);
    }
    
    private createAmmoDisplay(): void {
        const container = new Rectangle('ammoContainer');
        container.width = '150px';
        container.height = '50px';
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        container.left = '-20px';
        container.top = '-60px';
        container.thickness = 0;
        this.gui.addControl(container);
        
        this.ammoText = new TextBlock('ammoText');
        this.ammoText.text = '30/30';
        this.ammoText.color = 'white';
        this.ammoText.fontSize = 32;
        this.ammoText.fontFamily = 'Arial';
        this.ammoText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.addControl(this.ammoText);
        
        // Ammo label
        const label = new TextBlock('ammoLabel');
        label.text = 'AMMO';
        label.color = '#888';
        label.fontSize = 12;
        label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        label.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        label.left = '-20px';
        label.top = '-115px';
        this.gui.addControl(label);
    }
    
    private createWeaponDisplay(): void {
        this.weaponText = new TextBlock('weaponText');
        this.weaponText.text = 'FLASHLIGHT';
        this.weaponText.color = '#00cccc';
        this.weaponText.fontSize = 14;
        this.weaponText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.weaponText.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.weaponText.left = '-20px';
        this.weaponText.top = '-30px';
        this.gui.addControl(this.weaponText);
    }
    
    private createLevelInfo(): void {
        this.levelText = new TextBlock('levelText');
        this.levelText.text = 'LEVEL 1: IBN BATTUTA MALL';
        this.levelText.color = '#00cccc';
        this.levelText.fontSize = 18;
        this.levelText.fontFamily = 'Arial';
        this.levelText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.levelText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.levelText.left = '20px';
        this.levelText.top = '20px';
        this.gui.addControl(this.levelText);
    }
    
    private createObjectiveDisplay(): void {
        this.objectiveText = new TextBlock('objectiveText');
        this.objectiveText.text = 'Find Uncle\'s car keys';
        this.objectiveText.color = '#ffcc00';
        this.objectiveText.fontSize = 14;
        this.objectiveText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.objectiveText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.objectiveText.left = '20px';
        this.objectiveText.top = '50px';
        this.gui.addControl(this.objectiveText);
    }
    
    private createEnemyCounter(): void {
        this.enemyCountText = new TextBlock('enemyCount');
        this.enemyCountText.text = 'Enemies: 0';
        this.enemyCountText.color = '#ff6666';
        this.enemyCountText.fontSize = 14;
        this.enemyCountText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.enemyCountText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.enemyCountText.left = '-20px';
        this.enemyCountText.top = '20px';
        this.gui.addControl(this.enemyCountText);
    }
    
    private createEvidenceIndicator(): void {
        this.evidenceIcon = new Rectangle('evidenceIcon');
        this.evidenceIcon.width = '40px';
        this.evidenceIcon.height = '40px';
        this.evidenceIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.evidenceIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.evidenceIcon.left = '20px';
        this.evidenceIcon.top = '80px';
        this.evidenceIcon.background = '#333';
        this.evidenceIcon.thickness = 2;
        this.evidenceIcon.color = '#666';
        this.evidenceIcon.cornerRadius = 5;
        this.gui.addControl(this.evidenceIcon);
        
        // Icon text
        const iconText = new TextBlock('evidenceIconText');
        iconText.text = '?';
        iconText.color = '#666';
        iconText.fontSize = 24;
        this.evidenceIcon.addControl(iconText);
    }
    
    private createCrosshair(): void {
        this.crosshair = new Rectangle('crosshair');
        this.crosshair.width = '4px';
        this.crosshair.height = '4px';
        this.crosshair.background = '#00cccc';
        this.crosshair.cornerRadius = 2;
        this.gui.addControl(this.crosshair);
        
        // Horizontal line
        const hLine = new Rectangle('crosshairH');
        hLine.width = '20px';
        hLine.height = '2px';
        hLine.background = '#00cccc88';
        this.gui.addControl(hLine);
        
        // Vertical line
        const vLine = new Rectangle('crosshairV');
        vLine.width = '2px';
        vLine.height = '20px';
        vLine.background = '#00cccc88';
        this.gui.addControl(vLine);
    }
    
    private createDamageOverlay(): void {
        this.damageOverlay = new Rectangle('damageOverlay');
        this.damageOverlay.width = '100%';
        this.damageOverlay.height = '100%';
        this.damageOverlay.background = '#ff000000';
        this.damageOverlay.thickness = 0;
        this.damageOverlay.isPointerBlocker = false;
        this.gui.addControl(this.damageOverlay);
    }
    
    private createWaveIndicator(): void {
        this.waveText = new TextBlock('waveText');
        this.waveText.text = '';
        this.waveText.color = 'white';
        this.waveText.fontSize = 36;
        this.waveText.fontFamily = 'Arial';
        this.waveText.alpha = 0;
        this.gui.addControl(this.waveText);
    }
    
    private setupEventListeners(): void {
        // Level events
        window.addEventListener('levelStart', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.setLevel(detail.level, detail.name);
        });
        
        // Wave events
        window.addEventListener('waveComplete', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.showWaveNotification(`WAVE ${detail.wave} COMPLETE`);
        });
        
        // Evidence events
        window.addEventListener('evidenceCollected', (e: Event) => {
            this.setEvidenceCollected(true);
        });
        
        // Damage events
        window.addEventListener('playerDamaged', () => {
            this.flashDamage();
        });
    }
    
    /**
     * Update health display
     */
    public setHealth(current: number, max: number): void {
        this.state.health = current;
        this.state.maxHealth = max;
        
        if (this.healthBar) {
            const percent = (current / max) * 100;
            this.healthBar.width = `${percent}%`;
            
            // Color based on health
            if (percent > 60) {
                this.healthBar.background = '#00cc00';
            } else if (percent > 30) {
                this.healthBar.background = '#cccc00';
            } else {
                this.healthBar.background = '#cc0000';
            }
        }
        
        if (this.healthText) {
            this.healthText.text = `${Math.ceil(current)}/${max}`;
        }
    }
    
    /**
     * Update ammo display
     */
    public setAmmo(current: number, max: number): void {
        this.state.ammo = current;
        this.state.maxAmmo = max;
        
        if (this.ammoText) {
            this.ammoText.text = `${current}/${max}`;
            this.ammoText.color = current === 0 ? '#ff0000' : 'white';
        }
    }
    
    /**
     * Update weapon display
     */
    public setWeapon(weapon: string): void {
        this.state.currentWeapon = weapon;
        
        if (this.weaponText) {
            this.weaponText.text = weapon.toUpperCase();
        }
    }
    
    /**
     * Update level display
     */
    public setLevel(levelId: number, name: string): void {
        this.state.levelName = name;
        
        if (this.levelText) {
            this.levelText.text = `LEVEL ${levelId}: ${name.toUpperCase()}`;
        }
    }
    
    /**
     * Update objective display
     */
    public setObjective(objective: string): void {
        this.state.objective = objective;
        
        if (this.objectiveText) {
            this.objectiveText.text = objective;
        }
    }
    
    /**
     * Update enemy count
     */
    public setEnemyCount(count: number): void {
        this.state.enemiesRemaining = count;
        
        if (this.enemyCountText) {
            this.enemyCountText.text = `Enemies: ${count}`;
            this.enemyCountText.color = count > 0 ? '#ff6666' : '#66ff66';
        }
    }
    
    /**
     * Update evidence indicator
     */
    public setEvidenceCollected(collected: boolean): void {
        this.state.evidenceCollected = collected;
        
        if (this.evidenceIcon) {
            this.evidenceIcon.background = collected ? '#00cc00' : '#333';
            this.evidenceIcon.color = collected ? '#00ff00' : '#666';
            
            const text = this.evidenceIcon.children[0] as TextBlock;
            if (text) {
                text.text = collected ? '✓' : '?';
                text.color = collected ? 'white' : '#666';
            }
        }
    }
    
    /**
     * Flash damage indicator
     */
    public flashDamage(): void {
        if (!this.damageOverlay) return;
        
        this.damageOverlay.background = '#ff000044';
        
        setTimeout(() => {
            if (this.damageOverlay) {
                this.damageOverlay.background = '#ff000000';
            }
        }, 200);
    }
    
    /**
     * Show wave notification
     */
    public showWaveNotification(text: string): void {
        if (!this.waveText) return;
        
        this.waveText.text = text;
        this.waveText.alpha = 1;
        
        // Fade out
        let alpha = 1;
        const fadeInterval = setInterval(() => {
            alpha -= 0.02;
            if (this.waveText) {
                this.waveText.alpha = alpha;
            }
            
            if (alpha <= 0) {
                clearInterval(fadeInterval);
            }
        }, 50);
    }
    
    /**
     * Show/hide HUD
     */
    public setVisible(visible: boolean): void {
        this.isVisible = visible;
        this.gui.rootContainer.isVisible = visible;
    }
    
    /**
     * Get current state
     */
    public getState(): HUDState {
        return { ...this.state };
    }
    
    /**
     * Dispose
     */
    public dispose(): void {
        this.gui.dispose();
    }
}

export default HUD;
