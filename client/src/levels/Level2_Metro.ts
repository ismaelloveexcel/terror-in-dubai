/**
 * SAVE ISMAEL - Level 2: Dubai Metro
 * Underground tunnels - descending deeper into the Upside Down
 * First Demogorgon encounter
 */

import { 
    Scene, 
    Vector3, 
    MeshBuilder, 
    StandardMaterial, 
    Color3,
    PointLight,
    Mesh
} from '@babylonjs/core';
import { Level, LevelConfig } from './Level';
import { WaveConfig } from '../enemies/EnemyManager';

export class Level2_Metro extends Level {
    private tunnels: Mesh[] = [];
    private trains: Mesh[] = [];
    private platforms: Mesh[] = [];
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 2,
            name: 'DUBAI METRO',
            subtitle: 'The Descent',
            location: 'Underground Tunnels',
            description: 'The metro system has been corrupted. Something bigger lurks in the darkness.',
            ambientColor: new Color3(0.03, 0.03, 0.05),
            fogColor: new Color3(0.01, 0.02, 0.03),
            fogDensity: 0.025,
            evidenceItem: 'Wallet + Photo',
            evidenceDescription: 'Uncle\'s wallet with a photo of you inside. He was running.',
            mammooMessage: 'Aidan... I made it to the metro... but the trains... they\'re not moving... something is down here... I dropped my wallet... I can hear it breathing...',
            duration: { min: 10, max: 15 },
            hasBoss: true,
            bossType: 'demogorgon'
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -40);
        this.exitPoint = new Vector3(0, 1, 80);
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(-3, 0.5, 30) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Create metro station
        this.createMetroStation();
        
        // Create tunnels
        this.createTunnels();
        
        // Create abandoned trains
        this.createAbandonedTrains();
        
        // Add heavy corruption
        this.addMetroCorruption();
    }
    
    private createMetroStation(): void {
        // Platform floor
        const platform = MeshBuilder.CreateBox('platform', {
            width: 15,
            height: 1,
            depth: 60
        }, this.scene);
        platform.position = new Vector3(0, 0.5, 0);
        
        const platformMat = new StandardMaterial('platformMat', this.scene);
        platformMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        platformMat.specularColor = new Color3(0.15, 0.15, 0.2);
        platform.material = platformMat;
        this.environmentMeshes.push(platform);
        this.platforms.push(platform);
        
        // Track bed (lower level)
        const trackBed = MeshBuilder.CreateBox('trackBed', {
            width: 8,
            height: 0.5,
            depth: 120
        }, this.scene);
        trackBed.position = new Vector3(-12, 0.25, 20);
        
        const trackMat = new StandardMaterial('trackMat', this.scene);
        trackMat.diffuseColor = new Color3(0.05, 0.05, 0.06);
        trackBed.material = trackMat;
        this.environmentMeshes.push(trackBed);
        
        // Rails
        this.createRails(new Vector3(-14, 0.6, 20));
        this.createRails(new Vector3(-10, 0.6, 20));
        
        // Station ceiling - curved
        this.createStationCeiling();
        
        // Pillars
        for (let z = -25; z <= 55; z += 10) {
            this.createMetroPillar(new Vector3(-5, 0, z));
            this.createMetroPillar(new Vector3(5, 0, z));
        }
        
        // Platform edge
        const edge = MeshBuilder.CreateBox('platformEdge', {
            width: 0.5,
            height: 0.3,
            depth: 60
        }, this.scene);
        edge.position = new Vector3(-7.25, 0.85, 0);
        
        const edgeMat = new StandardMaterial('edgeMat', this.scene);
        edgeMat.diffuseColor = new Color3(0.8, 0.7, 0);
        edgeMat.emissiveColor = new Color3(0.2, 0.15, 0);
        edge.material = edgeMat;
        this.environmentMeshes.push(edge);
    }
    
    private createRails(position: Vector3): void {
        const rail = MeshBuilder.CreateBox('rail', {
            width: 0.1,
            height: 0.15,
            depth: 120
        }, this.scene);
        rail.position = position;
        
        const railMat = new StandardMaterial('railMat', this.scene);
        railMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
        railMat.specularColor = new Color3(0.5, 0.5, 0.5);
        rail.material = railMat;
        this.environmentMeshes.push(rail);
    }
    
    private createStationCeiling(): void {
        // Curved ceiling segments
        for (let z = -30; z <= 60; z += 5) {
            const segment = MeshBuilder.CreateCylinder(`ceiling_${z}`, {
                height: 40,
                diameter: 16,
                tessellation: 24,
                arc: 0.5
            }, this.scene);
            segment.position = new Vector3(0, 10, z);
            segment.rotation.x = Math.PI / 2;
            segment.rotation.z = Math.PI;
            
            const ceilingMat = new StandardMaterial(`ceilingMat_${z}`, this.scene);
            ceilingMat.diffuseColor = new Color3(0.08, 0.08, 0.1);
            ceilingMat.backFaceCulling = false;
            segment.material = ceilingMat;
            this.environmentMeshes.push(segment);
        }
    }
    
    private createMetroPillar(position: Vector3): void {
        // Modern metro pillar
        const pillar = MeshBuilder.CreateBox('metroPillar', {
            width: 0.8,
            height: 6,
            depth: 0.8
        }, this.scene);
        pillar.position = position.clone();
        pillar.position.y = 3.5;
        
        const pillarMat = new StandardMaterial('metroPillarMat', this.scene);
        pillarMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
        pillar.material = pillarMat;
        this.environmentMeshes.push(pillar);
    }
    
    private createTunnels(): void {
        // Entry tunnel
        const entryTunnel = this.createTunnelSection(new Vector3(-12, 2, -50), 30);
        this.tunnels.push(...entryTunnel);
        
        // Exit tunnel
        const exitTunnel = this.createTunnelSection(new Vector3(-12, 2, 60), 40);
        this.tunnels.push(...exitTunnel);
    }
    
    private createTunnelSection(position: Vector3, length: number): Mesh[] {
        const meshes: Mesh[] = [];
        
        // Tunnel tube
        const tunnel = MeshBuilder.CreateCylinder('tunnel', {
            height: length,
            diameter: 8,
            tessellation: 24
        }, this.scene);
        tunnel.position = position.clone();
        tunnel.position.z += length / 2;
        tunnel.rotation.x = Math.PI / 2;
        
        const tunnelMat = new StandardMaterial('tunnelMat', this.scene);
        tunnelMat.diffuseColor = new Color3(0.05, 0.05, 0.06);
        tunnelMat.backFaceCulling = false;
        tunnel.material = tunnelMat;
        this.environmentMeshes.push(tunnel);
        meshes.push(tunnel);
        
        return meshes;
    }
    
    private createAbandonedTrains(): void {
        // Train car 1 - on tracks
        this.createTrainCar(new Vector3(-12, 1.5, -15), 0);
        
        // Train car 2 - derailed, blocking path
        this.createTrainCar(new Vector3(-10, 2, 45), 0.1);
    }
    
    private createTrainCar(position: Vector3, tilt: number): void {
        // Main body
        const body = MeshBuilder.CreateBox('trainBody', {
            width: 3.5,
            height: 3,
            depth: 20
        }, this.scene);
        body.position = position;
        body.rotation.z = tilt;
        
        const bodyMat = new StandardMaterial('trainBodyMat', this.scene);
        bodyMat.diffuseColor = new Color3(0.15, 0.1, 0.1);
        body.material = bodyMat;
        this.environmentMeshes.push(body);
        this.trains.push(body);
        
        // Windows (dark/broken)
        for (let i = -8; i <= 8; i += 4) {
            const window = MeshBuilder.CreateBox(`trainWindow_${i}`, {
                width: 3.6,
                height: 1,
                depth: 2
            }, this.scene);
            window.parent = body;
            window.position = new Vector3(0, 0.5, i);
            
            const windowMat = new StandardMaterial(`windowMat_${i}`, this.scene);
            windowMat.diffuseColor = new Color3(0.02, 0.02, 0.03);
            windowMat.emissiveColor = new Color3(0, 0.01, 0.02);
            window.material = windowMat;
            this.environmentMeshes.push(window);
        }
        
        // Corruption growing from train
        this.createCorruptionVines(position, 6);
    }
    
    private addMetroCorruption(): void {
        // Heavy vine coverage
        const vinePositions = [
            new Vector3(-5, 0, -20),
            new Vector3(5, 0, -10),
            new Vector3(-3, 0, 10),
            new Vector3(6, 0, 25),
            new Vector3(-4, 0, 40),
            new Vector3(3, 0, 55),
            new Vector3(-12, 0, 30),
            new Vector3(-12, 0, 50)
        ];
        
        vinePositions.forEach(pos => {
            this.createCorruptionVines(pos, 5 + Math.floor(Math.random() * 5));
        });
        
        // Flickering emergency lights
        const lightPositions = [
            new Vector3(-6, 4, -20),
            new Vector3(6, 4, -5),
            new Vector3(-6, 4, 15),
            new Vector3(6, 4, 35),
            new Vector3(-6, 4, 55),
            new Vector3(-15, 3, 20),
            new Vector3(-15, 3, 50)
        ];
        
        lightPositions.forEach(pos => {
            this.createEmergencyLight(pos);
        });
        
        // Organic growth on ceiling
        this.createCeilingGrowth();
    }
    
    private createCeilingGrowth(): void {
        for (let i = 0; i < 20; i++) {
            const growth = MeshBuilder.CreateSphere(`growth_${i}`, {
                diameter: 0.5 + Math.random() * 1
            }, this.scene);
            
            growth.position = new Vector3(
                (Math.random() - 0.5) * 12,
                7 + Math.random() * 2,
                (Math.random() - 0.5) * 80
            );
            
            const growthMat = new StandardMaterial(`growthMat_${i}`, this.scene);
            growthMat.diffuseColor = new Color3(0.1, 0.15, 0.1);
            growthMat.emissiveColor = new Color3(0, 0.03, 0.02);
            growth.material = growthMat;
            this.environmentMeshes.push(growth);
        }
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Ambush from darkness
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-10, 1, -10), count: 4 },
                    { type: 'demobat', position: new Vector3(0, 4, -5), count: 3 }
                ],
                delayBetweenSpawns: 600
            },
            // Wave 2 - From the tunnels
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-12, 1, 20), count: 5 },
                    { type: 'demobat', position: new Vector3(-12, 4, 25), count: 4 }
                ],
                delayBetweenSpawns: 500
            },
            // Wave 3 - Overwhelming
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(0, 1, 35), count: 6 },
                    { type: 'demobat', position: new Vector3(5, 5, 40), count: 5 }
                ],
                delayBetweenSpawns: 400
            },
            // Boss Wave - Demogorgon
            {
                enemies: [
                    { type: 'demogorgon', position: new Vector3(-10, 1, 55), count: 1 },
                    { type: 'demodog', position: new Vector3(-5, 1, 50), count: 3 }
                ],
                delayBetweenSpawns: 1000
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Train shaking effect during boss fight
        window.addEventListener('bossDialogue', (e: Event) => {
            this.shakeTrains();
        });
        
        // Start first wave
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 4000);
    }
    
    private shakeTrains(): void {
        this.trains.forEach(train => {
            let shakeTime = 0;
            const originalPos = train.position.clone();
            
            const shakeInterval = setInterval(() => {
                shakeTime += 0.1;
                train.position.x = originalPos.x + (Math.random() - 0.5) * 0.2;
                train.position.y = originalPos.y + (Math.random() - 0.5) * 0.1;
                
                if (shakeTime > 2) {
                    clearInterval(shakeInterval);
                    train.position = originalPos;
                }
            }, 50);
        });
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        // Progressive wave triggers
        const currentWave = this.enemyManager.getCurrentWave();
        
        if (currentWave === 1 && playerPosition.z > 5) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 2 && playerPosition.z > 25) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 3 && playerPosition.z > 45) {
            // Boss introduction
            window.dispatchEvent(new CustomEvent('bossIncoming', {
                detail: { boss: 'Demogorgon', message: 'Something massive approaches...' }
            }));
            this.enemyManager.startNextWave();
        }
    }
}

export default Level2_Metro;
