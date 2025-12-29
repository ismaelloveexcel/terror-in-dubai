// HealthSystem.ts - Health Management
// Save Ismael

import { playerConfig } from '../config/gameConfig';

export class HealthSystem {
  public current: number;
  public max: number;
  
  private regenDelay: number;
  private regenRate: number;
  private timeSinceDamage: number = 0;
  private isRegenerating: boolean = false;
  
  // Callbacks
  public onDamage?: (amount: number) => void;
  public onHeal?: (amount: number) => void;
  public onDeath?: () => void;
  public onChange?: (current: number, max: number) => void;
  
  constructor(maxHealth: number = playerConfig.maxHealth) {
    this.max = maxHealth;
    this.current = maxHealth;
    this.regenDelay = playerConfig.healthRegenDelay;
    this.regenRate = playerConfig.healthRegenRate;
  }
  
  public update(deltaTime: number): void {
    // Track time since last damage
    this.timeSinceDamage += deltaTime;
    
    // Start regen after delay
    if (this.timeSinceDamage >= this.regenDelay && this.current < this.max) {
      this.isRegenerating = true;
      const regenAmount = this.regenRate * deltaTime;
      this.heal(regenAmount);
    }
  }
  
  public takeDamage(amount: number): void {
    if (this.current <= 0) return;
    
    const actualDamage = Math.min(this.current, amount);
    this.current -= actualDamage;
    this.timeSinceDamage = 0;
    this.isRegenerating = false;
    
    this.onDamage?.(actualDamage);
    this.onChange?.(this.current, this.max);
    
    if (this.current <= 0) {
      this.current = 0;
      this.onDeath?.();
    }
  }
  
  public heal(amount: number): void {
    if (this.current >= this.max) return;
    
    const actualHeal = Math.min(this.max - this.current, amount);
    this.current += actualHeal;
    
    if (actualHeal > 0) {
      this.onHeal?.(actualHeal);
      this.onChange?.(this.current, this.max);
    }
  }
  
  public setMax(max: number): void {
    this.max = max;
    this.current = Math.min(this.current, max);
    this.onChange?.(this.current, this.max);
  }
  
  public reset(): void {
    this.current = this.max;
    this.timeSinceDamage = 0;
    this.isRegenerating = false;
    this.onChange?.(this.current, this.max);
  }
  
  public isDead(): boolean {
    return this.current <= 0;
  }
  
  public getPercentage(): number {
    return (this.current / this.max) * 100;
  }
  
  public isLow(): boolean {
    return this.current <= this.max * 0.3;
  }
  
  public isCritical(): boolean {
    return this.current <= this.max * 0.15;
  }
}

export default HealthSystem;
