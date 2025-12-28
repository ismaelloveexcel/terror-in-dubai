import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, Button, StackPanel } from '@babylonjs/gui';
import { isMobile } from '../config/gameConfig';

/**
 * TutorialManager - Handles first-time player onboarding
 * 
 * Shows control hints and objectives on first play
 */
export class TutorialManager {
  private ui: AdvancedDynamicTexture;
  private currentStep: number = 0;
  private tutorialOverlay: Rectangle | null = null;
  private isFirstTime: boolean = false;
  private onComplete: (() => void) | null = null;

  private tutorialSteps = isMobile ? [
    {
      title: '👋 Welcome, Hero!',
      text: 'You are about to enter the corrupted Upside-Down Dubai.\nYour mission: Save Uncle Ismael!',
      highlight: null
    },
    {
      title: '🕹️ Movement',
      text: 'Use the LEFT JOYSTICK to move around.\nDrag anywhere on the left side of the screen.',
      highlight: 'left'
    },
    {
      title: '👀 Look Around',
      text: 'Drag on the RIGHT side of the screen to look around.',
      highlight: 'right'
    },
    {
      title: '🔫 Shooting',
      text: 'Tap the FIRE BUTTON (bottom right) to shoot enemies.',
      highlight: 'fire'
    },
    {
      title: '❤️ Health',
      text: 'Watch your health bar (top left).\nAvoid enemy attacks to stay alive!',
      highlight: 'health'
    },
    {
      title: '🎯 Objectives',
      text: 'Complete level objectives to progress.\nLook for hives, anchors, and bosses!',
      highlight: null
    },
    {
      title: '✨ Ready!',
      text: 'You\'re ready to save Ismael!\nGood luck, hero!',
      highlight: null
    }
  ] : [
    {
      title: '👋 Welcome, Hero!',
      text: 'You are about to enter the corrupted Upside-Down Dubai.\nYour mission: Save Uncle Ismael!',
      highlight: null
    },
    {
      title: '🕹️ Movement',
      text: 'Use W, A, S, D keys to move.\nHold SHIFT to sprint.',
      highlight: null
    },
    {
      title: '👀 Look Around',
      text: 'Move your mouse to look around.\nClick on the game to lock your cursor.',
      highlight: null
    },
    {
      title: '🔫 Shooting',
      text: 'LEFT CLICK to shoot enemies.\nAim for the head for maximum damage!',
      highlight: null
    },
    {
      title: '❤️ Health',
      text: 'Watch your health bar (top left).\nAvoid enemy attacks to stay alive!',
      highlight: 'health'
    },
    {
      title: '🎯 Objectives',
      text: 'Complete level objectives to progress.\nDestroy hives, signal anchors, and defeat the boss!',
      highlight: null
    },
    {
      title: '✨ Ready!',
      text: 'You\'re ready to save Ismael!\nGood luck, hero!',
      highlight: null
    }
  ];

  constructor() {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('Tutorial');
    this.checkFirstTime();
  }

  private checkFirstTime(): void {
    const hasPlayed = localStorage.getItem('hasPlayedBefore');
    this.isFirstTime = hasPlayed !== 'true';
  }

  shouldShowTutorial(): boolean {
    return this.isFirstTime;
  }

  markAsPlayed(): void {
    localStorage.setItem('hasPlayedBefore', 'true');
    this.isFirstTime = false;
  }

  startTutorial(onComplete: () => void): void {
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.showStep();
  }

