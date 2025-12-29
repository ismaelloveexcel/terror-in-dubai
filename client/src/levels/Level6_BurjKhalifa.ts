/**
 * SAVE ISMAEL - Level 6: Burj Khalifa
 * The Final Battle - Vecna's Throne
 * FINAL BOSS: VECNA
 */

import { 
    Scene, 
    Vector3, 
    MeshBuilder, 
    StandardMaterial, 
    Color3,
    Color4,
    PointLight,
    Mesh,
    ParticleSystem
} from '@babylonjs/core';
import { Level, LevelConfig } from './Level';

export class Level6_BurjKhalifa extends Level {
    private tower: Mesh[] = [];
    private observationDeck: Mesh | null = null;
    private throne: Mesh | null = null;
    private uncleIsmael: Mesh | null = null;
    private voidPortal: Mesh | null = null;
    private finalArena: Mesh | null = null;
    private vecnaSpawned: boolean = false;
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 6,
            name: 'BURJ KHALIFA',
            subtitle: 'The Final Battle',
            location: 'At The Top - Level 148',
            description: 'Vecna\'s throne. Uncle Ismael is here. This ends now.',
            ambientColor: new Color3(0.03, 0.01, 0.05),
            fogColor: new Color3(0.02, 0, 0.04),
            fogDensity: 0.008,
            evidenceItem: 'Final Recording',
            evidenceDescription: 'Uncle\'s last message: "Aidan, if you\'re hearing this, I\'m proud of you. Use our memories. That\'s how you beat him. Love you, kid."',
            mammooMessage: 'Aidan... I\'m at the top... Vecna has me... he wants to use me to get to you... but I know you\'re stronger... remember what I taught you... memories are power... love is power... use them...',
            duration: { min: 15, max: 25 },
            hasBoss: true,
            bossType: 'vecna'
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -40);
        this.exitPoint = new Vector3(0, 1, 0); // Exit is the victory point
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(-15, 1, 20) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Create the observation deck area
        this.createObservationArea();
        
        // Create Vecna's throne
        this.createVecnaThrone();
        
        // Create the void portal backdrop
        this.createVoidPortal();
        
        // Create Uncle Ismael (captive)
        this.createUncleIsmael();
        
        // Create the final arena
        this.createFinalArena();
        
        // Add corruption - maximum level
        this.addFinalCorruption();
    }
    
    private createObservationArea(): void {
        // Main floor
        this.observationDeck = MeshBuilder.CreateCylinder('observationDeck', {
            height: 1,
            diameter: 80,
            tessellation: 48
        }, this.scene);
        this.observationDeck.position = new Vector3(0, 0.5, 0);
        
        const floorMat = new StandardMaterial('floorMat', this.scene);
        floorMat.diffuseColor = new Color3(0.05, 0.03, 0.08);
        floorMat.specularColor = new Color3(0.15, 0.1, 0.2);
        floorMat.emissiveColor = new Color3(0.02, 0, 0.03);
        this.observationDeck.material = floorMat;
        this.environmentMeshes.push(this.observationDeck);
        
        // Glass walls (shattered)
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const glassPanel = MeshBuilder.CreateBox(`glass_${i}`, {
                width: 0.3,
                height: 5 + Math.random() * 3,
                depth: 10
            }, this.scene);
            
            glassPanel.position = new Vector3(
                Math.cos(angle) * 38,
                3,
                Math.sin(angle) * 38
            );
            glassPanel.rotation.y = angle;
            
            const glassMat = new StandardMaterial(`glassMat_${i}`, this.scene);
            glassMat.diffuseColor = new Color3(0.05, 0.08, 0.1);
            glassMat.alpha = 0.3 + Math.random() * 0.3;
            glassPanel.material = glassMat;
            this.environmentMeshes.push(glassPanel);
        }
        
        // Corrupted pillars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.createCorruptedPillar(new Vector3(
                Math.cos(angle) * 30,
                0,
                Math.sin(angle) * 30
            ), i);
        }
        
        // Tower structure visible above
        this.createTowerStructure();
    }
    
    private createCorruptedPillar(position: Vector3, index: number): void {
        const pillar = MeshBuilder.CreateCylinder(`pillar_${index}`, {
            height: 12,
            diameter: 2,
            tessellation: 12
        }, this.scene);
        pillar.position = position.clone();
        pillar.position.y = 6;
        
        const pillarMat = new StandardMaterial(`pillarMat_${index}`, this.scene);
        pillarMat.diffuseColor = new Color3(0.08, 0.05, 0.1);
        pillarMat.emissiveColor = new Color3(0.03, 0, 0.05);
        pillar.material = pillarMat;
        this.environmentMeshes.push(pillar);
        this.tower.push(pillar);
        
        // Corruption vines on pillars
        this.createCorruptionVines(position, 6);
        
        // Ominous light
        const pillarLight = new PointLight(`pillarLight_${index}`, 
            new Vector3(position.x, 10, position.z), this.scene);
        pillarLight.diffuse = new Color3(0.6, 0, 0.8);
        pillarLight.intensity = 2;
        pillarLight.range = 15;
        this.lights.push(pillarLight);
    }
    
    private createTowerStructure(): void {
        // Spire going up
        const spire = MeshBuilder.CreateCylinder('spire', {
            height: 100,
            diameterTop: 1,
            diameterBottom: 8,
            tessellation: 24
        }, this.scene);
        spire.position = new Vector3(0, 60, 0);
        
        const spireMat = new StandardMaterial('spireMat', this.scene);
        spireMat.diffuseColor = new Color3(0.03, 0.02, 0.05);
        spireMat.emissiveColor = new Color3(0.01, 0, 0.02);
        spire.material = spireMat;
        this.environmentMeshes.push(spire);
        
        // Red beacon at top
        const beacon = MeshBuilder.CreateSphere('beacon', { diameter: 3 }, this.scene);
        beacon.position = new Vector3(0, 110, 0);
        
        const beaconMat = new StandardMaterial('beaconMat', this.scene);
        beaconMat.emissiveColor = new Color3(1, 0, 0);
        beacon.material = beaconMat;
        this.environmentMeshes.push(beacon);
        
        const beaconLight = new PointLight('beaconLight', new Vector3(0, 110, 0), this.scene);
        beaconLight.diffuse = new Color3(1, 0, 0);
        beaconLight.intensity = 10;
        beaconLight.range = 100;
        this.lights.push(beaconLight);
        
        // Pulsing
        this.scene.onBeforeRenderObservable.add(() => {
            beaconLight.intensity = 8 + Math.sin(Date.now() * 0.003) * 4;
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            beacon.scaling = new Vector3(scale, scale, scale);
        });
    }
    
    private createVecnaThrone(): void {
        // The throne platform
        const platform = MeshBuilder.CreateCylinder('thronePlatform', {
            height: 2,
            diameter: 15,
            tessellation: 32
        }, this.scene);
        platform.position = new Vector3(0, 1, 25);
        
        const platMat = new StandardMaterial('platMat', this.scene);
        platMat.diffuseColor = new Color3(0.1, 0.05, 0.12);
        platMat.emissiveColor = new Color3(0.05, 0, 0.08);
        platform.material = platMat;
        this.environmentMeshes.push(platform);
        
        // Throne structure
        this.throne = MeshBuilder.CreateBox('throne', {
            width: 6,
            height: 10,
            depth: 4
        }, this.scene);
        this.throne.position = new Vector3(0, 7, 28);
        
        const throneMat = new StandardMaterial('throneMat', this.scene);
        throneMat.diffuseColor = new Color3(0.08, 0.03, 0.1);
        throneMat.emissiveColor = new Color3(0.03, 0, 0.05);
        this.throne.material = throneMat;
        this.environmentMeshes.push(this.throne);
        
        // Throne details - spikes
        for (let i = 0; i < 5; i++) {
            const spike = MeshBuilder.CreateCylinder(`spike_${i}`, {
                height: 4 + Math.random() * 3,
                diameterTop: 0.1,
                diameterBottom: 0.5,
                tessellation: 8
            }, this.scene);
            spike.parent = this.throne;
            spike.position = new Vector3((i - 2) * 1.2, 6, 0);
            spike.material = throneMat;
            this.environmentMeshes.push(spike);
        }
        
        // Corrupted vines growing from throne
        this.createCorruptionVines(new Vector3(0, 2, 25), 10);
        
        // Throne lighting
        const throneLight = new PointLight('throneLight', new Vector3(0, 15, 25), this.scene);
        throneLight.diffuse = new Color3(0.8, 0, 0.3);
        throneLight.intensity = 5;
        throneLight.range = 25;
        this.lights.push(throneLight);
    }
    
    private createVoidPortal(): void {
        // Large portal behind throne - window to the Upside Down
        this.voidPortal = MeshBuilder.CreateDisc('voidPortal', {
            radius: 20
        }, this.scene);
        this.voidPortal.position = new Vector3(0, 15, 40);
        
        const portalMat = new StandardMaterial('portalMat', this.scene);
        portalMat.diffuseColor = new Color3(0.02, 0, 0.05);
        portalMat.emissiveColor = new Color3(0.1, 0, 0.2);
        portalMat.alpha = 0.8;
        this.voidPortal.material = portalMat;
        this.environmentMeshes.push(this.voidPortal);
        
        // Swirling particles in portal
        const portalParticles = new ParticleSystem('portalParticles', 500, this.scene);
        portalParticles.emitter = this.voidPortal;
        portalParticles.minEmitBox = new Vector3(-15, -15, 0);
        portalParticles.maxEmitBox = new Vector3(15, 15, 0);
        
        portalParticles.color1 = new Color4(0.5, 0, 0.8, 1);
        portalParticles.color2 = new Color4(0.8, 0, 0.3, 0.8);
        portalParticles.colorDead = new Color4(0.1, 0, 0.2, 0);
        
        portalParticles.minSize = 0.3;
        portalParticles.maxSize = 1;
        portalParticles.minLifeTime = 1;
        portalParticles.maxLifeTime = 3;
        portalParticles.emitRate = 100;
        
        portalParticles.gravity = new Vector3(0, 0, -0.5);
        
        // Spiral motion
        portalParticles.minAngularSpeed = 0;
        portalParticles.maxAngularSpeed = Math.PI;
        
        portalParticles.start();
        this.particles.push(portalParticles);
    }
    
    private createUncleIsmael(): void {
        // Uncle Ismael - captive near throne
        this.uncleIsmael = MeshBuilder.CreateCylinder('uncle', {
            height: 1.8,
            diameter: 0.6,
            tessellation: 12
        }, this.scene);
        this.uncleIsmael.position = new Vector3(8, 3, 25);
        
        const uncleMat = new StandardMaterial('uncleMat', this.scene);
        uncleMat.diffuseColor = new Color3(0.3, 0.25, 0.2);
        uncleMat.emissiveColor = new Color3(0.05, 0.04, 0.03);
        this.uncleIsmael.material = uncleMat;
        this.environmentMeshes.push(this.uncleIsmael);
        
        // Restraining vines
        for (let i = 0; i < 4; i++) {
            const vine = MeshBuilder.CreateCylinder(`restraint_${i}`, {
                height: 2,
                diameter: 0.1,
                tessellation: 8
            }, this.scene);
            vine.parent = this.uncleIsmael;
            vine.position = new Vector3(
                Math.cos(i * Math.PI / 2) * 0.5,
                0,
                Math.sin(i * Math.PI / 2) * 0.5
            );
            vine.rotation.x = Math.PI / 4;
            vine.rotation.y = i * Math.PI / 2;
            
            const vineMat = new StandardMaterial(`restraintMat_${i}`, this.scene);
            vineMat.diffuseColor = new Color3(0.1, 0.15, 0.1);
            vineMat.emissiveColor = new Color3(0, 0.02, 0.01);
            vine.material = vineMat;
            this.environmentMeshes.push(vine);
        }
        
        // Light on uncle
        const uncleLight = new PointLight('uncleLight', new Vector3(8, 5, 25), this.scene);
        uncleLight.diffuse = new Color3(1, 0.8, 0.5);
        uncleLight.intensity = 2;
        uncleLight.range = 10;
        this.lights.push(uncleLight);
    }
    
    private createFinalArena(): void {
        // The main fighting area
        this.finalArena = MeshBuilder.CreateCylinder('finalArena', {
            height: 0.2,
            diameter: 50,
            tessellation: 48
        }, this.scene);
        this.finalArena.position = new Vector3(0, 0.1, 0);
        
        const arenaMat = new StandardMaterial('arenaMat', this.scene);
        arenaMat.diffuseColor = new Color3(0.08, 0.05, 0.1);
        arenaMat.emissiveColor = new Color3(0.03, 0, 0.05);
        this.finalArena.material = arenaMat;
        this.environmentMeshes.push(this.finalArena);
        
        // Ritual circle markings
        for (let i = 0; i < 3; i++) {
            const circle = MeshBuilder.CreateTorus(`circle_${i}`, {
                diameter: 20 + i * 10,
                thickness: 0.2,
                tessellation: 48
            }, this.scene);
            circle.position = new Vector3(0, 0.2, 0);
            circle.rotation.x = Math.PI / 2;
            
            const circleMat = new StandardMaterial(`circleMat_${i}`, this.scene);
            circleMat.emissiveColor = new Color3(0.3 - i * 0.1, 0, 0.2);
            circle.material = circleMat;
            this.environmentMeshes.push(circle);
        }
    }
    
    private addFinalCorruption(): void {
        // Maximum corruption - this is Vecna's domain
        // Dense vine coverage
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 30;
            const pos = new Vector3(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );
            this.createCorruptionVines(pos, 4 + Math.floor(Math.random() * 4));
        }
        
        // Spore clouds
        for (let i = 0; i < 20; i++) {
            this.createSporeCloud(new Vector3(
                (Math.random() - 0.5) * 60,
                3 + Math.random() * 8,
                (Math.random() - 0.5) * 60
            ));
        }
        
        // Emergency lights around arena
        const lightAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        lightAngles.forEach((angle, i) => {
            this.createEmergencyLight(new Vector3(
                Math.cos(angle) * 35,
                3,
                Math.sin(angle) * 35
            ));
        });
    }
    
    private createSporeCloud(position: Vector3): void {
        const cloud = MeshBuilder.CreateSphere('sporeCloud', {
            diameter: 2 + Math.random() * 2
        }, this.scene);
        cloud.position = position;
        
        const cloudMat = new StandardMaterial('cloudMat', this.scene);
        cloudMat.diffuseColor = new Color3(0.1, 0.15, 0.1);
        cloudMat.emissiveColor = new Color3(0, 0.03, 0.02);
        cloudMat.alpha = 0.4;
        cloud.material = cloudMat;
        this.environmentMeshes.push(cloud);
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Initial defenders
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-15, 1, -20), count: 6 },
                    { type: 'demobat', position: new Vector3(15, 6, -15), count: 5 }
                ],
                delayBetweenSpawns: 300
            },
            // Wave 2 - Arena defense
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(20, 1, 0), count: 7 },
                    { type: 'demobat', position: new Vector3(-20, 7, 5), count: 6 },
                    { type: 'demogorgon', position: new Vector3(0, 1, -15), count: 1 }
                ],
                delayBetweenSpawns: 400
            },
            // Wave 3 - Throne approach
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-10, 1, 15), count: 6 },
                    { type: 'demobat', position: new Vector3(10, 8, 20), count: 7 },
                    { type: 'demogorgon', position: new Vector3(15, 1, 10), count: 1 }
                ],
                delayBetweenSpawns: 350
            },
            // FINAL BOSS WAVE - VECNA
            {
                enemies: [
                    { type: 'vecna', position: new Vector3(0, 5, 25), count: 1 }
                ],
                delayBetweenSpawns: 0,
                onWaveComplete: () => {
                    this.triggerVictory();
                }
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Vecna's entrance dialogue
        window.addEventListener('bossIncoming', () => {
            this.triggerVecnaIntroduction();
        }, { once: true });
        
        // Listen for uncle rescue
        window.addEventListener('uncleFreed', () => {
            this.onUncleFree();
        });
        
        // Start first wave
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 5000);
    }
    
    private triggerVecnaIntroduction(): void {
        // Dramatic introduction
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: {
                speaker: 'VECNA',
                text: 'So... the boy comes to save his uncle.',
                important: true
            }
        }));
        
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('bossDialogue', {
                detail: {
                    speaker: 'VECNA',
                    text: 'Your memories are exquisite. Such love. Such weakness.',
                    important: true
                }
            }));
        }, 4000);
        
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('bossDialogue', {
                detail: {
                    speaker: 'VECNA',
                    text: 'In my dimension, love is a lie. Only POWER is truth.',
                    important: true
                }
            }));
        }, 8000);
        
        // Darken and intensify
        this.scene.fogDensity = 0.015;
        
        // All lights flicker
        this.lights.forEach(light => {
            const originalIntensity = light.intensity;
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                light.intensity = Math.random() > 0.5 ? originalIntensity : 0;
                flickerCount++;
                if (flickerCount > 20) {
                    clearInterval(flickerInterval);
                    light.intensity = originalIntensity * 0.5;
                }
            }, 100);
        });
    }
    
    private onUncleFree(): void {
        if (this.uncleIsmael) {
            // Remove restraints visual
            this.uncleIsmael.getChildMeshes().forEach(child => {
                child.dispose();
            });
            
            // Uncle gives encouragement
            window.dispatchEvent(new CustomEvent('storyEvent', {
                detail: {
                    type: 'uncleFreed',
                    message: 'Uncle Ismael breaks free!',
                    voiceLine: 'AIDAN! USE OUR MEMORIES! SHOW HIM WHAT LOVE REALLY MEANS!'
                }
            }));
        }
    }
    
    private triggerVictory(): void {
        // Vecna defeated - Victory sequence
        window.dispatchEvent(new CustomEvent('gameVictory', {
            detail: {
                message: 'VECNA HAS BEEN DEFEATED',
                time: (Date.now() - this.startTime) / 1000
            }
        }));
        
        // Portal starts collapsing
        if (this.voidPortal) {
            let scale = 1;
            const collapseInterval = setInterval(() => {
                scale -= 0.02;
                this.voidPortal!.scaling = new Vector3(scale, scale, 1);
                
                if (scale <= 0) {
                    clearInterval(collapseInterval);
                    this.voidPortal!.dispose();
                    this.triggerEscape();
                }
            }, 50);
        }
    }
    
    private triggerEscape(): void {
        // Escape sequence begins
        window.dispatchEvent(new CustomEvent('storyEvent', {
            detail: {
                type: 'escape',
                message: 'The Upside Down is collapsing! RUN!',
                voiceLine: 'We need to go. Now. Before the door closes.'
            }
        }));
        
        // Environment starts breaking
        this.environmentMeshes.forEach(mesh => {
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    mesh.dispose();
                }, Math.random() * 5000);
            }
        });
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        const currentWave = this.enemyManager.getCurrentWave();
        
        // Progressive wave triggers
        if (currentWave === 1 && playerPosition.z > -10) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 2 && playerPosition.z > 5) {
            this.enemyManager.startNextWave();
        } else if (currentWave === 3 && playerPosition.z > 15 && !this.vecnaSpawned) {
            // Trigger Vecna boss fight
            this.vecnaSpawned = true;
            window.dispatchEvent(new CustomEvent('bossIncoming', {
                detail: { boss: 'Vecna', message: 'HE AWAITS...' }
            }));
            
            setTimeout(() => {
                this.enemyManager.startNextWave();
            }, 10000); // Give time for intro dialogue
        }
        
        // Proximity to uncle triggers dialogue
        if (this.uncleIsmael && !this.vecnaSpawned) {
            const distanceToUncle = Vector3.Distance(playerPosition, this.uncleIsmael.position);
            if (distanceToUncle < 15) {
                // Uncle sees player
                window.dispatchEvent(new CustomEvent('storyEvent', {
                    detail: {
                        type: 'uncleNear',
                        message: 'Uncle Ismael sees you!',
                        voiceLine: 'Aidan! You came! But watch out—'
                    }
                }));
            }
        }
        
        // Arena pulse effect during boss fight
        if (currentWave === 4 && this.finalArena) {
            const pulse = Math.sin(Date.now() * 0.003);
            const arenaMat = this.finalArena.material as StandardMaterial;
            arenaMat.emissiveColor = new Color3(
                0.05 + pulse * 0.03,
                0,
                0.08 + pulse * 0.04
            );
        }
    }
}

export default Level6_BurjKhalifa;
