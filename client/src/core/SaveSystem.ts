// SaveSystem.ts - Save/Load Game Data
// Save Ismael - Progress Persistence

import { ISaveData, ISettings, IStatistics } from '../types';

const STORAGE_KEY = 'save_ismael_data';

const defaultSettings: ISettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  sensitivity: 1.0,
  invertY: false,
  showFPS: false,
  graphicsQuality: 'high',
};

const defaultStatistics: IStatistics = {
  totalPlayTime: 0,
  enemiesKilled: 0,
  deathCount: 0,
  shotsHit: 0,
  shotsFired: 0,
  damageDealt: 0,
  damageTaken: 0,
};

const defaultSaveData: ISaveData = {
  currentLevel: 1,
  evidenceCollected: [],
  settings: { ...defaultSettings },
  statistics: { ...defaultStatistics },
};

export class SaveSystem {
  private data: ISaveData;
  
  constructor() {
    this.data = { ...defaultSaveData };
  }
  
  // ===========================================================================
  // LOAD / SAVE
  // ===========================================================================
  
  public async load(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = {
          ...defaultSaveData,
          ...parsed,
          settings: { ...defaultSettings, ...parsed.settings },
          statistics: { ...defaultStatistics, ...parsed.statistics },
        };
      }
    } catch (error) {
      console.warn('Failed to load save data:', error);
      this.data = { ...defaultSaveData };
    }
  }
  
  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn('Failed to save data:', error);
    }
  }
  
  public reset(): void {
    this.data = {
      ...defaultSaveData,
      settings: { ...this.data.settings }, // Keep settings
    };
    this.save();
  }
  
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  
  public getData(): ISaveData {
    return { ...this.data };
  }
  
  public getSettings(): ISettings {
    return { ...this.data.settings };
  }
  
  public getStatistics(): IStatistics {
    return { ...this.data.statistics };
  }
  
  public getCurrentLevel(): number {
    return this.data.currentLevel;
  }
  
  public hasEvidence(evidenceId: string): boolean {
    return this.data.evidenceCollected.includes(evidenceId);
  }
  
  public hasSaveData(): boolean {
    return this.data.currentLevel > 1 || this.data.evidenceCollected.length > 0;
  }
  
  // ===========================================================================
  // SETTERS
  // ===========================================================================
  
  public setLevel(level: number): void {
    this.data.currentLevel = Math.max(1, Math.min(6, level));
  }
  
  public addEvidence(evidenceId: string): void {
    if (!this.data.evidenceCollected.includes(evidenceId)) {
      this.data.evidenceCollected.push(evidenceId);
    }
  }
  
  public updateSettings(settings: Partial<ISettings>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }
  
  public updateStatistics(stats: Partial<IStatistics>): void {
    this.data.statistics = { ...this.data.statistics, ...stats };
  }
  
  // ===========================================================================
  // STATISTICS HELPERS
  // ===========================================================================
  
  public incrementKills(): void {
    this.data.statistics.enemiesKilled++;
  }
  
  public incrementDeaths(): void {
    this.data.statistics.deathCount++;
  }
  
  public recordShot(hit: boolean): void {
    this.data.statistics.shotsFired++;
    if (hit) {
      this.data.statistics.shotsHit++;
    }
  }
  
  public recordDamageDealt(amount: number): void {
    this.data.statistics.damageDealt += amount;
  }
  
  public recordDamageTaken(amount: number): void {
    this.data.statistics.damageTaken += amount;
  }
  
  public addPlayTime(seconds: number): void {
    this.data.statistics.totalPlayTime += seconds;
  }
  
  public getAccuracy(): number {
    if (this.data.statistics.shotsFired === 0) return 0;
    return (this.data.statistics.shotsHit / this.data.statistics.shotsFired) * 100;
  }
}

export default SaveSystem;
