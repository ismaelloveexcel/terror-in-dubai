/**
 * SAVE ISMAEL - Main Menu
 * Title screen with start game, continue, options
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle, Button, Control, StackPanel, Image } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';

export interface MainMenuCallbacks {
    onNewGame: () => void;
    onContinue: () => void;
    onOptions?: () => void;
    onCredits?: () => void;
    onSettings?: () => void;  // Alias for onOptions
}

export class MainMenu {
    private scene: Scene;
    private gui: AdvancedDynamicTexture;
    private callbacks: MainMenuCallbacks;
    private isVisible: boolean = false;
    
    // UI Elements
    private container: Rectangle | null = null;
    private titleText: TextBlock | null = null;
    private subtitleText: TextBlock | null = null;
    private buttonPanel: StackPanel | null = null;
    private newGameBtn: Button | null = null;
    private continueBtn: Button | null = null;
    private optionsBtn: Button | null = null;
    private creditsBtn: Button | null = null;
    private dedicationText: TextBlock | null = null;
    
    // Animation
    private animationTime: number = 0;
    
    constructor(scene: Scene, callbacks: MainMenuCallbacks) {
        this.scene = scene;
        this.callbacks = callbacks;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI('MainMenu', true, scene);
        this.createMenu();
    }
    
    private createMenu(): void {
        // Background container
        this.container = new Rectangle('menuContainer');
        this.container.width = '100%';
        this.container.height = '100%';
        this.container.background = '#000000';
        this.container.thickness = 0;
        this.container.isVisible = false;
        this.gui.addControl(this.container);
        
        // Atmospheric background gradient
        const gradient = new Rectangle('gradient');
        gradient.width = '100%';
        gradient.height = '100%';
        gradient.background = 'linear-gradient(180deg, #0a0a12 0%, #1a0a1a 50%, #0a0a12 100%)';
        gradient.thickness = 0;
        this.container.addControl(gradient);
        
        // Title
        this.titleText = new TextBlock('title');
        this.titleText.text = 'SAVE ISMAEL';
        this.titleText.color = '#cc0000';
        this.titleText.fontSize = 72;
        this.titleText.fontFamily = 'Arial Black, Arial';
        this.titleText.fontWeight = 'bold';
        this.titleText.top = '-200px';
        this.titleText.shadowColor = '#ff0000';
        this.titleText.shadowBlur = 20;
        this.container.addControl(this.titleText);
        
        // Subtitle
        this.subtitleText = new TextBlock('subtitle');
        this.subtitleText.text = 'An Upside Down Dubai Adventure';
        this.subtitleText.color = '#00cccc';
        this.subtitleText.fontSize = 24;
        this.subtitleText.fontFamily = 'Arial';
        this.subtitleText.top = '-130px';
        this.container.addControl(this.subtitleText);
        
        // Button panel
        this.buttonPanel = new StackPanel('buttonPanel');
        this.buttonPanel.width = '300px';
        this.buttonPanel.top = '50px';
        this.container.addControl(this.buttonPanel);
        
        // New Game button
        this.newGameBtn = this.createMenuButton('NEW GAME', '#00cccc');
        this.newGameBtn.onPointerClickObservable.add(() => {
            this.callbacks.onNewGame();
        });
        this.buttonPanel.addControl(this.newGameBtn);
        
        // Continue button
        this.continueBtn = this.createMenuButton('CONTINUE', '#666666');
        this.continueBtn.onPointerClickObservable.add(() => {
            this.callbacks.onContinue();
        });
        this.buttonPanel.addControl(this.continueBtn);
        
        // Options button
        this.optionsBtn = this.createMenuButton('OPTIONS', '#666666');
        this.optionsBtn.onPointerClickObservable.add(() => {
            const callback = this.callbacks.onOptions || this.callbacks.onSettings;
            if (callback) callback();
        });
        this.buttonPanel.addControl(this.optionsBtn);
        
        // Credits button
        this.creditsBtn = this.createMenuButton('CREDITS', '#666666');
        this.creditsBtn.onPointerClickObservable.add(() => {
            if (this.callbacks.onCredits) this.callbacks.onCredits();
        });
        this.buttonPanel.addControl(this.creditsBtn);
        
        // Dedication text
        this.dedicationText = new TextBlock('dedication');
        this.dedicationText.text = 'For Aidan\nFrom Uncle Ismael';
        this.dedicationText.color = '#666666';
        this.dedicationText.fontSize = 16;
        this.dedicationText.fontFamily = 'Arial';
        this.dedicationText.fontStyle = 'italic';
        this.dedicationText.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.dedicationText.top = '-30px';
        this.container.addControl(this.dedicationText);
        
        // Version text
        const versionText = new TextBlock('version');
        versionText.text = 'v1.0.0';
        versionText.color = '#333333';
        versionText.fontSize = 12;
        versionText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        versionText.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        versionText.left = '-20px';
        versionText.top = '-10px';
        this.container.addControl(versionText);
        
        // Particles effect
        this.createParticleEffect();
    }
    
    private createMenuButton(text: string, color: string): Button {
        const button = Button.CreateSimpleButton(`btn_${text}`, text);
        button.width = '280px';
        button.height = '50px';
        button.color = color;
        button.background = '#111111';
        button.thickness = 2;
        button.cornerRadius = 5;
        button.paddingTop = '10px';
        button.paddingBottom = '10px';
        
        // Hover effects
        button.onPointerEnterObservable.add(() => {
            button.background = '#222222';
            button.color = '#ffffff';
            button.thickness = 3;
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = '#111111';
            button.color = color;
            button.thickness = 2;
        });
        
        return button;
    }
    
    private createParticleEffect(): void {
        if (!this.container) return;
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = new Rectangle(`particle_${i}`);
            particle.width = '4px';
            particle.height = '4px';
            particle.background = '#cc000033';
            particle.cornerRadius = 2;
            particle.thickness = 0;
            
            // Random starting position
            particle.left = `${(Math.random() - 0.5) * 100}%`;
            particle.top = `${Math.random() * 100}%`;
            
            this.container.addControl(particle);
            
            // Animate
            const speed = 0.2 + Math.random() * 0.3;
            const startTop = parseFloat(particle.top as string);
            
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.isVisible && particle.top) {
                    let top = parseFloat(particle.top as string) - speed;
                    if (top < -10) {
                        top = 110;
                        particle.left = `${(Math.random() - 0.5) * 100}%`;
                    }
                    particle.top = `${top}%`;
                }
            });
        }
    }
    
    /**
     * Show the menu
     */
    public show(): void {
        if (this.container) {
            this.container.isVisible = true;
            this.isVisible = true;
            
            // Fade in
            this.container.alpha = 0;
            const fadeIn = setInterval(() => {
                if (this.container) {
                    this.container.alpha += 0.05;
                    if (this.container.alpha >= 1) {
                        clearInterval(fadeIn);
                    }
                }
            }, 30);
        }
        
        // Animate title
        this.animateTitle();
    }
    
    /**
     * Hide the menu
     */
    public hide(): void {
        if (this.container) {
            // Fade out
            const fadeOut = setInterval(() => {
                if (this.container) {
                    this.container.alpha -= 0.1;
                    if (this.container.alpha <= 0) {
                        clearInterval(fadeOut);
                        this.container.isVisible = false;
                        this.isVisible = false;
                    }
                }
            }, 30);
        }
    }
    
    /**
     * Animate title text
     */
    private animateTitle(): void {
        if (!this.titleText) return;
        
        // Pulse effect
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isVisible && this.titleText) {
                this.animationTime += 0.02;
                const glow = 10 + Math.sin(this.animationTime) * 10;
                this.titleText.shadowBlur = glow;
            }
        });
    }
    
    /**
     * Enable/disable continue button
     */
    public setContinueEnabled(enabled: boolean): void {
        if (this.continueBtn) {
            this.continueBtn.isEnabled = enabled;
            this.continueBtn.color = enabled ? '#00cccc' : '#333333';
        }
    }
    
    /**
     * Set dedication text
     */
    public setDedication(text: string): void {
        if (this.dedicationText) {
            this.dedicationText.text = text;
        }
    }
    
    /**
     * Check if visible
     */
    public getIsVisible(): boolean {
        return this.isVisible;
    }
    
    /**
     * Dispose
     */
    public dispose(): void {
        this.gui.dispose();
    }
}

export default MainMenu;
