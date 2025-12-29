/**
 * SAVE ISMAEL - Enemy Manager
 * Handles spawning, updating, and managing all enemies
 */

import { Scene, Vector3 } from '@babylonjs/core';
import { Enemy } from './Enemy';
import { Demodog } from './Demodog';
import { Demobat } from './Demobat';
import { Demogorgon } from './Demogorgon';
import { MindFlayer } from './MindFlayer';
import { Vecna } from './Vecna';

export interface SpawnConfig {
    type: 'demodog' | 'demobat' | 'demogorgon' | 'mindflayer' | 'vecna';
    position: Vector3;
    count?: number;
}

export interface WaveConfig {
    enemies: SpawnConfig[];
    delayBetweenSpawns: number;
    onWaveComplete?: () => void;
}

export class EnemyManager {
    private scene: Scene;
    private enemies: Enemy[] = [];
    private bosses: Map<string, Enemy> = new Map();
    private currentWave: number = 0;
    private waveConfigs: WaveConfig[] = [];
    private isWaveActive: boolean = false;
    private spawnQueue: SpawnConfig[] = [];
    private maxEnemies: number = 50;
    
    // Event listeners
    private boundSpawnHandler: (e: Event) => void;
    private boundMindFlayerEchoHandler: (e: Event) => void;
    
    constructor(scene: Scene) {
        this.scene = scene;
        
        // Bind event handlers
        this.boundSpawnHandler = this.handleSpawnRequest.bind(this);
        this.boundMindFlayerEchoHandler = this.handleMindFlayerEchoSpawn.bind(this);
        
        // Listen for spawn requests from bosses
        window.addEventListener('spawnEnemies', this.boundSpawnHandler);
        window.addEventListener('spawnMindFlayerEcho', this.boundMindFlayerEchoHandler);
    }
    
    /**
     * Spawn a single enemy
     */
    public spawnEnemy(config: SpawnConfig): Enemy | null {
        if (this.enemies.length >= this.maxEnemies) {
            console.warn('Max enemies reached');
            return null;
        }
        
        let enemy: Enemy | null = null;
        
        switch (config.type) {
            case 'demodog':
                enemy = new Demodog(this.scene, config.position);
                break;
            case 'demobat':
                enemy = new Demobat(this.scene, config.position);
                break;
            case 'demogorgon':
                enemy = new Demogorgon(this.scene, config.position);
                break;
            case 'mindflayer':
                enemy = new MindFlayer(this.scene, config.position);
                this.bosses.set('mindflayer', enemy);
                break;
            case 'vecna':
                enemy = new Vecna(this.scene, config.position);
                this.bosses.set('vecna', enemy);
                break;
        }
        
        if (enemy) {
            this.enemies.push(enemy);
        }
        
        return enemy;
    }
    
    /**
     * Spawn multiple enemies of the same type
     */
    public spawnEnemies(config: SpawnConfig): Enemy[] {
        const spawned: Enemy[] = [];
        const count = config.count || 1;
        
        for (let i = 0; i < count; i++) {
            // Randomize position slightly
            const offset = new Vector3(
                (Math.random() - 0.5) * 10,
                0,
                (Math.random() - 0.5) * 10
            );
            
            const spawnPos = config.position.add(offset);
            const enemy = this.spawnEnemy({ ...config, position: spawnPos, count: 1 });
            
            if (enemy) {
                spawned.push(enemy);
            }
        }
        
        return spawned;
    }
    
    /**
     * Handle spawn requests from boss events
     */
    private handleSpawnRequest(e: Event): void {
        const detail = (e as CustomEvent).detail;
        
        if (detail.type && detail.position) {
            this.spawnEnemies({
                type: detail.type,
                position: detail.position,
                count: detail.count || 1
            });
        }
    }
    
    /**
     * Handle Mind Flayer Echo spawn for Vecna Phase 3
     */
    private handleMindFlayerEchoSpawn(e: Event): void {
        const detail = (e as CustomEvent).detail;
        
        if (detail.position) {
            const echoPosition = new Vector3(
                detail.position.x + 10,
                detail.position.y,
                detail.position.z
            );
            
            // Spawn a weaker version of Mind Flayer
            const echo = new MindFlayer(this.scene, echoPosition);
            // Reduce health for echo version - use the public properties
            echo.health = echo.maxHealth * 0.5;
            echo.damage *= 0.7;
            
            this.enemies.push(echo);
            this.bosses.set('mindflayer_echo', echo);
        }
    }
    
    /**
     * Set up wave configurations for a level
     */
    public setWaveConfigs(configs: WaveConfig[]): void {
        this.waveConfigs = configs;
        this.currentWave = 0;
    }
    
