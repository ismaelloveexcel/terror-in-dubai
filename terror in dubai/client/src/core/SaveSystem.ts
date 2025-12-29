/**
 * SaveSystem - Handles game progress persistence
 * 
 * Features:
 * - Auto-save on level completion
 * - Manual save slots
 * - Resume from last level
 * - Track collectibles found
 */

export interface SaveData {
  // Progress
  currentLevel: number;
  levelsCompleted: number[];
  
  // Stats
  totalPlayTime: number; // in seconds
  totalDeaths: number;
  totalEnemiesKilled: number;
  
  // Collectibles
  memoryFragmentsCollected: string[];
  
  // Timestamps
  lastSaved: number;
  createdAt: number;
}

export interface SaveSlot {
  id: number;
  data: SaveData | null;
  name: string;
}

const SAVE_KEY = 'saveIsmael_saves';
const AUTO_SAVE_KEY = 'saveIsmael_autoSave';
const MAX_SLOTS = 3;

export class SaveSystem {
  private autoSave: SaveData | null = null;
  private saveSlots: SaveSlot[] = [];
  private sessionStartTime: number = Date.now();
  private currentStats = {
    deaths: 0,
    enemiesKilled: 0
  };

  constructor() {
    this.loadAllSaves();
  }

  /**
   * Load all save data from localStorage
   */
  private loadAllSaves(): void {
    // Load auto-save
    const autoSaveJson = localStorage.getItem(AUTO_SAVE_KEY);
    if (autoSaveJson) {
      try {
        this.autoSave = JSON.parse(autoSaveJson);
      } catch (e) {
        console.warn('Failed to load auto-save');
      }
    }

    // Load manual save slots
    const slotsJson = localStorage.getItem(SAVE_KEY);
    if (slotsJson) {
      try {
        this.saveSlots = JSON.parse(slotsJson);
      } catch (e) {
        console.warn('Failed to load save slots');
        this.initializeSlots();
      }
    } else {
      this.initializeSlots();
    }
  }

  /**
   * Initialize empty save slots
   */
  private initializeSlots(): void {
    this.saveSlots = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      this.saveSlots.push({
        id: i,
        data: null,
        name: `Slot ${i + 1}`
      });
    }
    this.persistSlots();
  }

  /**
   * Create a new save data object
   */
  private createSaveData(currentLevel: number): SaveData {
    const existingData = this.autoSave;
    const playTime = (Date.now() - this.sessionStartTime) / 1000;

    return {
      currentLevel,
      levelsCompleted: existingData?.levelsCompleted || [],
      totalPlayTime: (existingData?.totalPlayTime || 0) + playTime,
      totalDeaths: (existingData?.totalDeaths || 0) + this.currentStats.deaths,
      totalEnemiesKilled: (existingData?.totalEnemiesKilled || 0) + this.currentStats.enemiesKilled,
      memoryFragmentsCollected: existingData?.memoryFragmentsCollected || [],
      lastSaved: Date.now(),
      createdAt: existingData?.createdAt || Date.now()
    };
  }

  /**
   * Auto-save progress (called on level completion)
   */
  autoSaveProgress(currentLevel: number, levelCompleted: boolean = false): void {
    const saveData = this.createSaveData(currentLevel);
    
    if (levelCompleted && !saveData.levelsCompleted.includes(currentLevel)) {
      saveData.levelsCompleted.push(currentLevel);
    }

    this.autoSave = saveData;
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
    console.log('Auto-saved progress');
  }

  /**
   * Save to a specific slot
   */
  saveToSlot(slotId: number, currentLevel: number, customName?: string): boolean {
    if (slotId < 0 || slotId >= MAX_SLOTS) return false;

    const saveData = this.createSaveData(currentLevel);
    this.saveSlots[slotId] = {
      id: slotId,
      data: saveData,
      name: customName || `Save ${new Date().toLocaleDateString()}`
    };

    this.persistSlots();
    console.log(`Saved to slot ${slotId}`);
    return true;
  }

  /**
   * Load from a specific slot
   */
  loadFromSlot(slotId: number): SaveData | null {
    if (slotId < 0 || slotId >= MAX_SLOTS) return null;
    return this.saveSlots[slotId].data;
  }

  /**
   * Get auto-save data
   */
  getAutoSave(): SaveData | null {
    return this.autoSave;
  }

  /**
   * Get all save slots
   */
  getSaveSlots(): SaveSlot[] {
    return this.saveSlots;
  }

  /**
   * Delete a save slot
   */
  deleteSlot(slotId: number): void {
    if (slotId >= 0 && slotId < MAX_SLOTS) {
      this.saveSlots[slotId].data = null;
      this.persistSlots();
    }
  }

  /**
   * Clear all saves
   */
  clearAllSaves(): void {
    this.autoSave = null;
    localStorage.removeItem(AUTO_SAVE_KEY);
    this.initializeSlots();
  }

  /**
   * Persist save slots to localStorage
   */
  private persistSlots(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveSlots));
  }

  /**
   * Track a death
   */
  trackDeath(): void {
    this.currentStats.deaths++;
  }

  /**
   * Track enemy kill
   */
  trackEnemyKill(): void {
    this.currentStats.enemiesKilled++;
  }

  /**
   * Track memory fragment collection
   */
  trackMemoryCollection(fragmentId: string): void {
    if (!this.autoSave) {
      this.autoSave = this.createSaveData(0);
    }
    
    if (!this.autoSave.memoryFragmentsCollected.includes(fragmentId)) {
      this.autoSave.memoryFragmentsCollected.push(fragmentId);
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(this.autoSave));
    }
  }

  /**
   * Check if can continue from save
   */
  hasSaveData(): boolean {
    return this.autoSave !== null || this.saveSlots.some(s => s.data !== null);
  }

  /**
   * Get last played level
   */
  getLastLevel(): number {
    if (this.autoSave) {
      return this.autoSave.currentLevel;
    }
    return 0;
  }

  /**
   * Format play time for display
   */
  formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

// Singleton instance
export const saveSystem = new SaveSystem();
