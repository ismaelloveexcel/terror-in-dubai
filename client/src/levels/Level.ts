/**
 * SAVE ISMAEL - Base Level Class
 * Abstract base class for all game levels
 */

import { 
    Scene, 
    Vector3, 
    MeshBuilder, 
    StandardMaterial, 
    Color3, 
    HemisphericLight,
    PointLight,
    DirectionalLight,
    ShadowGenerator,
    FreeCamera,
    Mesh,
    ParticleSystem,
    Texture
} from '@babylonjs/core';
import { EnemyManager, WaveConfig, SpawnConfig } from '../enemies/EnemyManager';

export interface LevelConfig {
    id: number;
    name: string;
    subtitle: string;
    location: string;
    description: string;
    ambientColor: Color3;
    fogColor: Color3;
    fogDensity: number;
    evidenceItem: string;
    evidenceDescription: string;
    mammooMessage: string;
    duration: { min: number; max: number };
    hasBoss: boolean;
    bossType?: string;
}

export interface EvidenceItem {
    id: string;
    name: string;
    description: string;
    position: Vector3;
    collected: boolean;
    mesh?: Mesh;
}

export abstract class Level {
    protected scene: Scene;
    protected config: LevelConfig;
    protected enemyManager: EnemyManager;
    protected playerSpawnPoint: Vector3;
    protected exitPoint: Vector3;
    protected evidence: EvidenceItem | null = null;
    protected environmentMeshes: Mesh[] = [];
    protected lights: any[] = [];
    protected particles: ParticleSystem[] = [];
    protected isComplete: boolean = false;
    protected isLoaded: boolean = false;
    
    // Upside Down atmosphere
    protected corruptionLevel: number = 0;
    protected maxCorruption: number = 100;
    
    // Level state
    protected startTime: number = 0;
    protected enemiesDefeated: number = 0;
    protected totalEnemies: number = 0;
    
    constructor(scene: Scene, config: LevelConfig) {
        this.scene = scene;
        this.config = config;
        this.enemyManager = new EnemyManager(scene);
        this.playerSpawnPoint = new Vector3(0, 1, 0);
        this.exitPoint = new Vector3(0, 1, 50);
    }
    
    /**
     * Load the level - called when entering
     */
    public async load(): Promise<void> {
        console.log(`Loading Level ${this.config.id}: ${this.config.name}`);
        
        this.startTime = Date.now();
        
        // Set up atmosphere
        this.setupAtmosphere();
        
        // Create the level geometry
        await this.createEnvironment();
        
        // Set up lighting
        this.setupLighting();
        
        // Create evidence item
        this.createEvidence();
        
        // Set up enemy waves
        this.setupEnemyWaves();
        
        // Set up level-specific elements
        await this.setupLevelSpecific();
        
        this.isLoaded = true;
        
        // Trigger level start
        window.dispatchEvent(new CustomEvent('levelStart', {
            detail: {
                level: this.config.id,
                name: this.config.name,
                subtitle: this.config.subtitle
            }
        }));
        
        // Play Mammoo's message
        setTimeout(() => {
            this.playMammooMessage();
        }, 3000);
    }
    
    /**
     * Set up the Upside Down atmosphere
     */
    protected setupAtmosphere(): void {
        // Ambient color
        this.scene.ambientColor = this.config.ambientColor;
        
        // Fog
        this.scene.fogMode = Scene.FOGMODE_EXP2;
        this.scene.fogColor = this.config.fogColor;
        this.scene.fogDensity = this.config.fogDensity;
        
        // Clear color (sky)
        this.scene.clearColor = new BABYLON.Color4(
            this.config.fogColor.r * 0.5,
            this.config.fogColor.g * 0.5,
            this.config.fogColor.b * 0.5,
            1
        );
    }
    
    /**
     * Set up basic lighting
     */
    protected setupLighting(): void {
        // Dim ambient light
        const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
        ambient.intensity = 0.2;
        ambient.diffuse = new Color3(0.1, 0.1, 0.15);
        ambient.groundColor = new Color3(0.02, 0.02, 0.05);
        this.lights.push(ambient);
        
        // Directional light with shadows
        const directional = new DirectionalLight('directional', new Vector3(-0.5, -1, 0.5), this.scene);
        directional.intensity = 0.3;
        directional.diffuse = new Color3(0.2, 0.2, 0.3);
        this.lights.push(directional);
    }
    
