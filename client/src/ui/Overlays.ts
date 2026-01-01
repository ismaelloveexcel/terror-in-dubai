import { AdvancedDynamicTexture, Rectangle, TextBlock, Button, Control, StackPanel, Slider } from '@babylonjs/gui';
import { gameConfig, toggleFamilyMode, setRescueTarget, settings, updateSetting, saveSettings } from '../config/gameConfig';
import { getPrologueText, getFinaleSequence, creditsText } from '../config/storyConfig';

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
    title.top = -250;
    bg.addControl(title);

    // Create scrollable panel for settings
    const panel = new StackPanel();
    panel.spacing = 15;
    panel.top = -50;
    panel.width = '400px';
    bg.addControl(panel);

    // === AUDIO SECTION ===
    this.addSectionHeader(panel, '🔊 AUDIO');
    
    // Master Volume
    this.addSliderSetting(panel, 'Master Volume', settings.masterVolume, (value) => {
      updateSetting('masterVolume', value);
    });
    
    // Music Volume
    this.addSliderSetting(panel, 'Music', settings.musicVolume, (value) => {
      updateSetting('musicVolume', value);
    });
    
    // SFX Volume
    this.addSliderSetting(panel, 'Sound Effects', settings.sfxVolume, (value) => {
      updateSetting('sfxVolume', value);
    });

    // === GRAPHICS SECTION ===
    this.addSectionHeader(panel, '🎮 GRAPHICS');
    
    // Quality preset
    const qualityBtn = Button.CreateSimpleButton('quality', `Quality: ${settings.graphicsQuality.toUpperCase()}`);
    this.styleSmallButton(qualityBtn);
    qualityBtn.onPointerClickObservable.add(() => {
      const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const idx = qualities.indexOf(settings.graphicsQuality);
      updateSetting('graphicsQuality', qualities[(idx + 1) % 3]);
      this.showSettings(onBack);
    });
    panel.addControl(qualityBtn);

    // Post-processing toggle
    const ppBtn = Button.CreateSimpleButton('pp', `Post-Processing: ${settings.postProcessing ? 'ON' : 'OFF'}`);
    this.styleSmallButton(ppBtn);
    ppBtn.onPointerClickObservable.add(() => {
      updateSetting('postProcessing', !settings.postProcessing);
      this.showSettings(onBack);
    });
    panel.addControl(ppBtn);

    // Particles toggle
    const particlesBtn = Button.CreateSimpleButton('particles', `Particles: ${settings.particles ? 'ON' : 'OFF'}`);
    this.styleSmallButton(particlesBtn);
    particlesBtn.onPointerClickObservable.add(() => {
      updateSetting('particles', !settings.particles);
      this.showSettings(onBack);
    });
    panel.addControl(particlesBtn);

    // === CONTROLS SECTION ===
    this.addSectionHeader(panel, '🎯 CONTROLS');
    
    // Sensitivity slider
    this.addSliderSetting(panel, 'Sensitivity', settings.sensitivity, (value) => {
      updateSetting('sensitivity', value);
    }, 0.1, 2.0);

    // Invert Y toggle
    const invertBtn = Button.CreateSimpleButton('invert', `Invert Y-Axis: ${settings.invertY ? 'ON' : 'OFF'}`);
    this.styleSmallButton(invertBtn);
    invertBtn.onPointerClickObservable.add(() => {
      updateSetting('invertY', !settings.invertY);
      this.showSettings(onBack);
    });
    panel.addControl(invertBtn);

    // === DIFFICULTY SECTION ===
    this.addSectionHeader(panel, '⚔️ DIFFICULTY');
    
    const diffBtn = Button.CreateSimpleButton('diff', `Difficulty: ${settings.difficulty.toUpperCase()}`);
    this.styleSmallButton(diffBtn);
    diffBtn.onPointerClickObservable.add(() => {
      const diffs: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
      const idx = diffs.indexOf(settings.difficulty);
      updateSetting('difficulty', diffs[(idx + 1) % 3]);
      this.showSettings(onBack);
    });
    panel.addControl(diffBtn);

    // === GAME MODE ===
    this.addSectionHeader(panel, '👥 GAME MODE');

    // Toggle Family Mode
    const familyModeBtn = Button.CreateSimpleButton('familyMode', gameConfig.familyMode ? 'Mode: FAMILY' : 'Mode: PUBLIC');
    this.styleSmallButton(familyModeBtn);
    familyModeBtn.onPointerClickObservable.add(() => {
      toggleFamilyMode();
      this.showSettings(onBack);
    });
    panel.addControl(familyModeBtn);

    // Set rescue target (if not family mode)
    if (!gameConfig.familyMode) {
      const targetText = new TextBlock('targetLabel', `Rescuing: ${gameConfig.rescueTarget}`);
      targetText.fontSize = 14;
      targetText.color = '#ffaa00';
      targetText.height = '25px';
      panel.addControl(targetText);
    }

    // === ACCESSIBILITY ===
    this.addSectionHeader(panel, '♿ ACCESSIBILITY');

    const fpsBtn = Button.CreateSimpleButton('fps', `Show FPS: ${settings.showFPS ? 'ON' : 'OFF'}`);
    this.styleSmallButton(fpsBtn);
    fpsBtn.onPointerClickObservable.add(() => {
      updateSetting('showFPS', !settings.showFPS);
      this.showSettings(onBack);
    });
    panel.addControl(fpsBtn);

    const motionBtn = Button.CreateSimpleButton('motion', `Reduced Motion: ${settings.reducedMotion ? 'ON' : 'OFF'}`);
    this.styleSmallButton(motionBtn);
    motionBtn.onPointerClickObservable.add(() => {
      updateSetting('reducedMotion', !settings.reducedMotion);
      this.showSettings(onBack);
    });
    panel.addControl(motionBtn);

    // Back button
    const backBtn = Button.CreateSimpleButton('back', 'BACK');
    this.styleButton(backBtn);
    backBtn.top = 280;
    backBtn.onPointerClickObservable.add(() => {
      this.playButtonSound();
      saveSettings();
      onBack();
    });
    bg.addControl(backBtn);

    this.currentOverlay = bg;
    this.ui.addControl(bg);
    // Note: setRescueTarget is available from gameConfig for programmatic name changes
  }

  private addSectionHeader(panel: StackPanel, text: string): void {
    const header = new TextBlock('header', text);
    header.fontSize = 16;
    header.color = '#ff6666';
    header.height = '25px';
    header.paddingTop = '10px';
    panel.addControl(header);
  }

  private addSliderSetting(
    panel: StackPanel, 
    label: string, 
    value: number, 
    onChange: (value: number) => void,
    min: number = 0,
    max: number = 1
  ): void {
    const container = new Rectangle('sliderContainer');
    container.width = '100%';
    container.height = '40px';
    container.thickness = 0;
    container.background = 'transparent';
    panel.addControl(container);

    const labelText = new TextBlock('label', label);
    labelText.fontSize = 14;
    labelText.color = 'white';
    labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    labelText.left = 10;
    container.addControl(labelText);

    const valueText = new TextBlock('value', `${Math.round(value * 100)}%`);
    valueText.fontSize = 14;
    valueText.color = '#ffaa00';
    valueText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    valueText.left = -10;
    container.addControl(valueText);

    const slider = new Slider('slider');
    slider.minimum = min;
    slider.maximum = max;
    slider.value = value;
    slider.height = '20px';
    slider.width = '150px';
    slider.color = '#ff4444';
    slider.background = '#333';
    slider.thumbColor = '#ff6666';
    slider.left = 60;
    slider.onValueChangedObservable.add((val) => {
      valueText.text = `${Math.round(val * 100)}%`;
      onChange(val);
    });
    container.addControl(slider);
  }

  private styleSmallButton(button: Button): void {
    button.width = '100%';
    button.height = '35px';
    button.color = 'white';
    button.background = '#444';
    button.cornerRadius = 5;
    button.thickness = 1;
    button.fontSize = 14;

    button.onPointerEnterObservable.add(() => {
      button.background = '#666';
    });

    button.onPointerOutObservable.add(() => {
      button.background = '#444';
    });
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
