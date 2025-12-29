import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from '@babylonjs/gui';
import { PlayerController } from '../player/PlayerController';

export class HUD {
  private ui: AdvancedDynamicTexture;
  private healthBar!: Rectangle;
  private healthBarGlow!: Rectangle;
  private healthText!: TextBlock;
  private damageFlash!: Rectangle;
  private ammoText!: TextBlock;
  private objectiveText!: TextBlock;
  private lowHealthPulse: number = 0;

  constructor() {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('HUD');
    this.createHealthBar();
    this.createAmmoDisplay();
    this.createObjectiveDisplay();
    this.createDamageFlash();
    this.createVignetteOverlay();
  }

  private createHealthBar(): void {
    // Outer container with glow effect
    const outerGlow = new Rectangle('healthGlow');
    outerGlow.width = '270px';
    outerGlow.height = '60px';
    outerGlow.cornerRadius = 12;
    outerGlow.color = 'transparent';
    outerGlow.thickness = 0;
    outerGlow.background = 'rgba(255, 50, 50, 0.15)';
    outerGlow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    outerGlow.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    outerGlow.left = 15;
    outerGlow.top = 15;
    outerGlow.shadowColor = 'rgba(255, 0, 0, 0.5)';
    outerGlow.shadowBlur = 15;
    this.ui.addControl(outerGlow);

    // Main container
    const container = new Rectangle('healthContainer');
    container.width = '260px';
    container.height = '50px';
    container.cornerRadius = 10;
    container.color = '#ff4444';
    container.thickness = 2;
    container.background = 'rgba(0, 0, 0, 0.85)';
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.left = 20;
    container.top = 20;
    this.ui.addControl(container);

    // Health icon
    const healthIcon = new TextBlock('healthIcon', '❤️');
    healthIcon.fontSize = 20;
    healthIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    healthIcon.left = 8;
    container.addControl(healthIcon);

    // Health bar background
    const barBg = new Rectangle('healthBarBg');
    barBg.width = '180px';
    barBg.height = '24px';
    barBg.cornerRadius = 6;
    barBg.color = 'transparent';
    barBg.thickness = 0;
    barBg.background = 'rgba(50, 50, 50, 0.8)';
    barBg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.left = 35;
    container.addControl(barBg);

    // Health bar glow (behind the main bar)
    this.healthBarGlow = new Rectangle('healthBarGlow');
    this.healthBarGlow.width = '180px';
    this.healthBarGlow.height = '24px';
    this.healthBarGlow.cornerRadius = 6;
    this.healthBarGlow.color = 'transparent';
    this.healthBarGlow.thickness = 0;
    this.healthBarGlow.background = 'rgba(0, 255, 100, 0.3)';
    this.healthBarGlow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.healthBarGlow.left = 35;
    this.healthBarGlow.shadowColor = 'rgba(0, 255, 100, 0.5)';
    this.healthBarGlow.shadowBlur = 10;
    container.addControl(this.healthBarGlow);

    // Health bar fill with gradient effect
    this.healthBar = new Rectangle('healthBar');
    this.healthBar.width = '180px';
    this.healthBar.height = '20px';
    this.healthBar.cornerRadius = 5;
    this.healthBar.color = 'transparent';
    this.healthBar.thickness = 0;
    this.healthBar.background = '#00cc44';
    this.healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.healthBar.left = 37;
    container.addControl(this.healthBar);

    // Health text
    this.healthText = new TextBlock('healthText', '100');
    this.healthText.color = 'white';
    this.healthText.fontSize = 18;
    this.healthText.fontWeight = 'bold';
    this.healthText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.healthText.left = -10;
    this.healthText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    container.addControl(this.healthText);
  }

