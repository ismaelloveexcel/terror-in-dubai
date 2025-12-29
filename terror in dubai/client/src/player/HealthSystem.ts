import { PlayerState } from '../types';
import { playerConfig } from '../config/gameConfig';

export class HealthSystem {
  public state: PlayerState;
  private onDeathCallback: (() => void) | null = null;
  private onDamageCallback: (() => void) | null = null;

  constructor() {
    this.state = {
      health: playerConfig.maxHealth,
      maxHealth: playerConfig.maxHealth,
      isAlive: true,
      canMove: true,
      moveSpeedMultiplier: 1.0
    };
  }

  takeDamage(amount: number): void {
    if (!this.state.isAlive) return;

    this.state.health = Math.max(0, this.state.health - amount);

    if (this.onDamageCallback) {
      this.onDamageCallback();
    }

    if (this.state.health <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    if (!this.state.isAlive) return;
    this.state.health = Math.min(this.state.maxHealth, this.state.health + amount);
  }

  die(): void {
    this.state.isAlive = false;
    this.state.canMove = false;

    if (this.onDeathCallback) {
      this.onDeathCallback();
    }
  }

  reset(): void {
    this.state.health = this.state.maxHealth;
    this.state.isAlive = true;
    this.state.canMove = true;
    this.state.moveSpeedMultiplier = 1.0;
  }

  setMoveSpeedMultiplier(multiplier: number, duration: number = 0): void {
    this.state.moveSpeedMultiplier = multiplier;

    if (duration > 0) {
      setTimeout(() => {
        this.state.moveSpeedMultiplier = 1.0;
      }, duration);
    }
  }

  onDeath(callback: () => void): void {
    this.onDeathCallback = callback;
  }

  onDamage(callback: () => void): void {
    this.onDamageCallback = callback;
  }

  getHealthPercentage(): number {
    return (this.state.health / this.state.maxHealth) * 100;
  }
}
