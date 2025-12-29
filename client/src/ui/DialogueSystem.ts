/**
 * SAVE ISMAEL - Dialogue System
 * Handles dialogue boxes, boss dialogue, and Mammoo's messages
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle, Control, StackPanel } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';

export interface DialogueEntry {
    speaker: string;
    text: string;
    important?: boolean;
    duration?: number;
    isVoiceNote?: boolean;
}

export class DialogueSystem {
    private scene: Scene;
    private gui: AdvancedDynamicTexture;
    
    // UI Elements
    private dialogueBox: Rectangle | null = null;
    private speakerText: TextBlock | null = null;
    private dialogueText: TextBlock | null = null;
    private voiceNoteIcon: Rectangle | null = null;
    private bossDialogueBox: Rectangle | null = null;
    private bossText: TextBlock | null = null;
    
    // Queue
    private dialogueQueue: DialogueEntry[] = [];
    private isShowingDialogue: boolean = false;
    private currentTimeout: any = null;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI('DialogueUI', true, scene);
        this.createDialogueElements();
        this.setupEventListeners();
    }
    
    private createDialogueElements(): void {
        // Main dialogue box
        this.dialogueBox = new Rectangle('dialogueBox');
        this.dialogueBox.width = '600px';
        this.dialogueBox.height = '120px';
        this.dialogueBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.dialogueBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.dialogueBox.top = '-100px';
        this.dialogueBox.background = '#111111ee';
        this.dialogueBox.thickness = 2;
        this.dialogueBox.color = '#00cccc';
        this.dialogueBox.cornerRadius = 10;
        this.dialogueBox.isVisible = false;
        this.gui.addControl(this.dialogueBox);
        
        // Speaker name
        this.speakerText = new TextBlock('speakerText');
        this.speakerText.text = 'MAMMOO ISMAEL';
        this.speakerText.color = '#00cccc';
        this.speakerText.fontSize = 16;
        this.speakerText.fontFamily = 'Arial';
        this.speakerText.fontWeight = 'bold';
        this.speakerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.speakerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.speakerText.left = '15px';
        this.speakerText.top = '10px';
        this.dialogueBox.addControl(this.speakerText);
        
        // Dialogue text
        this.dialogueText = new TextBlock('dialogueText');
        this.dialogueText.text = '';
        this.dialogueText.color = 'white';
        this.dialogueText.fontSize = 14;
        this.dialogueText.fontFamily = 'Arial';
        this.dialogueText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.dialogueText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.dialogueText.textWrapping = true;
        this.dialogueText.left = '15px';
        this.dialogueText.top = '35px';
        this.dialogueText.width = '570px';
        this.dialogueText.height = '70px';
        this.dialogueBox.addControl(this.dialogueText);
        
        // Voice note icon
        this.voiceNoteIcon = new Rectangle('voiceNoteIcon');
        this.voiceNoteIcon.width = '25px';
        this.voiceNoteIcon.height = '25px';
        this.voiceNoteIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.voiceNoteIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.voiceNoteIcon.left = '-10px';
        this.voiceNoteIcon.top = '8px';
        this.voiceNoteIcon.background = '#cc0000';
        this.voiceNoteIcon.cornerRadius = 12;
        this.voiceNoteIcon.isVisible = false;
        this.dialogueBox.addControl(this.voiceNoteIcon);
        
        const iconText = new TextBlock('iconText');
        iconText.text = '🎤';
        iconText.fontSize = 14;
        this.voiceNoteIcon.addControl(iconText);
        
        // Boss dialogue (center screen)
        this.bossDialogueBox = new Rectangle('bossDialogueBox');
        this.bossDialogueBox.width = '700px';
        this.bossDialogueBox.height = '100px';
        this.bossDialogueBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bossDialogueBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.bossDialogueBox.top = '-150px';
        this.bossDialogueBox.background = '#220022dd';
        this.bossDialogueBox.thickness = 3;
        this.bossDialogueBox.color = '#cc0066';
        this.bossDialogueBox.cornerRadius = 5;
        this.bossDialogueBox.isVisible = false;
        this.gui.addControl(this.bossDialogueBox);
        
        this.bossText = new TextBlock('bossText');
        this.bossText.text = '';
        this.bossText.color = '#ff0066';
        this.bossText.fontSize = 22;
        this.bossText.fontFamily = 'Arial';
        this.bossText.fontWeight = 'bold';
        this.bossText.textWrapping = true;
        this.bossDialogueBox.addControl(this.bossText);
    }
    
    private setupEventListeners(): void {
        // Mammoo messages
        window.addEventListener('mammooMessage', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.queueDialogue({
                speaker: 'MAMMOO ISMAEL',
                text: detail.message,
                isVoiceNote: detail.isVoiceNote || false,
                duration: 8000
            });
        });
        
        // Boss dialogue
        window.addEventListener('bossDialogue', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.showBossDialogue(detail.speaker, detail.text, detail.important);
        });
        
        // Story events
        window.addEventListener('storyEvent', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.voiceLine) {
                this.queueDialogue({
                    speaker: 'UNCLE ISMAEL',
                    text: detail.voiceLine,
                    isVoiceNote: true,
                    duration: 6000
                });
            }
        });
        
        // Uncle hostage
        window.addEventListener('uncleHostage', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.message) {
                this.queueDialogue({
                    speaker: 'UNCLE ISMAEL',
                    text: detail.message,
                    important: true,
                    duration: 5000
                });
            }
        });
        
        // Uncle freed
        window.addEventListener('uncleFreed', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            this.queueDialogue({
                speaker: 'UNCLE ISMAEL',
                text: detail.message,
                important: true,
                duration: 4000
            });
        });
    }
    
    /**
     * Queue a dialogue entry
     */
    public queueDialogue(entry: DialogueEntry): void {
        this.dialogueQueue.push(entry);
        
        if (!this.isShowingDialogue) {
            this.showNextDialogue();
        }
    }
    
    /**
     * Show next dialogue in queue
     */
    private showNextDialogue(): void {
        if (this.dialogueQueue.length === 0) {
            this.isShowingDialogue = false;
            return;
        }
        
        this.isShowingDialogue = true;
        const entry = this.dialogueQueue.shift()!;
        
        this.showDialogue(entry);
    }
    
    /**
     * Show dialogue entry
     */
    private showDialogue(entry: DialogueEntry): void {
        if (!this.dialogueBox || !this.speakerText || !this.dialogueText || !this.voiceNoteIcon) {
            return;
        }
        
        // Set speaker
        this.speakerText.text = entry.speaker;
        
        // Color based on speaker
        if (entry.speaker.includes('ISMAEL') || entry.speaker.includes('MAMMOO')) {
            this.speakerText.color = '#00cccc';
            this.dialogueBox.color = '#00cccc';
        } else {
            this.speakerText.color = '#ffcc00';
            this.dialogueBox.color = '#ffcc00';
        }
        
        // Voice note indicator
        this.voiceNoteIcon.isVisible = entry.isVoiceNote || false;
        
        // Typewriter effect
        this.typewriterText(entry.text, entry.duration || 5000);
        
        // Show box
        this.dialogueBox.isVisible = true;
    }
    
    /**
     * Typewriter text effect
     */
    private typewriterText(fullText: string, duration: number): void {
        if (!this.dialogueText || !this.dialogueBox) return;
        
        let currentIndex = 0;
        const charsPerTick = 2;
        const tickInterval = 30;
        
        this.dialogueText.text = '';
        
        const typeInterval = setInterval(() => {
            if (!this.dialogueText) {
                clearInterval(typeInterval);
                return;
            }
            
            currentIndex += charsPerTick;
            this.dialogueText.text = fullText.substring(0, currentIndex);
            
            if (currentIndex >= fullText.length) {
                clearInterval(typeInterval);
                
                // Auto-hide after duration
                this.currentTimeout = setTimeout(() => {
                    this.hideDialogue();
                }, duration - (fullText.length * tickInterval / charsPerTick));
            }
        }, tickInterval);
    }
    
    /**
     * Hide dialogue box
     */
    private hideDialogue(): void {
        if (this.dialogueBox) {
            this.dialogueBox.isVisible = false;
        }
        
        // Show next in queue
        setTimeout(() => {
            this.showNextDialogue();
        }, 500);
    }
    
    /**
     * Show boss dialogue (center screen, dramatic)
     */
    public showBossDialogue(speaker: string, text: string, important: boolean = false): void {
        if (!this.bossDialogueBox || !this.bossText) return;
        
        // Clear any existing timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        
        this.bossText.text = `${speaker}: "${text}"`;
        
        // Color based on boss
        if (speaker === 'VECNA') {
            this.bossText.color = '#ff0066';
            this.bossDialogueBox.color = '#cc0066';
            this.bossDialogueBox.background = '#220022dd';
        } else if (speaker === 'Mind Flayer' || speaker === 'MIND FLAYER') {
            this.bossText.color = '#9933ff';
            this.bossDialogueBox.color = '#6600cc';
            this.bossDialogueBox.background = '#110022dd';
        } else {
            this.bossText.color = '#ff3333';
            this.bossDialogueBox.color = '#cc0000';
            this.bossDialogueBox.background = '#220000dd';
        }
        
        // Size based on importance
        this.bossText.fontSize = important ? 26 : 22;
        
        this.bossDialogueBox.isVisible = true;
        
        // Animate in
        let alpha = 0;
        const fadeIn = setInterval(() => {
            alpha += 0.1;
            if (this.bossDialogueBox) {
                this.bossDialogueBox.alpha = alpha;
            }
            if (alpha >= 1) {
                clearInterval(fadeIn);
            }
        }, 30);
        
        // Auto-hide
        const duration = important ? 6000 : 4000;
        this.currentTimeout = setTimeout(() => {
            this.hideBossDialogue();
        }, duration);
    }
    
    /**
     * Hide boss dialogue
     */
    private hideBossDialogue(): void {
        if (!this.bossDialogueBox) return;
        
        let alpha = 1;
        const fadeOut = setInterval(() => {
            alpha -= 0.1;
            if (this.bossDialogueBox) {
                this.bossDialogueBox.alpha = alpha;
            }
            if (alpha <= 0) {
                clearInterval(fadeOut);
                if (this.bossDialogueBox) {
                    this.bossDialogueBox.isVisible = false;
                    this.bossDialogueBox.alpha = 1;
                }
            }
        }, 30);
    }
    
    /**
     * Show lights wall message
     */
    public showLightsWallMessage(message: string): void {
        // Create temporary dramatic text
        const wallMessage = new TextBlock('wallMessage');
        wallMessage.text = message;
        wallMessage.color = '#ffcc00';
        wallMessage.fontSize = 72;
        wallMessage.fontFamily = 'Arial';
        wallMessage.fontWeight = 'bold';
        wallMessage.alpha = 0;
        this.gui.addControl(wallMessage);
        
        // Flicker effect
        let flickerCount = 0;
        const flickerInterval = setInterval(() => {
            wallMessage.alpha = Math.random() > 0.3 ? 0.8 : 0.2;
            flickerCount++;
            
            if (flickerCount > 30) {
                clearInterval(flickerInterval);
                
                // Fade out
                let alpha = 0.8;
                const fadeOut = setInterval(() => {
                    alpha -= 0.02;
                    wallMessage.alpha = alpha;
                    
                    if (alpha <= 0) {
                        clearInterval(fadeOut);
                        wallMessage.dispose();
                    }
                }, 50);
            }
        }, 100);
    }
    
    /**
     * Clear all dialogue
     */
    public clearAll(): void {
        this.dialogueQueue = [];
        this.isShowingDialogue = false;
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        
        if (this.dialogueBox) {
            this.dialogueBox.isVisible = false;
        }
        
        if (this.bossDialogueBox) {
            this.bossDialogueBox.isVisible = false;
        }
    }
    
    /**
     * Dispose
     */
    public dispose(): void {
        this.clearAll();
        this.gui.dispose();
    }
}

export default DialogueSystem;
