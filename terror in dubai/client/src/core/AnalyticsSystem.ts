/**
 * AnalyticsSystem - Track user engagement and game events
 * 
 * This is a privacy-friendly analytics system that:
 * - Stores data locally
 * - Does not send data to external servers
 * - Provides insights for game improvement
 * 
 * For production, you could integrate with:
 * - Google Analytics
 * - Mixpanel
 * - Amplitude
 * - Custom backend
 */

export interface GameSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  device: 'desktop' | 'mobile';
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  name: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalPlayTime: number;
  averageSessionLength: number;
  mostPlayedLevel: number;
  completionRate: number;
  mobilePercentage: number;
  topEvents: { name: string; count: number }[];
}

const ANALYTICS_KEY = 'saveIsmael_analytics';
const MAX_SESSIONS = 50; // Keep last 50 sessions

export class AnalyticsSystem {
  private currentSession: GameSession;
  private sessions: GameSession[] = [];
  private eventCounts: Map<string, number> = new Map();

  constructor() {
    this.currentSession = this.createSession();
    this.loadHistory();
    this.setupBeforeUnload();
  }

  /**
   * Create a new session
   */
  private createSession(): GameSession {
    return {
      id: this.generateId(),
      startTime: Date.now(),
      device: this.detectDevice(),
      events: []
    };
  }

  /**
   * Generate unique session ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Detect device type
   */
  private detectDevice(): 'desktop' | 'mobile' {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop';
  }

  /**
   * Load historical sessions
   */
  private loadHistory(): void {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.sessions = data.sessions || [];
        
        // Rebuild event counts
        this.sessions.forEach(session => {
          session.events.forEach(event => {
            const count = this.eventCounts.get(event.name) || 0;
            this.eventCounts.set(event.name, count + 1);
          });
        });
      } catch (e) {
        console.warn('Failed to load analytics history');
      }
    }
  }

  /**
   * Save session data before page unload
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Also save periodically
    setInterval(() => {
      this.saveProgress();
    }, 30000); // Every 30 seconds
  }

  /**
   * Track an event
   */
  track(eventName: string, data?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      timestamp: Date.now(),
      data
    };

    this.currentSession.events.push(event);
    
    // Update event counts
    const count = this.eventCounts.get(eventName) || 0;
    this.eventCounts.set(eventName, count + 1);

    console.log(`📊 Analytics: ${eventName}`, data || '');
  }

  /**
   * Track common game events
   */
  trackGameStart(): void {
    this.track('game_start');
  }

  trackLevelStart(levelIndex: number): void {
    this.track('level_start', { level: levelIndex });
  }

  trackLevelComplete(levelIndex: number, duration: number): void {
    this.track('level_complete', { level: levelIndex, duration });
  }

  trackDeath(levelIndex: number, cause?: string): void {
    this.track('player_death', { level: levelIndex, cause });
  }

  trackEnemyKill(enemyType: string): void {
    this.track('enemy_kill', { type: enemyType });
  }

  trackAchievementUnlock(achievementId: string): void {
    this.track('achievement_unlock', { id: achievementId });
  }

  trackSettingsChange(setting: string, value: unknown): void {
    this.track('settings_change', { setting, value });
  }

  trackTutorialComplete(skipped: boolean): void {
    this.track('tutorial_complete', { skipped });
  }

  trackGameComplete(difficulty: string, totalTime: number): void {
    this.track('game_complete', { difficulty, totalTime });
  }

  /**
   * End current session
   */
  endSession(): void {
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    
    // Add to history
    this.sessions.push(this.currentSession);
    
    // Keep only last MAX_SESSIONS
    if (this.sessions.length > MAX_SESSIONS) {
      this.sessions = this.sessions.slice(-MAX_SESSIONS);
    }

    this.saveProgress();
  }

  /**
   * Save analytics data
   */
  private saveProgress(): void {
    const data = {
      sessions: this.sessions,
      lastUpdated: Date.now()
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  }

  /**
   * Get analytics summary
   */
  getSummary(): AnalyticsSummary {
    const allSessions = [...this.sessions, this.currentSession];
    
    // Calculate totals
    const totalPlayTime = allSessions.reduce((sum, s) => {
      const duration = s.duration || (Date.now() - s.startTime);
      return sum + duration;
    }, 0);

    // Average session length
    const averageSessionLength = allSessions.length > 0
      ? totalPlayTime / allSessions.length
      : 0;

    // Mobile percentage
    const mobileSessions = allSessions.filter(s => s.device === 'mobile').length;
    const mobilePercentage = allSessions.length > 0
      ? Math.round((mobileSessions / allSessions.length) * 100)
      : 0;

    // Most played level
    const levelCounts = new Map<number, number>();
    allSessions.forEach(session => {
      session.events
        .filter(e => e.name === 'level_start')
        .forEach(e => {
          const level = (e.data?.level as number) || 0;
          levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
        });
    });
    let mostPlayedLevel = 0;
    let maxCount = 0;
    levelCounts.forEach((count, level) => {
      if (count > maxCount) {
        maxCount = count;
        mostPlayedLevel = level;
      }
    });

    // Completion rate
    const levelStarts = allSessions.flatMap(s => 
      s.events.filter(e => e.name === 'level_start')
    ).length;
    const levelCompletes = allSessions.flatMap(s => 
      s.events.filter(e => e.name === 'level_complete')
    ).length;
    const completionRate = levelStarts > 0
      ? Math.round((levelCompletes / levelStarts) * 100)
      : 0;

    // Top events
    const topEvents = Array.from(this.eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalSessions: allSessions.length,
      totalPlayTime,
      averageSessionLength,
      mostPlayedLevel,
      completionRate,
      mobilePercentage,
      topEvents
    };
  }

  /**
   * Get current session duration
   */
  getCurrentSessionDuration(): number {
    return Date.now() - this.currentSession.startTime;
  }

  /**
   * Export analytics data (for debugging)
   */
  exportData(): string {
    return JSON.stringify({
      currentSession: this.currentSession,
      sessions: this.sessions,
      summary: this.getSummary()
    }, null, 2);
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.sessions = [];
    this.eventCounts.clear();
    localStorage.removeItem(ANALYTICS_KEY);
    this.currentSession = this.createSession();
  }
}

// Singleton instance
export const analytics = new AnalyticsSystem();