    /**
     * Create the evidence item for this level
     */
    protected createEvidence(): void {
        const evidenceConfig = this.getEvidenceConfig();
        
        this.evidence = {
            id: `evidence_level_${this.config.id}`,
            name: this.config.evidenceItem,
            description: this.config.evidenceDescription,
            position: evidenceConfig.position,
            collected: false
        };
        
        // Create visual representation
        const evidenceMesh = MeshBuilder.CreateBox('evidence', {
            width: 0.3,
            height: 0.2,
            depth: 0.3
        }, this.scene);
        
        evidenceMesh.position = this.evidence.position.clone();
        
        // Glowing material
        const mat = new StandardMaterial('evidenceMat', this.scene);
        mat.emissiveColor = new Color3(1, 0.8, 0);
        mat.alpha = 0.9;
        evidenceMesh.material = mat;
        
        // Glow particle effect
        const glow = new ParticleSystem('evidenceGlow', 50, this.scene);
        glow.emitter = evidenceMesh;
        glow.minSize = 0.1;
        glow.maxSize = 0.3;
        glow.minLifeTime = 0.5;
        glow.maxLifeTime = 1;
        glow.emitRate = 20;
        glow.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
        glow.color2 = new BABYLON.Color4(1, 0.6, 0, 0.5);
        glow.colorDead = new BABYLON.Color4(1, 0.4, 0, 0);
        glow.gravity = new Vector3(0, 0.5, 0);
        glow.start();
        
        this.particles.push(glow);
        this.evidence.mesh = evidenceMesh;
        this.environmentMeshes.push(evidenceMesh);
        
        // Floating animation
        let time = 0;
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.evidence && this.evidence.mesh && !this.evidence.collected) {
                time += 0.02;
                this.evidence.mesh.position.y = this.evidence.position.y + Math.sin(time) * 0.2;
                this.evidence.mesh.rotation.y += 0.01;
            }
        });
    }
    
    /**
     * Get evidence configuration for this level
     * Override in subclasses for specific positions
     */
    protected abstract getEvidenceConfig(): { position: Vector3 };
    
    /**
     * Create the environment - implemented by each level
     */
    protected abstract createEnvironment(): Promise<void>;
    
    /**
     * Set up enemy waves - implemented by each level
     */
    protected abstract setupEnemyWaves(): void;
    
    /**
     * Set up level-specific elements
     */
    protected abstract setupLevelSpecific(): Promise<void>;
    
    /**
     * Play Mammoo's message for this level
     */
    protected playMammooMessage(): void {
        window.dispatchEvent(new CustomEvent('mammooMessage', {
            detail: {
                level: this.config.id,
                message: this.config.mammooMessage,
                isVoiceNote: true
            }
        }));
    }
    
    /**
     * Update the level
     */
    public update(deltaTime: number, playerPosition: Vector3): void {
        if (!this.isLoaded) return;
        
        // Update enemies
        this.enemyManager.update(deltaTime, playerPosition);
        
        // Check evidence collection
        this.checkEvidenceCollection(playerPosition);
        
        // Check level completion
        this.checkCompletion(playerPosition);
        
        // Update corruption effects
        this.updateCorruption(deltaTime);
        
        // Level-specific updates
        this.updateLevelSpecific(deltaTime, playerPosition);
    }
    
    /**
     * Check if player collected evidence
     */
    protected checkEvidenceCollection(playerPosition: Vector3): void {
        if (!this.evidence || this.evidence.collected) return;
        
        const distance = Vector3.Distance(playerPosition, this.evidence.position);
        
        if (distance < 2) {
            this.collectEvidence();
        }
    }
    
    /**
     * Collect the evidence item
     */
    protected collectEvidence(): void {
        if (!this.evidence) return;
        
        this.evidence.collected = true;
        
        // Hide the mesh
        if (this.evidence.mesh) {
            this.evidence.mesh.isVisible = false;
        }
        
        // Notify UI
        window.dispatchEvent(new CustomEvent('evidenceCollected', {
            detail: {
                level: this.config.id,
                name: this.evidence.name,
                description: this.evidence.description
            }
        }));
        
        console.log(`Evidence collected: ${this.evidence.name}`);
    }
    
    /**
     * Check if level is complete
     */
    protected checkCompletion(playerPosition: Vector3): void {
        // Check if all waves complete and player reached exit
        if (this.enemyManager.areAllWavesComplete()) {
            const distanceToExit = Vector3.Distance(playerPosition, this.exitPoint);
            
            if (distanceToExit < 3) {
                this.completeLevel();
            }
        }
    }
    
    /**
     * Complete the level
     */
    protected completeLevel(): void {
        if (this.isComplete) return;
        
        this.isComplete = true;
        
        const completionTime = (Date.now() - this.startTime) / 1000;
        
        window.dispatchEvent(new CustomEvent('levelComplete', {
            detail: {
                level: this.config.id,
                name: this.config.name,
                time: completionTime,
                evidenceCollected: this.evidence?.collected || false,
                enemiesDefeated: this.enemiesDefeated
            }
        }));
        
        console.log(`Level ${this.config.id} complete!`);
    }
    
    /**
     * Update corruption effects
     */
    protected updateCorruption(deltaTime: number): void {
        // Increase corruption over time
        if (this.corruptionLevel < this.maxCorruption) {
            this.corruptionLevel += deltaTime * 0.001;
        }
        
        // Update fog density based on corruption
        const baseDensity = this.config.fogDensity;
        const corruptionFactor = this.corruptionLevel / this.maxCorruption;
        this.scene.fogDensity = baseDensity * (1 + corruptionFactor * 0.5);
    }
    
    /**
     * Level-specific update logic
     */
    protected abstract updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void;
    
    /**
     * Create Upside Down vines/tendrils
     */
    protected createCorruptionVines(position: Vector3, count: number = 5): Mesh[] {
        const vines: Mesh[] = [];
        
        for (let i = 0; i < count; i++) {
            const vine = MeshBuilder.CreateCylinder(`vine_${position.x}_${i}`, {
                height: 3 + Math.random() * 4,
                diameterTop: 0.05,
                diameterBottom: 0.2 + Math.random() * 0.2,
                tessellation: 8
            }, this.scene);
            
            vine.position = position.clone();
            vine.position.x += (Math.random() - 0.5) * 3;
            vine.position.z += (Math.random() - 0.5) * 3;
            vine.rotation.x = (Math.random() - 0.5) * 0.3;
            vine.rotation.z = (Math.random() - 0.5) * 0.3;
            
            const vineMat = new StandardMaterial(`vineMat_${i}`, this.scene);
            vineMat.diffuseColor = new Color3(0.1, 0.15, 0.1);
            vineMat.emissiveColor = new Color3(0, 0.05, 0.02);
            vine.material = vineMat;
            
            vines.push(vine);
            this.environmentMeshes.push(vine);
        }
        
        return vines;
    }
    
    /**
     * Create emergency light
     */
    protected createEmergencyLight(position: Vector3): PointLight {
        const light = new PointLight(`emergencyLight_${position.x}`, position, this.scene);
        light.diffuse = new Color3(1, 0.4, 0);
        light.intensity = 3;
        light.range = 15;
        
        // Flicker effect
        let flickerTime = Math.random() * 100;
        this.scene.onBeforeRenderObservable.add(() => {
            flickerTime += 0.1;
            light.intensity = 2 + Math.sin(flickerTime * 3) * 0.5 + Math.random() * 0.5;
        });
        
        this.lights.push(light);
        
        // Visual representation
        const bulb = MeshBuilder.CreateSphere('bulb', { diameter: 0.3 }, this.scene);
        bulb.position = position;
        const bulbMat = new StandardMaterial('bulbMat', this.scene);
        bulbMat.emissiveColor = new Color3(1, 0.4, 0);
        bulb.material = bulbMat;
        this.environmentMeshes.push(bulb);
        
        return light;
    }
    
    /**
     * Create wet surface effect
     */
    protected createWetSurface(mesh: Mesh): void {
        if (mesh.material) {
            const mat = mesh.material as StandardMaterial;
            mat.specularColor = new Color3(0.3, 0.3, 0.4);
            mat.specularPower = 64;
        }
    }
    
    /**
     * Get player spawn point
     */
    public getPlayerSpawnPoint(): Vector3 {
        return this.playerSpawnPoint.clone();
    }
    
    /**
     * Get exit point
     */
    public getExitPoint(): Vector3 {
        return this.exitPoint.clone();
    }
    
    /**
     * Get level config
     */
    public getConfig(): LevelConfig {
        return this.config;
    }
    
    /**
     * Is level complete
     */
    public getIsComplete(): boolean {
        return this.isComplete;
    }
    
    /**
     * Unload the level
     */
    public unload(): void {
        // Dispose environment meshes
        this.environmentMeshes.forEach(mesh => mesh.dispose());
        this.environmentMeshes = [];
        
        // Dispose lights
        this.lights.forEach(light => light.dispose());
        this.lights = [];
        
        // Dispose particles
        this.particles.forEach(ps => ps.dispose());
        this.particles = [];
        
        // Clear enemies
        this.enemyManager.dispose();
        
        this.isLoaded = false;
        this.isComplete = false;
    }
}

export default Level;