    /**
     * Start the next wave
     */
    public startNextWave(): boolean {
        if (this.currentWave >= this.waveConfigs.length) {
            return false; // No more waves
        }
        
        if (this.isWaveActive) {
            return false; // Wave already in progress
        }
        
        this.isWaveActive = true;
        const wave = this.waveConfigs[this.currentWave];
        
        this.spawnWave(wave);
        
        return true;
    }
    
    /**
     * Spawn enemies for a wave
     */
    private spawnWave(wave: WaveConfig): void {
        let spawnIndex = 0;
        
        const spawnNext = () => {
            if (spawnIndex >= wave.enemies.length) {
                // Wave spawning complete, wait for all enemies to die
                this.waitForWaveComplete(wave);
                return;
            }
            
            const config = wave.enemies[spawnIndex];
            this.spawnEnemies(config);
            spawnIndex++;
            
            setTimeout(spawnNext, wave.delayBetweenSpawns);
        };
        
        spawnNext();
    }
    
    /**
     * Wait for wave completion
     */
    private waitForWaveComplete(wave: WaveConfig): void {
        const checkInterval = setInterval(() => {
            const aliveEnemies = this.enemies.filter(e => e.isAlive);
            
            if (aliveEnemies.length === 0) {
                clearInterval(checkInterval);
                this.onWaveComplete(wave);
            }
        }, 500);
    }
    
    /**
     * Handle wave completion
     */
    private onWaveComplete(wave: WaveConfig): void {
        this.isWaveActive = false;
        this.currentWave++;
        
        console.log(`Wave ${this.currentWave} complete!`);
        
        window.dispatchEvent(new CustomEvent('waveComplete', {
            detail: { wave: this.currentWave }
        }));
        
        if (wave.onWaveComplete) {
            wave.onWaveComplete();
        }
    }
    
    /**
     * Update all enemies
     */
    public update(deltaTime: number, playerPosition: Vector3): void {
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive) {
                enemy.dispose();
                return false;
            }
            return true;
        });
        
        // Update all alive enemies
        this.enemies.forEach(enemy => {
            // Set target for enemies so they know where the player is
            enemy.setTarget(playerPosition);
            enemy.update(deltaTime);
        });
    }
    
    /**
     * Get all enemies within range of a position
     */
    public getEnemiesInRange(position: Vector3, range: number): Enemy[] {
        return this.enemies.filter(enemy => {
            if (!enemy.isAlive || !enemy.mesh) return false;
            return Vector3.Distance(enemy.mesh.position, position) <= range;
        });
    }
    
    /**
     * Get the nearest enemy to a position
     */
    public getNearestEnemy(position: Vector3): Enemy | null {
        let nearest: Enemy | null = null;
        let nearestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive || !enemy.mesh) return;
            
            const distance = Vector3.Distance(enemy.mesh.position, position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    /**
     * Deal damage to enemies in an area
     */
    public damageEnemiesInArea(position: Vector3, radius: number, damage: number): number {
        let hitCount = 0;
        
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive || !enemy.mesh) return;
            
            const distance = Vector3.Distance(enemy.mesh.position, position);
            if (distance <= radius) {
                // Falloff damage based on distance
                const falloff = 1 - (distance / radius);
                const actualDamage = damage * falloff;
                
                enemy.takeDamage(actualDamage);
                hitCount++;
            }
        });
        
        return hitCount;
    }
    
    /**
     * Get a specific boss
     */
    public getBoss(type: string): Enemy | null {
        return this.bosses.get(type) || null;
    }
    
    /**
     * Get active enemy count
     */
    public getActiveEnemyCount(): number {
        return this.enemies.filter(e => e.isAlive).length;
    }
    
    /**
     * Get current wave number
     */
    public getCurrentWave(): number {
        return this.currentWave;
    }
    
    /**
     * Check if all waves are complete
     */
    public areAllWavesComplete(): boolean {
        return this.currentWave >= this.waveConfigs.length && !this.isWaveActive;
    }
    
    /**
     * Clear all enemies
     */
    public clearAllEnemies(): void {
        this.enemies.forEach(enemy => {
            enemy.dispose();
        });
        
        this.enemies = [];
        this.bosses.clear();
    }
    
    /**
     * Dispose of the enemy manager
     */
    public dispose(): void {
        window.removeEventListener('spawnEnemies', this.boundSpawnHandler);
        window.removeEventListener('spawnMindFlayerEcho', this.boundMindFlayerEchoHandler);
        
        this.clearAllEnemies();
    }
}

export default EnemyManager;