  private showStep(): void {
    this.clearOverlay();

    if (this.currentStep >= this.tutorialSteps.length) {
      this.completeTutorial();
      return;
    }

    const step = this.tutorialSteps[this.currentStep];

    // Create overlay
    this.tutorialOverlay = new Rectangle('tutorialOverlay');
    this.tutorialOverlay.width = '100%';
    this.tutorialOverlay.height = '100%';
    this.tutorialOverlay.background = 'rgba(0, 0, 0, 0.85)';
    this.tutorialOverlay.thickness = 0;
    this.ui.addControl(this.tutorialOverlay);

    // Create content panel
    const panel = new Rectangle('tutorialPanel');
    panel.width = '450px';
    panel.height = '280px';
    panel.cornerRadius = 15;
    panel.color = '#ff4444';
    panel.thickness = 3;
    panel.background = 'rgba(20, 0, 0, 0.95)';
    panel.shadowColor = 'rgba(255, 68, 68, 0.5)';
    panel.shadowBlur = 20;
    this.tutorialOverlay.addControl(panel);

    // Title
    const title = new TextBlock('title', step.title);
    title.fontSize = 28;
    title.color = '#ff6666';
    title.top = -80;
    title.fontWeight = 'bold';
    panel.addControl(title);

    // Text
    const text = new TextBlock('text', step.text);
    text.fontSize = 18;
    text.color = 'white';
    text.textWrapping = true;
    text.lineSpacing = '5px';
    text.top = 0;
    panel.addControl(text);

    // Progress indicator
    const progress = new TextBlock('progress', `${this.currentStep + 1} / ${this.tutorialSteps.length}`);
    progress.fontSize = 14;
    progress.color = '#888';
    progress.top = 80;
    panel.addControl(progress);

    // Button container
    const btnContainer = new Rectangle('btnContainer');
    btnContainer.width = '100%';
    btnContainer.height = '50px';
    btnContainer.thickness = 0;
    btnContainer.top = 110;
    panel.addControl(btnContainer);

    // Skip button
    if (this.currentStep < this.tutorialSteps.length - 1) {
      const skipBtn = Button.CreateSimpleButton('skip', 'Skip Tutorial');
      skipBtn.width = '120px';
      skipBtn.height = '40px';
      skipBtn.color = '#888';
      skipBtn.background = '#333';
      skipBtn.cornerRadius = 5;
      skipBtn.fontSize = 14;
      skipBtn.left = -80;
      skipBtn.onPointerClickObservable.add(() => {
        this.completeTutorial();
      });
      btnContainer.addControl(skipBtn);
    }

    // Next/Start button
    const nextBtn = Button.CreateSimpleButton('next', 
      this.currentStep === this.tutorialSteps.length - 1 ? 'START GAME!' : 'Next →');
    nextBtn.width = '140px';
    nextBtn.height = '40px';
    nextBtn.color = 'white';
    nextBtn.background = '#ff4444';
    nextBtn.cornerRadius = 5;
    nextBtn.fontSize = 16;
    nextBtn.left = this.currentStep < this.tutorialSteps.length - 1 ? 80 : 0;
    nextBtn.onPointerClickObservable.add(() => {
      this.currentStep++;
      this.showStep();
    });
    btnContainer.addControl(nextBtn);

    // Highlight areas if specified
    this.showHighlight(step.highlight);
  }

  private showHighlight(area: string | null): void {
    if (!area || !this.tutorialOverlay) return;

    // Create highlight indicator
    const highlight = new Rectangle('highlight');
    highlight.width = '100px';
    highlight.height = '100px';
    highlight.cornerRadius = 50;
    highlight.color = '#ffff00';
    highlight.thickness = 3;
    highlight.background = 'rgba(255, 255, 0, 0.1)';

    switch (area) {
      case 'left':
        highlight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        highlight.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        highlight.left = 100;
        break;
      case 'right':
        highlight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        highlight.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        highlight.left = -100;
        break;
      case 'fire':
        highlight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        highlight.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        highlight.left = -80;
        highlight.top = -80;
        break;
      case 'health':
        highlight.width = '280px';
        highlight.height = '70px';
        highlight.cornerRadius = 10;
        highlight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        highlight.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        highlight.left = 10;
        highlight.top = 10;
        break;
    }

    this.tutorialOverlay.addControl(highlight);

    // Pulse animation
    let scale = 1;
    let growing = true;
    const animate = () => {
      if (!this.tutorialOverlay) return;
      
      if (growing) {
        scale += 0.01;
        if (scale >= 1.1) growing = false;
      } else {
        scale -= 0.01;
        if (scale <= 1) growing = true;
      }
      
      highlight.scaleX = scale;
      highlight.scaleY = scale;
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  private completeTutorial(): void {
    this.clearOverlay();
    this.markAsPlayed();
    
    if (this.onComplete) {
      this.onComplete();
    }
  }

  private clearOverlay(): void {
    if (this.tutorialOverlay) {
      this.ui.removeControl(this.tutorialOverlay);
      this.tutorialOverlay = null;
    }
  }

  resetTutorial(): void {
    localStorage.removeItem('hasPlayedBefore');
    this.isFirstTime = true;
  }

  dispose(): void {
    this.clearOverlay();
    this.ui.dispose();
  }
}
