/**
 * SAVE ISMAEL - Level 4: Dubai Marina
 * The waterfront turned nightmare
 * BOSS LEVEL: Mind Flayer
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

export class Level4_Marina extends Level {
    private buildings: Mesh[] = [];
    private waterSurface: Mesh | null = null;
    private promenade: Mesh | null = null;
    private boats: Mesh[] = [];
    private bossArena: Mesh | null = null;
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 4,
            name: 'DUBAI MARINA',
            subtitle: 'The Palace',
            location: 'Marina Waterfront',
            description: 'The luxury waterfront has become the Mind Flayer\'s domain.',
            ambientColor: new Color3(0.05, 0.02, 0.08),
            fogColor: new Color3(0.03, 0.01, 0.05),
            fogDensity: 0.02,
            evidenceItem: 'Watch (Stopped)',
            evidenceDescription: 'Uncle\'s watch. Time stopped at 7:42 PM - the exact moment he crossed over.',
            mammooMessage: 'Aidan... my watch stopped... 7:42... that\'s when everything changed... there\'s something here... something huge... it\'s in my head... it knows you\'re coming...',
            duration: { min: 12, max: 18 },
            hasBoss: true,
            bossType: 'mindflayer'
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -50);
        this.exitPoint = new Vector3(0, 1, 100);
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(15, 0.5, 20) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Create corrupted water
        this.createCorruptedWater();
        
        // Create promenade walkway
        this.createPromenade();
        
        // Create twisted skyscrapers
        this.createMarinaBuildings();
        
        // Create abandoned boats
        this.createAbandonedBoats();
        
        // Create boss arena
        this.createBossArena();
        
        // Add heavy corruption
        this.addMarinaCorruption();
    }
    
    private createCorruptedWater(): void {
        // Black corrupted water
        this.waterSurface = MeshBuilder.CreateGround('water', {
            width: 200,
            height: 200
        }, this.scene);
        this.waterSurface.position = new Vector3(0, -0.5, 30);
        
        const waterMat = new StandardMaterial('waterMat', this.scene);
        waterMat.diffuseColor = new Color3(0.02, 0.02, 0.04);
        waterMat.specularColor = new Color3(0.1, 0.1, 0.15);
        waterMat.emissiveColor = new Color3(0, 0.01, 0.02);
        waterMat.alpha = 0.9;
        this.waterSurface.material = waterMat;
        this.environmentMeshes.push(this.waterSurface);
        
        // Animated water ripples
        let time = 0;
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.waterSurface) {
                time += 0.01;
                // Simple wave effect
                this.waterSurface.position.y = -0.5 + Math.sin(time) * 0.1;
            }
        });
        
        // Things moving under the water
        for (let i = 0; i < 10; i++) {
            const shadow = MeshBuilder.CreateSphere(`waterShadow_${i}`, {
                diameter: 2 + Math.random() * 4
            }, this.scene);
            shadow.position = new Vector3(
                (Math.random() - 0.5) * 100,
                -2,
                (Math.random() - 0.5) * 100 + 30
            );
            
            const shadowMat = new StandardMaterial(`shadowMat_${i}`, this.scene);
            shadowMat.diffuseColor = new Color3(0.01, 0.01, 0.02);
            shadowMat.alpha = 0.6;
            shadow.material = shadowMat;
            this.environmentMeshes.push(shadow);
            
            // Move underwater shadows
            const speed = 0.2 + Math.random() * 0.3;
            this.scene.onBeforeRenderObservable.add(() => {
                shadow.position.x += speed;
                if (shadow.position.x > 100) shadow.position.x = -100;
            });
        }
    }
    
    private createPromenade(): void {
        // Main walkway along the water
        this.promenade = MeshBuilder.CreateBox('promenade', {
            width: 15,
            height: 1,
            depth: 150
        }, this.scene);
        this.promenade.position = new Vector3(25, 0.5, 25);
        
        const promMat = new StandardMaterial('promMat', this.scene);
        promMat.diffuseColor = new Color3(0.15, 0.12, 0.1);
        promMat.specularColor = new Color3(0.2, 0.2, 0.25);
        this.promenade.material = promMat;
        this.environmentMeshes.push(this.promenade);
        
        // Railing
        const railing = MeshBuilder.CreateBox('railing', {
            width: 0.2,
            height: 1.5,
            depth: 150
        }, this.scene);
        railing.position = new Vector3(17.5, 1.5, 25);
        
        const railMat = new StandardMaterial('railMat', this.scene);
        railMat.diffuseColor = new Color3(0.2, 0.2, 0.25);
        railing.material = railMat;
        this.environmentMeshes.push(railing);
        
        // Lampposts (broken)
        for (let z = -40; z <= 90; z += 15) {
            this.createBrokenLamppost(new Vector3(28, 0, z));
        }
        
        // Benches (overturned)
        for (let z = -30; z <= 80; z += 20) {
            this.createOverturnedBench(new Vector3(22, 0, z));
        }
    }
    
    private createBrokenLamppost(position: Vector3): void {
        const post = MeshBuilder.CreateCylinder('lamppost', {
            height: 4,
            diameter: 0.3,
            tessellation: 12
        }, this.scene);
        post.position = position.clone();
        post.position.y = 2;
        post.rotation.z = (Math.random() - 0.5) * 0.3;
        
        const postMat = new StandardMaterial('postMat', this.scene);
        postMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
        post.material = postMat;
        this.environmentMeshes.push(post);
        
        // Flickering light (50% chance)
        if (Math.random() > 0.5) {
            const light = new PointLight(`lampLight_${position.z}`, 
                new Vector3(position.x, 4.5, position.z), this.scene);
            light.diffuse = new Color3(1, 0.8, 0.5);
            light.intensity = 1;
            light.range = 8;
            
            // Flicker
            this.scene.onBeforeRenderObservable.add(() => {
                light.intensity = Math.random() > 0.9 ? 0 : 0.5 + Math.random() * 0.5;
            });
            
            this.lights.push(light);
        }
    }
    
    private createOverturnedBench(position: Vector3): void {
        const bench = MeshBuilder.CreateBox('bench', {
            width: 2,
            height: 0.4,
            depth: 0.8
        }, this.scene);
        bench.position = position.clone();
        bench.position.y = 0.5;
        bench.rotation.z = Math.PI * 0.4;
        bench.rotation.y = (Math.random() - 0.5) * 0.5;
        
        const benchMat = new StandardMaterial('benchMat', this.scene);
        benchMat.diffuseColor = new Color3(0.2, 0.15, 0.1);
        bench.material = benchMat;
        this.environmentMeshes.push(bench);
    }
    
    private createMarinaBuildings(): void {
        // Iconic twisted towers
        const buildingConfigs = [
            { pos: new Vector3(50, 0, -30), height: 80, twist: 0.3 },
            { pos: new Vector3(60, 0, 0), height: 100, twist: -0.2 },
            { pos: new Vector3(55, 0, 40), height: 90, twist: 0.25 },
            { pos: new Vector3(65, 0, 70), height: 85, twist: -0.15 },
            { pos: new Vector3(-40, 0, 20), height: 70, twist: 0.2 },
            { pos: new Vector3(-50, 0, 60), height: 95, twist: -0.25 }
        ];
        
        buildingConfigs.forEach((config, index) => {
            this.createTwistedTower(config.pos, config.height, config.twist, index);
        });
    }
    
    private createTwistedTower(position: Vector3, height: number, twist: number, index: number): void {
        const segments = 10;
        const segmentHeight = height / segments;
        
        for (let i = 0; i < segments; i++) {
            const segment = MeshBuilder.CreateBox(`tower_${index}_${i}`, {
                width: 12 - i * 0.3,
                height: segmentHeight,
                depth: 12 - i * 0.3
            }, this.scene);
            
            segment.position = position.clone();
            segment.position.y = i * segmentHeight + segmentHeight / 2;
            segment.rotation.y = i * twist;
            
            const segMat = new StandardMaterial(`towerMat_${index}_${i}`, this.scene);
            // Gradient from dark to slightly lighter
            const shade = 0.08 + (i / segments) * 0.07;
            segMat.diffuseColor = new Color3(shade, shade, shade + 0.02);
            segMat.emissiveColor = new Color3(0, 0, 0.01);
            segment.material = segMat;
            this.environmentMeshes.push(segment);
            this.buildings.push(segment);
            
            // Random lit windows
            if (Math.random() > 0.7) {
                const windowLight = MeshBuilder.CreateBox(`window_${index}_${i}`, {
                    width: 1,
                    height: 0.5,
                    depth: 0.1
                }, this.scene);
                windowLight.parent = segment;
                windowLight.position = new Vector3(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 3,
                    6
                );
                
                const winMat = new StandardMaterial(`winMat_${index}_${i}`, this.scene);
                winMat.emissiveColor = new Color3(
                    Math.random() > 0.5 ? 0.5 : 0,
                    0,
                    Math.random() > 0.5 ? 0.3 : 0
                );
                windowLight.material = winMat;
                this.environmentMeshes.push(windowLight);
            }
        }
    }
    
    private createAbandonedBoats(): void {
        const boatPositions = [
            new Vector3(5, 0, -20),
            new Vector3(-5, 0, 10),
            new Vector3(10, 0, 45),
            new Vector3(-10, 0, 70)
        ];
        
        boatPositions.forEach((pos, index) => {
            this.createBoat(pos, index);
        });
    }
    
    private createBoat(position: Vector3, index: number): void {
        // Hull
        const hull = MeshBuilder.CreateCylinder(`boat_${index}`, {
            height: 8,
            diameterTop: 2,
            diameterBottom: 1,
            tessellation: 12
        }, this.scene);
        hull.position = position.clone();
        hull.position.y = 0.2;
        hull.rotation.x = Math.PI / 2;
        hull.rotation.z = (Math.random() - 0.5) * 0.3;
        
        const hullMat = new StandardMaterial(`hullMat_${index}`, this.scene);
        hullMat.diffuseColor = new Color3(0.15, 0.12, 0.1);
        hull.material = hullMat;
        this.environmentMeshes.push(hull);
        this.boats.push(hull);
        
        // Corruption on boats
        this.createCorruptionVines(position, 4);
    }
    
    private createBossArena(): void {
        // Circular platform over the water
        this.bossArena = MeshBuilder.CreateCylinder('bossArena', {
            height: 1,
            diameter: 40,
            tessellation: 32
        }, this.scene);
        this.bossArena.position = new Vector3(0, 0.5, 70);
        
        const arenaMat = new StandardMaterial('arenaMat', this.scene);
        arenaMat.diffuseColor = new Color3(0.1, 0.08, 0.12);
        arenaMat.emissiveColor = new Color3(0.02, 0, 0.03);
        this.bossArena.material = arenaMat;
        this.environmentMeshes.push(this.bossArena);
        
        // Corrupted pillars around arena
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillar = MeshBuilder.CreateCylinder(`arenaPillar_${i}`, {
                height: 8,
                diameter: 1.5,
                tessellation: 12
            }, this.scene);
            
            pillar.position = new Vector3(
                Math.cos(angle) * 18,
                4.5,
                70 + Math.sin(angle) * 18
            );
            
            const pillarMat = new StandardMaterial(`pillarMat_${i}`, this.scene);
            pillarMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
            pillar.material = pillarMat;
            this.environmentMeshes.push(pillar);
            
            // Corruption on pillars
            this.createCorruptionVines(pillar.position.clone(), 5);
            
            // Ominous lights
            const pillarLight = new PointLight(`pillarLight_${i}`, 
                new Vector3(pillar.position.x, 9, pillar.position.z), this.scene);
            pillarLight.diffuse = new Color3(0.5, 0, 0.6);
            pillarLight.intensity = 1;
            pillarLight.range = 10;
            this.lights.push(pillarLight);
        }
        
        // Central corruption nexus
        const nexus = MeshBuilder.CreateSphere('nexus', {
            diameter: 3
        }, this.scene);
        nexus.position = new Vector3(0, 5, 70);
        
        const nexusMat = new StandardMaterial('nexusMat', this.scene);
        nexusMat.emissiveColor = new Color3(0.3, 0, 0.4);
        nexus.material = nexusMat;
        this.environmentMeshes.push(nexus);
        
        // Pulsing animation
        this.scene.onBeforeRenderObservable.add(() => {
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            nexus.scaling = new Vector3(scale, scale, scale);
        });
    }
    
    private addMarinaCorruption(): void {
        // Heavy corruption everywhere
        const vinePositions: Vector3[] = [];
        
        // Along promenade
        for (let z = -40; z <= 90; z += 10) {
            vinePositions.push(new Vector3(25, 0, z));
        }
        
        // Around water edges
        for (let i = 0; i < 20; i++) {
            vinePositions.push(new Vector3(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random()) * 120 - 40
            ));
        }
        
        vinePositions.forEach(pos => {
            this.createCorruptionVines(pos, 4 + Math.floor(Math.random() * 4));
        });
        
        // Spore clouds
        for (let i = 0; i < 15; i++) {
            this.createSporeCloud(new Vector3(
                (Math.random() - 0.5) * 80,
                3 + Math.random() * 5,
                (Math.random()) * 140 - 50
            ));
        }
    }
    
    private createSporeCloud(position: Vector3): void {
        const cloud = MeshBuilder.CreateSphere('sporeCloud', {
            diameter: 2 + Math.random() * 3
        }, this.scene);
        cloud.position = position;
        
        const cloudMat = new StandardMaterial('cloudMat', this.scene);
        cloudMat.diffuseColor = new Color3(0.1, 0.15, 0.1);
        cloudMat.emissiveColor = new Color3(0, 0.05, 0.02);
        cloudMat.alpha = 0.4;
        cloud.material = cloudMat;
        this.environmentMeshes.push(cloud);
        
        // Drift animation
        const startPos = position.clone();
        this.scene.onBeforeRenderObservable.add(() => {
            cloud.position.y = startPos.y + Math.sin(Date.now() * 0.001) * 1;
            cloud.position.x = startPos.x + Math.sin(Date.now() * 0.0005) * 2;
        });
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Promenade ambush
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(25, 1, -30), count: 5 },
                    { type: 'demobat', position: new Vector3(20, 5, -20), count: 4 }
                ],
                delayBetweenSpawns: 500
            },
            // Wave 2 - From the water
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(10, 1, 0), count: 6 },
                    { type: 'demobat', position: new Vector3(0, 6, 10), count: 5 }
                ],
                delayBetweenSpawns: 400
            },
            // Wave 3 - Building the dread
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(15, 1, 30), count: 6 },
                    { type: 'demobat', position: new Vector3(5, 7, 35), count: 6 },
                    { type: 'demogorgon', position: new Vector3(0, 1, 40), count: 1 }
                ],
                delayBetweenSpawns: 600
            },
            // Wave 4 - Arena approach
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-5, 1, 55), count: 4 },
                    { type: 'demobat', position: new Vector3(5, 8, 60), count: 4 }
                ],
                delayBetweenSpawns: 300
            },
            // BOSS WAVE - Mind Flayer
            {
                enemies: [
                    { type: 'mindflayer', position: new Vector3(0, 5, 70), count: 1 }
                ],
                delayBetweenSpawns: 0,
                onWaveComplete: () => {
                    window.dispatchEvent(new CustomEvent('bossDefeated', {
                        detail: { boss: 'MindFlayer', level: 4 }
                    }));
                }
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Mind Flayer introduction
        window.addEventListener('bossIncoming', () => {
            this.triggerMindFlayerIntro();
        }, { once: true });
        
        // Start first wave
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 5000);
    }
    
    private triggerMindFlayerIntro(): void {
        // Dramatic introduction
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: {
                speaker: 'MIND FLAYER',
                text: 'Ah... another mind enters my domain.',
                important: true
            }
        }));
        
        // Darken environment
        this.scene.fogDensity = 0.04;
        
        // Lights flicker off
        this.lights.forEach(light => {
            if (light.intensity) {
                light.intensity *= 0.3;
            }
        });
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        const currentWave = this.enemyManager.getCurrentWave();
        
        // Progressive triggers
        if (currentWave === 1 && playerPosition.z > -10) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 2 && playerPosition.z > 20) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 3 && playerPosition.z > 45) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 4 && playerPosition.z > 60) {
            // Boss introduction
            window.dispatchEvent(new CustomEvent('bossIncoming', {
                detail: { boss: 'Mind Flayer' }
            }));
            this.enemyManager.startNextWave();
        }
        
        // Arena effects when in boss fight
        if (currentWave === 5) {
            // Pulsing arena lighting
            const pulse = Math.sin(Date.now() * 0.003);
            this.lights.forEach(light => {
                if (light.diffuse && light.diffuse.r > 0.3) {
                    light.intensity = 1 + pulse * 0.5;
                }
            });
        }
    }
}

export default Level4_Marina;