  private createAmmoDisplay(): void {
    const container = new Rectangle('ammoContainer');
    container.width = '140px';
    container.height = '45px';
    container.cornerRadius = 8;
    container.color = '#888';
    container.thickness = 2;
    container.background = 'rgba(0, 0, 0, 0.8)';
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    container.left = -20;
    container.top = -20;
    this.ui.addControl(container);

    const ammoIcon = new TextBlock('ammoIcon', '🔫');
    ammoIcon.fontSize = 18;
    ammoIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    ammoIcon.left = 10;
    container.addControl(ammoIcon);

    this.ammoText = new TextBlock('ammoText', '∞');
    this.ammoText.color = '#ffcc00';
    this.ammoText.fontSize = 24;
    this.ammoText.fontWeight = 'bold';
    this.ammoText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.ammoText.left = 15;
    container.addControl(this.ammoText);
  }

  private createObjectiveDisplay(): void {
    const container = new Rectangle('objectiveContainer');
    container.width = '300px';
    container.height = '40px';
    container.cornerRadius = 6;
    container.color = '#666';
    container.thickness = 1;
    container.background = 'rgba(0, 0, 0, 0.7)';
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.top = 20;
    this.ui.addControl(container);

    this.objectiveText = new TextBlock('objectiveText', '🎯 Destroy all enemies');
    this.objectiveText.color = '#ffcc00';
    this.objectiveText.fontSize = 16;
    container.addControl(this.objectiveText);
  }

  private createDamageFlash(): void {
    this.damageFlash = new Rectangle('damageFlash');
    this.damageFlash.width = '100%';
    this.damageFlash.height = '100%';
    this.damageFlash.background = 'red';
    this.damageFlash.alpha = 0;
    this.ui.addControl(this.damageFlash);
  }

  private createVignetteOverlay(): void {
    // Subtle vignette effect on HUD layer
    const vignette = new Rectangle('hudVignette');
    vignette.width = '100%';
    vignette.height = '100%';
    vignette.background = 'transparent';
    vignette.isHitTestVisible = false;
    this.ui.addControl(vignette);
  }

  update(player: PlayerController): void {
    const health = player.health.state.health;
    const percentage = player.health.getHealthPercentage();

    // Update bar width (max width 180px)
    const maxWidth = 180;
    const currentWidth = (percentage / 100) * maxWidth;
    this.healthBar.width = `${currentWidth}px`;
    this.healthBarGlow.width = `${currentWidth}px`;

    // Update color based on health with gradients
    if (percentage > 60) {
      this.healthBar.background = '#00cc44';
      this.healthBarGlow.background = 'rgba(0, 255, 100, 0.3)';
      this.healthBarGlow.shadowColor = 'rgba(0, 255, 100, 0.5)';
    } else if (percentage > 30) {
      this.healthBar.background = '#ff9900';
      this.healthBarGlow.background = 'rgba(255, 150, 0, 0.3)';
      this.healthBarGlow.shadowColor = 'rgba(255, 150, 0, 0.5)';
    } else {
      this.healthBar.background = '#ff3333';
      this.healthBarGlow.background = 'rgba(255, 50, 50, 0.3)';
      this.healthBarGlow.shadowColor = 'rgba(255, 50, 50, 0.5)';
      
      // Pulse effect when low health
      this.lowHealthPulse += 0.1;
      const pulse = Math.sin(this.lowHealthPulse) * 0.3 + 0.7;
      this.healthBarGlow.alpha = pulse;
    }

    if (percentage > 30) {
      this.healthBarGlow.alpha = 1;
    }

    // Update text (just show current health)
    this.healthText.text = `${Math.ceil(health)}`;
  }

  setObjective(text: string): void {
    this.objectiveText.text = `🎯 ${text}`;
  }

  showDamageFlash(): void {
    this.damageFlash.alpha = 0.5;
    
    // Animate fade out using requestAnimationFrame for better performance
    const fadeOut = () => {
      if (this.damageFlash.alpha <= 0) {
        this.damageFlash.alpha = 0;
        return;
      }
      this.damageFlash.alpha -= 0.05;
      requestAnimationFrame(fadeOut);
    };
    requestAnimationFrame(fadeOut);
  }

  setVisible(visible: boolean): void {
    this.ui.rootContainer.isVisible = visible;
  }

  dispose(): void {
    this.ui.dispose();
  }
}
