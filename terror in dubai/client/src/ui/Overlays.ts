import { AdvancedDynamicTexture, Rectangle, TextBlock, Button, Control, StackPanel } from '@babylonjs/gui';
import { gameConfig, toggleFamilyMode, setRescueTarget } from '../config/gameConfig';
import { getPrologueText, getFinalMessage, getFinaleSequence, creditsText } from '../config/storyConfig';

export class Overlays {
  private ui: AdvancedDynamicTexture;
  private currentOverlay: Rectangle | null = null;

  constructor() {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('Overlays');
  }

  showMenu(onStart: () => void, onSettings: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const title = new TextBlock('title', gameConfig.familyMode ? 'SAVE ISMAEL' : 'SAVE [THEM]');
    title.fontSize = 48;
    title.color = '#ff4444';
    title.top = -150;
    bg.addControl(title);

    if (gameConfig.familyMode) {
      const subtitle = new TextBlock('subtitle', 'Private family build');
      subtitle.fontSize = 16;
      subtitle.color = '#888';
      subtitle.top = -100;
      bg.addControl(subtitle);
    }

    const startBtn = Button.CreateSimpleButton('start', 'START GAME');
    this.styleButton(startBtn);
    startBtn.top = 0;
    startBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onStart();
    });
    bg.addControl(startBtn);

    const settingsBtn = Button.CreateSimpleButton('settings', 'SETTINGS');
    this.styleButton(settingsBtn);
    settingsBtn.top = 80;
    settingsBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onSettings();
    });
    bg.addControl(settingsBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showSettings(onBack: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const title = new TextBlock('title', 'SETTINGS');
    title.fontSize = 32;
    title.color = 'white';
    title.top = -200;
    bg.addControl(title);

    // Toggle Family Mode
    const familyModeBtn = Button.CreateSimpleButton('familyMode', gameConfig.familyMode ? 'Mode: FAMILY' : 'Mode: PUBLIC');
    this.styleButton(familyModeBtn);
    familyModeBtn.top = -50;
    familyModeBtn.onPointerClickObservable.add(() => {
      toggleFamilyMode();
      this.showSettings(onBack);
    });
    bg.addControl(familyModeBtn);

    // Set rescue target (if not family mode)
    if (!gameConfig.familyMode) {
      const targetText = new TextBlock('targetLabel', 'Who will you save?');
      targetText.fontSize = 18;
      targetText.color = 'white';
      targetText.top = 30;
      bg.addControl(targetText);

      const targetInput = new TextBlock('targetValue', gameConfig.rescueTarget);
      targetInput.fontSize = 24;
      targetInput.color = '#ffaa00';
      targetInput.top = 70;
      bg.addControl(targetInput);

      const namePrompt = new TextBlock('nameHint', '(Enter name in console: setTarget("Name"))');
      namePrompt.fontSize = 12;
      namePrompt.color = '#666';
      namePrompt.top = 110;
      bg.addControl(namePrompt);
    }

    const backBtn = Button.CreateSimpleButton('back', 'BACK');
    this.styleButton(backBtn);
    backBtn.top = 180;
    backBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onBack();
    });
    bg.addControl(backBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);

    // Expose setTarget globally for easy name change
    (window as any).setTarget = (name: string) => {
      setRescueTarget(name);
      this.showSettings(onBack);
    };
  }

  showPrologue(onContinue: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const panel = new StackPanel();
    panel.spacing = 20;
    bg.addControl(panel);

    getPrologueText().forEach(line => {
      const text = new TextBlock('', line);
      text.fontSize = 20;
      text.color = 'white';
      text.height = '30px';
      text.textWrapping = true;
      panel.addControl(text);
    });

    const continueBtn = Button.CreateSimpleButton('continue', 'CONTINUE');
    this.styleButton(continueBtn);
    continueBtn.top = 200;
    continueBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onContinue();
    });
    bg.addControl(continueBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showLevelIntro(title: string, storyCard: string, onContinue: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const titleText = new TextBlock('levelTitle', title.toUpperCase());
    titleText.fontSize = 36;
    titleText.color = '#ff6666';
    titleText.top = -100;
    bg.addControl(titleText);

    const story = new TextBlock('story', storyCard);
    story.fontSize = 18;
    story.color = 'white';
    story.width = '600px';
    story.textWrapping = true;
    story.top = 0;
    bg.addControl(story);

    const continueBtn = Button.CreateSimpleButton('continue', 'CONTINUE');
    this.styleButton(continueBtn);
    continueBtn.top = 150;
    continueBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onContinue();
    });
    bg.addControl(continueBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showLevelComplete(onContinue: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const text = new TextBlock('complete', 'LEVEL CLEARED');
    text.fontSize = 42;
    text.color = '#00ff00';
    text.top = -50;
    bg.addControl(text);

    const continueBtn = Button.CreateSimpleButton('continue', 'CONTINUE');
    this.styleButton(continueBtn);
    continueBtn.top = 50;
    continueBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onContinue();
    });
    bg.addControl(continueBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showGameOver(onRestart: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const text = new TextBlock('gameOver', 'GAME OVER');
    text.fontSize = 48;
    text.color = '#ff0000';
    text.top = -50;
    bg.addControl(text);

    const restartBtn = Button.CreateSimpleButton('restart', 'RESTART LEVEL');
    this.styleButton(restartBtn);
    restartBtn.top = 50;
    restartBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onRestart();
    });
    bg.addControl(restartBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showFinale(onContinue: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const panel = new StackPanel();
    panel.spacing = 25;
    bg.addControl(panel);

    getFinaleSequence().forEach(line => {
      const text = new TextBlock('', line);
      text.fontSize = 18;
      text.color = 'white';
      text.height = '25px';
      text.textWrapping = true;
      panel.addControl(text);
    });

    const continueBtn = Button.CreateSimpleButton('continue', 'CONTINUE');
    this.styleButton(continueBtn);
    continueBtn.top = 220;
    continueBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onContinue();
    });
    bg.addControl(continueBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showCredits(onFinish: () => void): void {
    this.clear();

    const bg = this.createBackground();

    const panel = new StackPanel();
    panel.spacing = 15;
    bg.addControl(panel);

    creditsText.forEach(line => {
      const text = new TextBlock('', line);
      text.fontSize = line === '' ? 10 : (line.length < 20 ? 24 : 16);
      text.color = line.includes(gameConfig.nephewName) ? '#ffaa00' : 'white';
      text.height = '20px';
      panel.addControl(text);
    });

    const finishBtn = Button.CreateSimpleButton('finish', 'MAIN MENU');
    this.styleButton(finishBtn);
    finishBtn.top = 250;
    finishBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      onFinish();
    });
    bg.addControl(finishBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
  }

  showIsmaelMessage(message: string, duration: number = 3000): void {
    const box = new Rectangle('ismaelBox');
    box.width = '500px';
    box.height = '80px';
    box.cornerRadius = 10;
    box.color = 'white';
    box.thickness = 2;
    box.background = 'rgba(0, 0, 0, 0.8)';
    box.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    box.top = 80;
    this.ui.addControl(box);

    const text = new TextBlock('ismaelText', message);
    text.fontSize = 16;
    text.color = '#ffaa00';
    text.textWrapping = true;
    box.addControl(text);

    setTimeout(() => {
      this.ui.removeControl(box);
    }, duration);
  }

  showLightsWall(text: string, duration: number = 2000): void {
    const wall = new Rectangle('lightsWall');
    wall.width = '100%';
    wall.height = '100%';
    wall.background = 'rgba(0, 0, 0, 0.9)';
    this.ui.addControl(wall);

    const letters = new TextBlock('letters', text);
    letters.fontSize = 60;
    letters.color = '#ff0000';
    letters.fontStyle = 'bold';
    wall.addControl(letters);

    // Flicker effect
    let visible = true;
    const flickerInterval = setInterval(() => {
      visible = !visible;
      letters.alpha = visible ? 1 : 0.3;
    }, 100);

    setTimeout(() => {
      clearInterval(flickerInterval);
      this.ui.removeControl(wall);
    }, duration);
  }

  private createBackground(): Rectangle {
    const bg = new Rectangle('overlayBg');
    bg.width = '100%';
    bg.height = '100%';
    bg.background = 'rgba(0, 0, 0, 0.95)';
    bg.thickness = 0;
    return bg;
  }

  private styleButton(button: Button): void {
    button.width = '250px';
    button.height = '50px';
    button.color = 'white';
    button.background = '#333';
    button.cornerRadius = 5;
    button.thickness = 2;
    button.fontSize = 18;

    button.onPointerEnterObservable.add(() => {
      button.background = '#666';
    });

    button.onPointerOutObservable.add(() => {
      button.background = '#333';
    });
  }

  private playButtonSound(): void {
    // Placeholder for sound effect
  }

  clear(): void {
    if (this.currentOverlay) {
      this.ui.removeControl(this.currentOverlay);
      this.currentOverlay = null;
    }
  }

  dispose(): void {
    this.ui.dispose();
  }
}
