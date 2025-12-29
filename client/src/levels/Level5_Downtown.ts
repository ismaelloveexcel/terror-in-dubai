/**
 * SAVE ISMAEL - Level 5: Downtown Dubai
 * The commercial heart - now corrupted wasteland
 * Find Uncle Ismael - he's close!
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

export class Level5_Downtown extends Level {
    private dubaiMall: Mesh | null = null;
    private boulevard: Mesh | null = null;
    private fountains: Mesh[] = [];
    private souk: Mesh[] = [];
    private burjKhalifaSilhouette: Mesh | null = null;
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 5,
            name: 'DOWNTOWN DUBAI',
            subtitle: 'Almost There',
            location: 'Dubai Mall Boulevard',
            description: 'The heart of Dubai. Uncle Ismael is close - you can feel it.',
            ambientColor: new Color3(0.04, 0.03, 0.06),
            fogColor: new Color3(0.02, 0.02, 0.04),
            fogDensity: 0.018,
            evidenceItem: 'Gift Bag + Note',
            evidenceDescription: 'Stranger Things merchandise - your birthday gift. Note: "For my favorite monster hunter. Can\'t wait for movie night."',
            mammooMessage: 'Aidan... I got you something... for your birthday... Stranger Things stuff... I thought we could... he\'s taking me to the tower... Burj Khalifa... please... I\'m so close...',
            duration: { min: 10, max: 15 },
            hasBoss: false
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -60);
        this.exitPoint = new Vector3(0, 1, 100);
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(-10, 0.5, 50) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Create the boulevard
        this.createBoulevard();
        
        // Create Dubai Mall entrance
        this.createDubaiMall();
        
        // Create corrupted fountains (Dubai Fountain area)
        this.createCorruptedFountains();
        
        // Create Souk Al Bahar area
        this.createSoukArea();
        
        // Create Burj Khalifa silhouette in distance
        this.createBurjKhalifaSilhouette();
        
        // Add corruption
        this.addDowntownCorruption();
    }
    
    private createBoulevard(): void {
        // Main boulevard street
        this.boulevard = MeshBuilder.CreateBox('boulevard', {
            width: 30,
            height: 0.5,
            depth: 180
        }, this.scene);
        this.boulevard.position = new Vector3(0, 0.25, 20);
        
        const boulMat = new StandardMaterial('boulMat', this.scene);
        boulMat.diffuseColor = new Color3(0.12, 0.1, 0.08);
        boulMat.specularColor = new Color3(0.2, 0.2, 0.25);
        this.boulevard.material = boulMat;
        this.environmentMeshes.push(this.boulevard);
        
        // Sidewalks
        for (let side = -1; side <= 1; side += 2) {
            const sidewalk = MeshBuilder.CreateBox(`sidewalk_${side}`, {
                width: 8,
                height: 0.6,
                depth: 180
            }, this.scene);
            sidewalk.position = new Vector3(side * 19, 0.3, 20);
            
            const sideMat = new StandardMaterial(`sideMat_${side}`, this.scene);
            sideMat.diffuseColor = new Color3(0.15, 0.13, 0.1);
            sidewalk.material = sideMat;
            this.environmentMeshes.push(sidewalk);
        }
        
        // Street lights (dead)
        for (let z = -50; z <= 90; z += 15) {
            this.createDeadStreetLight(new Vector3(-12, 0, z));
            this.createDeadStreetLight(new Vector3(12, 0, z));
        }
        
        // Abandoned cars
        this.createAbandonedCars();
    }
    
    private createDeadStreetLight(position: Vector3): void {
        const pole = MeshBuilder.CreateCylinder('pole', {
            height: 6,
            diameter: 0.2,
            tessellation: 12
        }, this.scene);
        pole.position = position.clone();
        pole.position.y = 3;
        
        const poleMat = new StandardMaterial('poleMat', this.scene);
        poleMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
        pole.material = poleMat;
        this.environmentMeshes.push(pole);
        
        // Arm
        const arm = MeshBuilder.CreateCylinder('arm', {
            height: 2,
            diameter: 0.15,
            tessellation: 8
        }, this.scene);
        arm.parent = pole;
        arm.position = new Vector3(0.8, 2.5, 0);
        arm.rotation.z = Math.PI / 2;
        arm.material = poleMat;
        this.environmentMeshes.push(arm);
    }
    
    private createAbandonedCars(): void {
        const carPositions = [
            { pos: new Vector3(-5, 0, -40), rot: 0.2 },
            { pos: new Vector3(8, 0, -25), rot: -0.3 },
            { pos: new Vector3(-7, 0, 5), rot: 0.5 },
            { pos: new Vector3(6, 0, 30), rot: -0.1 },
            { pos: new Vector3(-3, 0, 60), rot: 0.4 },
            { pos: new Vector3(9, 0, 75), rot: -0.6 }
        ];
        
        carPositions.forEach((config, index) => {
            this.createAbandonedCar(config.pos, config.rot, index);
        });
    }
    
    private createAbandonedCar(position: Vector3, rotation: number, index: number): void {
        // Simple car body
        const body = MeshBuilder.CreateBox(`car_${index}`, {
            width: 2,
            height: 1.2,
            depth: 4
        }, this.scene);
        body.position = position.clone();
        body.position.y = 0.8;
        body.rotation.y = rotation;
        
        const bodyMat = new StandardMaterial(`carMat_${index}`, this.scene);
        bodyMat.diffuseColor = new Color3(
            0.1 + Math.random() * 0.1,
            0.1 + Math.random() * 0.1,
            0.1 + Math.random() * 0.1
        );
        body.material = bodyMat;
        this.environmentMeshes.push(body);
        
        // Cabin
        const cabin = MeshBuilder.CreateBox(`cabin_${index}`, {
            width: 1.8,
            height: 0.8,
            depth: 2
        }, this.scene);
        cabin.parent = body;
        cabin.position.y = 0.9;
        cabin.position.z = -0.3;
        
        const cabinMat = new StandardMaterial(`cabinMat_${index}`, this.scene);
        cabinMat.diffuseColor = new Color3(0.02, 0.02, 0.03);
        cabin.material = cabinMat;
        this.environmentMeshes.push(cabin);
        
        // Corruption on some cars
        if (Math.random() > 0.5) {
            this.createCorruptionVines(position, 3);
        }
    }
    
    private createDubaiMall(): void {
        // Main entrance facade
        this.dubaiMall = MeshBuilder.CreateBox('dubaiMall', {
            width: 60,
            height: 20,
            depth: 10
        }, this.scene);
        this.dubaiMall.position = new Vector3(-40, 10, 0);
        
        const mallMat = new StandardMaterial('mallMat', this.scene);
        mallMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        this.dubaiMall.material = mallMat;
        this.environmentMeshes.push(this.dubaiMall);
        
        // Glass facade (broken)
        for (let x = -25; x <= 25; x += 5) {
            for (let y = 2; y <= 16; y += 4) {
                const glass = MeshBuilder.CreateBox(`mallGlass_${x}_${y}`, {
                    width: 4,
                    height: 3,
                    depth: 0.3
                }, this.scene);
                glass.position = new Vector3(-40 + 5.1, y, x);
                glass.rotation.y = Math.PI / 2;
                
                const glassMat = new StandardMaterial(`glassMat_${x}_${y}`, this.scene);
                glassMat.diffuseColor = new Color3(0.05, 0.08, 0.1);
                glassMat.alpha = 0.4 + Math.random() * 0.2;
                glass.material = glassMat;
                this.environmentMeshes.push(glass);
            }
        }
        
        // Entrance doors (broken open)
        const entrance = MeshBuilder.CreateBox('entrance', {
            width: 15,
            height: 8,
            depth: 2
        }, this.scene);
        entrance.position = new Vector3(-35, 4, 0);
        
        const entranceMat = new StandardMaterial('entranceMat', this.scene);
        entranceMat.diffuseColor = new Color3(0.02, 0.02, 0.03);
        entrance.material = entranceMat;
        this.environmentMeshes.push(entrance);
    }
    
    private createCorruptedFountains(): void {
        // Dubai Fountain lake area
        const lake = MeshBuilder.CreateGround('fountainLake', {
            width: 50,
            height: 30
        }, this.scene);
        lake.position = new Vector3(30, -0.3, 30);
        
        const lakeMat = new StandardMaterial('lakeMat', this.scene);
        lakeMat.diffuseColor = new Color3(0.02, 0.02, 0.04);
        lakeMat.specularColor = new Color3(0.1, 0.1, 0.15);
        lakeMat.emissiveColor = new Color3(0, 0.01, 0.02);
        lake.material = lakeMat;
        this.environmentMeshes.push(lake);
        
        // Fountain jets (corrupted - shooting black water upward)
        for (let i = 0; i < 10; i++) {
            const jet = MeshBuilder.CreateCylinder(`jet_${i}`, {
                height: 5 + Math.random() * 10,
                diameterTop: 0.1,
                diameterBottom: 0.5,
                tessellation: 8
            }, this.scene);
            
            jet.position = new Vector3(
                30 + (Math.random() - 0.5) * 40,
                2.5 + Math.random() * 5,
                30 + (Math.random() - 0.5) * 20
            );
            
            const jetMat = new StandardMaterial(`jetMat_${i}`, this.scene);
            jetMat.diffuseColor = new Color3(0.02, 0.03, 0.05);
            jetMat.emissiveColor = new Color3(0, 0.02, 0.03);
            jetMat.alpha = 0.7;
            jet.material = jetMat;
            this.environmentMeshes.push(jet);
            this.fountains.push(jet);
            
            // Animate
            const baseHeight = jet.scaling.y;
            this.scene.onBeforeRenderObservable.add(() => {
                jet.scaling.y = baseHeight + Math.sin(Date.now() * 0.002 + i) * 0.3;
            });
        }
    }
    
    private createSoukArea(): void {
        // Souk Al Bahar inspired area
        const soukBase = MeshBuilder.CreateBox('soukBase', {
            width: 40,
            height: 15,
            depth: 25
        }, this.scene);
        soukBase.position = new Vector3(50, 7.5, 60);
        
        const soukMat = new StandardMaterial('soukMat', this.scene);
        soukMat.diffuseColor = new Color3(0.15, 0.12, 0.08);
        soukBase.material = soukMat;
        this.environmentMeshes.push(soukBase);
        this.souk.push(soukBase);
        
        // Traditional arches
        for (let x = 35; x <= 65; x += 10) {
            this.createTraditionalArch(new Vector3(x, 0, 47));
        }
        
        // Market stalls (abandoned)
        for (let i = 0; i < 6; i++) {
            this.createAbandonedStall(new Vector3(
                35 + i * 8,
                0,
                50
            ), i);
        }
    }
    
    private createTraditionalArch(position: Vector3): void {
        // Simple arch shape
        const leftPillar = MeshBuilder.CreateCylinder('archPillar', {
            height: 6,
            diameter: 1,
            tessellation: 12
        }, this.scene);
        leftPillar.position = position.clone();
        leftPillar.position.x -= 2;
        leftPillar.position.y = 3;
        
        const archMat = new StandardMaterial('archMat', this.scene);
        archMat.diffuseColor = new Color3(0.2, 0.15, 0.1);
        leftPillar.material = archMat;
        this.environmentMeshes.push(leftPillar);
        
        const rightPillar = leftPillar.clone();
        rightPillar.position.x = position.x + 2;
        this.environmentMeshes.push(rightPillar);
        
        // Top curve
        const top = MeshBuilder.CreateTorus('archTop', {
            diameter: 4,
            thickness: 0.8,
            tessellation: 16
        }, this.scene);
        top.position = position.clone();
        top.position.y = 6;
        top.rotation.x = Math.PI / 2;
        top.scaling.y = 0.5;
        top.material = archMat;
        this.environmentMeshes.push(top);
    }
    
    private createAbandonedStall(position: Vector3, index: number): void {
        const stall = MeshBuilder.CreateBox(`stall_${index}`, {
            width: 3,
            height: 2.5,
            depth: 3
        }, this.scene);
        stall.position = position.clone();
        stall.position.y = 1.25;
        stall.rotation.y = (Math.random() - 0.5) * 0.3;
        
        const stallMat = new StandardMaterial(`stallMat_${index}`, this.scene);
        stallMat.diffuseColor = new Color3(0.12, 0.1, 0.08);
        stall.material = stallMat;
        this.environmentMeshes.push(stall);
    }
    
    private createBurjKhalifaSilhouette(): void {
        // Distant silhouette of Burj Khalifa - the final destination
        this.burjKhalifaSilhouette = MeshBuilder.CreateCylinder('burjSilhouette', {
            height: 200,
            diameterTop: 2,
            diameterBottom: 15,
            tessellation: 24
        }, this.scene);
        this.burjKhalifaSilhouette.position = new Vector3(0, 100, 200);
        
        const burjMat = new StandardMaterial('burjMat', this.scene);
        burjMat.diffuseColor = new Color3(0.03, 0.03, 0.05);
        burjMat.emissiveColor = new Color3(0.01, 0, 0.02);
        this.burjKhalifaSilhouette.material = burjMat;
        this.environmentMeshes.push(this.burjKhalifaSilhouette);
        
        // Ominous glow at top
        const glow = new PointLight('burjGlow', new Vector3(0, 200, 200), this.scene);
        glow.diffuse = new Color3(1, 0, 0);
        glow.intensity = 5;
        glow.range = 50;
        this.lights.push(glow);
        
        // Pulsing
        this.scene.onBeforeRenderObservable.add(() => {
            glow.intensity = 3 + Math.sin(Date.now() * 0.002) * 2;
        });
    }
    
    private addDowntownCorruption(): void {
        // Heavy corruption - this is Vecna's territory
        const vinePositions: Vector3[] = [];
        
        // Along boulevard
        for (let z = -50; z <= 90; z += 8) {
            vinePositions.push(new Vector3(-15, 0, z));
            vinePositions.push(new Vector3(15, 0, z));
        }
        
        // Around mall
        for (let i = 0; i < 10; i++) {
            vinePositions.push(new Vector3(
                -40 + Math.random() * 20,
                0,
                (Math.random() - 0.5) * 30
            ));
        }
        
        vinePositions.forEach(pos => {
            this.createCorruptionVines(pos, 5 + Math.floor(Math.random() * 5));
        });
        
        // Emergency lights
        const lightPositions = [
            new Vector3(-35, 4, 0),
            new Vector3(-10, 3, -30),
            new Vector3(10, 3, 10),
            new Vector3(-8, 3, 40),
            new Vector3(12, 3, 70)
        ];
        
        lightPositions.forEach(pos => {
            this.createEmergencyLight(pos);
        });
        
        // Wall message - "ALMOST THERE"
        this.createLightsWallMessage();
    }
    
    private createLightsWallMessage(): void {
        // Message will appear on Dubai Mall wall
        window.addEventListener('waveComplete', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.wave === 3) {
                window.dispatchEvent(new CustomEvent('lightsWallMessage', {
                    detail: {
                        message: 'ALMOST THERE',
                        position: new Vector3(-34, 10, 0)
                    }
                }));
            }
        });
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Street encounter
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-5, 1, -40), count: 5 },
                    { type: 'demobat', position: new Vector3(5, 5, -35), count: 4 }
                ],
                delayBetweenSpawns: 400
            },
            // Wave 2 - Mall area
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-30, 1, -10), count: 6 },
                    { type: 'demobat', position: new Vector3(-35, 8, 0), count: 5 },
                    { type: 'demogorgon', position: new Vector3(-35, 1, 5), count: 1 }
                ],
                delayBetweenSpawns: 500
            },
            // Wave 3 - Fountain area
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(20, 1, 20), count: 7 },
                    { type: 'demobat', position: new Vector3(30, 6, 30), count: 6 }
                ],
                delayBetweenSpawns: 300
            },
            // Wave 4 - Souk area gauntlet
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(40, 1, 50), count: 6 },
                    { type: 'demobat', position: new Vector3(50, 7, 55), count: 5 },
                    { type: 'demogorgon', position: new Vector3(45, 1, 60), count: 1 }
                ],
                delayBetweenSpawns: 400
            },
            // Wave 5 - Final push to exit
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(0, 1, 80), count: 8 },
                    { type: 'demobat', position: new Vector3(0, 8, 85), count: 7 }
                ],
                delayBetweenSpawns: 200
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Uncle Ismael sighting event
        window.addEventListener('waveComplete', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.wave === 4) {
                this.triggerUncleISighting();
            }
        });
        
        // Start first wave
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 4000);
    }
    
    private triggerUncleISighting(): void {
        window.dispatchEvent(new CustomEvent('storyEvent', {
            detail: {
                type: 'uncleSighting',
                message: 'In the distance, towards the Burj Khalifa, you see a figure being dragged by shadows...',
                voiceLine: 'AIDAN! I\'M HERE! DON\'T GIVE UP!'
            }
        }));
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        const currentWave = this.enemyManager.getCurrentWave();
        
        // Progressive triggers
        if (currentWave === 1 && playerPosition.z > -20) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 2 && playerPosition.z > 15) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 3 && playerPosition.z > 45) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 4 && playerPosition.z > 70) {
            this.enemyManager.startNextWave();
        }
        
        // As player approaches exit, Burj Khalifa glow intensifies
        if (playerPosition.z > 60) {
            const intensity = (playerPosition.z - 60) / 40;
            this.lights.forEach(light => {
                if (light.diffuse && light.diffuse.r === 1) {
                    light.intensity = 3 + intensity * 5;
                }
            });
        }
    }
}

export default Level5_Downtown;
