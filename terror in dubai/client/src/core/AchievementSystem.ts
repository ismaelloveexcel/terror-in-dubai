import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from '@babylonjs/gui';

/**
 * AchievementSystem - Track and display player accomplishments
 * 
 * Features:
 * - Track various achievements
 * - Show unlock notifications
 * - Persist to localStorage
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  secret?: boolean;
}

const ACHIEVEMENTS_KEY = 'saveIsmael_achievements';

export class AchievementSystem {
  private ui: AdvancedDynamicTexture;
  private achievements: Map<string, Achievement> = new Map();
  private notificationQueue: Achievement[] = [];
  private isShowingNotification: boolean = false;

  // Define all achievements
  private readonly achievementDefinitions: Omit<Achievement, 'unlocked'>[] = [
    // Story achievements
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy',
      icon: '🩸'
    },
    {
      id: 'level_1_complete',
      name: 'Into the Darkness',
      description: 'Complete Level 1',
      icon: '🚇'
    },
    {
      id: 'level_2_complete',
      name: 'Signal Breaker',
      description: 'Complete Level 2',
      icon: '📡'
    },
    {
      id: 'level_3_complete',
      name: 'Boss Slayer',
      description: 'Defeat the final boss',
      icon: '👹'
    },
    {
      id: 'game_complete',
      name: 'Hero of Dubai',
      description: 'Save Uncle Ismael!',
      icon: '🏆'
    },
    
    // Combat achievements
    {
      id: 'kill_10',
      name: 'Getting Started',
      description: 'Defeat 10 enemies',
      icon: '⚔️'
    },
    {
      id: 'kill_50',
      name: 'Warrior',
      description: 'Defeat 50 enemies',
      icon: '🗡️'
    },
    {
      id: 'kill_100',
      name: 'Exterminator',
      description: 'Defeat 100 enemies',
      icon: '💀'
    },
    {
      id: 'no_damage_level',
      name: 'Untouchable',
      description: 'Complete a level without taking damage',
      icon: '🛡️',
      secret: true
    },
    
    // Collection achievements
    {
      id: 'memory_1',
      name: 'Memory Lane',
      description: 'Collect your first memory fragment',
      icon: '💭'
    },
    {
      id: 'memory_all',
      name: 'Complete Memories',
      description: 'Collect all memory fragments',
      icon: '🧠'
    },
    
    // Exploration achievements
    {
      id: 'play_1_hour',
      name: 'Dedicated',
      description: 'Play for 1 hour total',
      icon: '⏰'
    },
    {
      id: 'die_10_times',
      name: 'Never Give Up',
      description: 'Die 10 times... but keep going!',
      icon: '💪',
      secret: true
    },
    
    // Difficulty achievements
    {
      id: 'beat_hard',
      name: 'Nightmare Survivor',
      description: 'Complete the game on Hard difficulty',
      icon: '🔥',
      secret: true
    }
  ];

  constructor() {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('Achievements');
    this.initializeAchievements();
    this.loadProgress();
  }

  /**
   * Initialize all achievements as locked
   */
  private initializeAchievements(): void {
    this.achievementDefinitions.forEach(def => {
      this.achievements.set(def.id, {
        ...def,
        unlocked: false
      });
    });
  }

  /**
   * Load achievement progress from localStorage
   */
  private loadProgress(): void {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as { id: string; unlocked: boolean; unlockedAt?: number }[];
        data.forEach(item => {
          const achievement = this.achievements.get(item.id);
          if (achievement) {
            achievement.unlocked = item.unlocked;
            achievement.unlockedAt = item.unlockedAt;
          }
        });
      } catch (e) {
        console.warn('Failed to load achievements');
      }
    }
  }

  /**
   * Save achievement progress to localStorage
   */
  private saveProgress(): void {
    const data = Array.from(this.achievements.values()).map(a => ({
      id: a.id,
      unlocked: a.unlocked,
      unlockedAt: a.unlockedAt
    }));
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
  }

  /**
   * Unlock an achievement
   */
  unlock(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) {
      return false;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.saveProgress();

    // Queue notification
    this.notificationQueue.push(achievement);
    this.showNextNotification();

    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    return true;
  }

  /**
   * Show next achievement notification
   */
  private showNextNotification(): void {
    if (this.isShowingNotification || this.notificationQueue.length === 0) {
      return;
    }

    this.isShowingNotification = true;
    const achievement = this.notificationQueue.shift()!;

    // Create notification UI
    const container = new Rectangle('achievementNotification');
    container.width = '350px';
    container.height = '80px';
    container.cornerRadius = 10;
    container.color = '#ffd700';
    container.thickness = 2;
    container.background = 'rgba(0, 0, 0, 0.9)';
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.top = -100; // Start off-screen
    container.shadowColor = 'rgba(255, 215, 0, 0.5)';
    container.shadowBlur = 15;
    this.ui.addControl(container);

    // Icon
    const icon = new TextBlock('icon', achievement.icon);
    icon.fontSize = 32;
    icon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    icon.left = 15;
    container.addControl(icon);

    // Title
    const title = new TextBlock('title', '🏆 Achievement Unlocked!');
    title.fontSize = 14;
    title.color = '#ffd700';
    title.top = -15;
    title.left = 60;
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.addControl(title);

    // Name
    const name = new TextBlock('name', achievement.name);
    name.fontSize = 18;
    name.color = 'white';
    name.fontWeight = 'bold';
    name.top = 8;
    name.left = 60;
    name.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.addControl(name);

    // Description
    const desc = new TextBlock('desc', achievement.description);
    desc.fontSize = 12;
    desc.color = '#aaa';
    desc.top = 28;
    desc.left = 60;
    desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.addControl(desc);

    // Animate in
    let currentTop = -100;
    const animateIn = () => {
      currentTop += 10;
      container.top = currentTop;
      if (currentTop < 20) {
        requestAnimationFrame(animateIn);
      }
    };
    requestAnimationFrame(animateIn);

    // Hide after delay
    setTimeout(() => {
      // Animate out
      const animateOut = () => {
        currentTop -= 10;
        container.top = currentTop;
        if (currentTop > -100) {
          requestAnimationFrame(animateOut);
        } else {
          this.ui.removeControl(container);
          this.isShowingNotification = false;
          this.showNextNotification();
        }
      };
      requestAnimationFrame(animateOut);
    }, 3000);
  }

  /**
   * Check if an achievement is unlocked
   */
  isUnlocked(achievementId: string): boolean {
    return this.achievements.get(achievementId)?.unlocked || false;
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlocked);
  }

  /**
   * Get achievement progress (x/total)
   */
  getProgress(): { unlocked: number; total: number; percentage: number } {
    const all = this.getAllAchievements();
    const unlocked = all.filter(a => a.unlocked).length;
    return {
      unlocked,
      total: all.length,
      percentage: Math.round((unlocked / all.length) * 100)
    };
  }

  /**
   * Reset all achievements
   */
  reset(): void {
    this.achievements.forEach(a => {
      a.unlocked = false;
      a.unlockedAt = undefined;
    });
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  }

  /**
   * Track stats and auto-unlock achievements
   */
  checkStatAchievements(stats: { 
    enemiesKilled?: number; 
    deaths?: number; 
    playTime?: number;
    memoryFragments?: number;
  }): void {
    // Kill achievements
    if (stats.enemiesKilled !== undefined) {
      if (stats.enemiesKilled >= 1) this.unlock('first_blood');
      if (stats.enemiesKilled >= 10) this.unlock('kill_10');
      if (stats.enemiesKilled >= 50) this.unlock('kill_50');
      if (stats.enemiesKilled >= 100) this.unlock('kill_100');
    }

    // Death achievements
    if (stats.deaths !== undefined && stats.deaths >= 10) {
      this.unlock('die_10_times');
    }

    // Play time achievements (in seconds)
    if (stats.playTime !== undefined && stats.playTime >= 3600) {
      this.unlock('play_1_hour');
    }

    // Memory achievements
    if (stats.memoryFragments !== undefined) {
      if (stats.memoryFragments >= 1) this.unlock('memory_1');
      if (stats.memoryFragments >= 9) this.unlock('memory_all'); // 3 per level
    }
  }

  dispose(): void {
    this.ui.dispose();
  }
}

// Singleton instance
export const achievementSystem = new AchievementSystem();
