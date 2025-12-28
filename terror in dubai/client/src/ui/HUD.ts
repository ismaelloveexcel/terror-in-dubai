import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from '@babylonjs/gui';
import { PlayerController } from '../player/PlayerController';

export class HUD {
  private ui: AdvancedDynamicTexture;
  private healthBar!: Rectangle;
  private healthText!: TextBlock;
  private damageFlash!: Rectangle;

  constructor() {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('HUD');
    this.createHealthBar();
    this.createDamageFlash();
  }

  private createHealthBar(): void {
    const container = new Rectangle('healthContainer');
    container.width = '250px';
    container.height = '40px';
    container.cornerRadius = 5;
    container.color = 'white';
    container.thickness = 2;
    container.background = 'rgba(0, 0, 0, 0.7)';
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.left = 20;
    container.top = 20;
    this.ui.addControl(container);

    this.healthBar = new Rectangle('healthBar');
    this.healthBar.width = '230px';
    this.healthBar.height = '25px';
    this.healthBar.cornerRadius = 3;
    this.healthBar.color = 'transparent';
    this.healthBar.thickness = 0;
    this.healthBar.background = 'green';
    this.healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.healthBar.left = 5;
    container.addControl(this.healthBar);

    this.healthText = new TextBlock('healthText', '100 / 100');
    this.healthText.color = 'white';
    this.healthText.fontSize = 16;
    container.addControl(this.healthText);
  }

  private createDamageFlash(): void {
    this.damageFlash = new Rectangle('damageFlash');
    this.damageFlash.width = '100%';
    this.damageFlash.height = '100%';
    this.damageFlash.background = 'red';
    this.damageFlash.alpha = 0;
    this.ui.addControl(this.damageFlash);
  }

  update(player: PlayerController): void {
    const health = player.health.state.health;
    const maxHealth = player.health.state.maxHealth;
    const percentage = player.health.getHealthPercentage();

    // Update bar width
    const maxWidth = 230;
    const currentWidth = (percentage / 100) * maxWidth;
    this.healthBar.width = `${currentWidth}px`;

    // Update color
    if (percentage > 60) {
      this.healthBar.background = 'green';
    } else if (percentage > 30) {
      this.healthBar.background = 'orange';
    } else {
      this.healthBar.background = 'red';
    }

    // Update text
    this.healthText.text = `${Math.ceil(health)} / ${maxHealth}`;
  }

  showDamageFlash(): void {
    this.damageFlash.alpha = 0.3;
    setTimeout(() => {
      this.damageFlash.alpha = 0;
    }, 200);
  }

  setVisible(visible: boolean): void {
    this.ui.rootContainer.isVisible = visible;
  }

  dispose(): void {
    this.ui.dispose();
  }
}
