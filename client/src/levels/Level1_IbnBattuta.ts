/**
 * SAVE ISMAEL - Level 1: Ibn Battuta Mall
 * The starting point - where Uncle Ismael disappeared
 * Tutorial level with basic enemies
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
import { WaveConfig, SpawnConfig } from '../enemies/EnemyManager';
import { PortalSpawner } from '../spawners/PortalSpawner';
import { AssetLoader } from '../utils/AssetLoader';

export class Level1_IbnBattuta extends Level {
    private mallCorridor: Mesh[] = [];
    private persiaArch: Mesh | null = null;
    private fountain: Mesh | null = null;
    private shops: Mesh[] = [];
    private weaponPickup: Mesh | null = null;
    private weaponCollected: boolean = false;
    private portalSpawner: PortalSpawner | null = null;
    private assetLoader: AssetLoader;
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 1,
            name: 'IBN BATTUTA MALL',
            subtitle: 'The Beginning',
            location: 'Persia Court',
            description: 'Where it all started. Uncle Ismael was last seen here.',
            ambientColor: new Color3(0.05, 0.05, 0.1),
            fogColor: new Color3(0.02, 0.03, 0.05),
            fogDensity: 0.015,
            evidenceItem: 'Car Keys + Parking Ticket',
            evidenceDescription: 'Uncle\'s BMW keys. Parking ticket shows B2, 7:38 PM.',
            mammooMessage: 'Aidan... I\'m at the mall... something\'s wrong... the lights... everything looks different... find my keys, I left them near the fountain...',
            duration: { min: 8, max: 12 },
            hasBoss: false
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -30);
        this.exitPoint = new Vector3(0, 1, 60);
        this.assetLoader = new AssetLoader(scene);
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(5, 0.5, 15) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Floor - wet marble
        const floor = MeshBuilder.CreateGround('floor', {
            width: 30,
            height: 100
        }, this.scene);
        
        const floorMat = new StandardMaterial('floorMat', this.scene);
        floorMat.diffuseColor = new Color3(0.15, 0.12, 0.1);
        floorMat.specularColor = new Color3(0.3, 0.3, 0.35);
        floorMat.specularPower = 32;
        floor.material = floorMat;
        this.environmentMeshes.push(floor);
        
        // Create the main corridor
        this.createMallCorridor();
        
        // Create the iconic Persia Court arch
        this.createPersiaArch();
        
        // Create corrupted fountain
        this.createCorruptedFountain();
        
        // Create shops on sides
        this.createShops();
        
        // Add corruption elements
        this.addCorruption();
        
        // Add Aidan's Nail Bat weapon pickup!
        this.createWeaponPickup();
        
        // Create a blue portal spawner (tutorial portal)
        this.createTutorialPortal();
    }
    
    /**
     * Create a blue dimensional portal - introduces players to the portal mechanic
     */
    private createTutorialPortal(): void {
        // Place portal near the mid-section of the mall
        this.portalSpawner = new PortalSpawner(
            new Vector3(10, 0, 25),
            this.scene,
            this.assetLoader,
            (enemy) => {
                // Register spawned enemies with the enemy manager
                // This connects portal spawns to the main enemy system
                console.log('Portal spawned enemy:', enemy.type);
            },
            'blue' // Tutorial uses blue portal (smaller, less threatening)
        );
        
        // Reduce spawn rate for tutorial
        // Portal will spawn enemies more slowly to not overwhelm new players
    }
    
    /**
     * Create Aidan's Nail Bat as a pickup weapon!
     * This special weapon was designed by Aidan himself.
     */
    private createWeaponPickup(): void {
        // Create glowing pedestal for the weapon
        const pedestal = MeshBuilder.CreateCylinder('weaponPedestal', {
            height: 0.5,
            diameter: 1,
            tessellation: 16
        }, this.scene);
        pedestal.position = new Vector3(-8, 0.25, 30);
        
        const pedestalMat = new StandardMaterial('pedestalMat', this.scene);
        pedestalMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
        pedestalMat.emissiveColor = new Color3(0, 0.05, 0.1);
        pedestal.material = pedestalMat;
        this.environmentMeshes.push(pedestal);
        
        // Weapon representation (will be replaced by actual model)
        this.weaponPickup = MeshBuilder.CreateBox('nailBatPickup', {
            width: 0.15,
            height: 0.15,
            depth: 1.2
        }, this.scene);
        this.weaponPickup.position = new Vector3(-8, 1.2, 30);
        this.weaponPickup.rotation.z = Math.PI / 6;
        
        const weaponMat = new StandardMaterial('nailBatMat', this.scene);
        weaponMat.diffuseColor = new Color3(0.4, 0.25, 0.15);
        weaponMat.emissiveColor = new Color3(0.1, 0.05, 0);
        this.weaponPickup.material = weaponMat;
        this.environmentMeshes.push(this.weaponPickup);
        
        // Add spikes to represent nails
        for (let i = 0; i < 8; i++) {
            const spike = MeshBuilder.CreateCylinder(`spike_${i}`, {
                height: 0.15,
                diameterTop: 0.01,
                diameterBottom: 0.03,
                tessellation: 6
            }, this.scene);
            spike.parent = this.weaponPickup;
            spike.position = new Vector3(
                (Math.random() - 0.5) * 0.1,
                0.1,
                (i - 3.5) * 0.12
            );
            spike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            
            const spikeMat = new StandardMaterial(`spikeMat_${i}`, this.scene);
            spikeMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
            spike.material = spikeMat;
        }
        
        // Glowing pickup light
        const pickupLight = new PointLight('weaponLight', new Vector3(-8, 2, 30), this.scene);
        pickupLight.diffuse = new Color3(0, 1, 1);
        pickupLight.intensity = 2;
        pickupLight.range = 5;
        this.lights.push(pickupLight);
        
        // Floating/rotating animation
        let time = 0;
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.weaponPickup && !this.weaponCollected) {
                time += 0.02;
                this.weaponPickup.position.y = 1.2 + Math.sin(time) * 0.15;
                this.weaponPickup.rotation.y += 0.01;
            }
        });
        
        // Pickup prompt text would be shown by UI
    }
    
    private createMallCorridor(): void {
        // Left wall
        const leftWall = MeshBuilder.CreateBox('leftWall', {
            width: 1,
            height: 8,
            depth: 100
        }, this.scene);
        leftWall.position = new Vector3(-15, 4, 0);
        
        const wallMat = new StandardMaterial('wallMat', this.scene);
        wallMat.diffuseColor = new Color3(0.2, 0.18, 0.15);
        leftWall.material = wallMat;
        this.environmentMeshes.push(leftWall);
        this.mallCorridor.push(leftWall);
        
        // Right wall
        const rightWall = leftWall.clone('rightWall');
        rightWall.position.x = 15;
        this.environmentMeshes.push(rightWall);
        this.mallCorridor.push(rightWall);
        
        // Ceiling
        const ceiling = MeshBuilder.CreateBox('ceiling', {
            width: 30,
            height: 0.5,
            depth: 100
        }, this.scene);
        ceiling.position = new Vector3(0, 8, 0);
        
        const ceilingMat = new StandardMaterial('ceilingMat', this.scene);
        ceilingMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        ceiling.material = ceilingMat;
        this.environmentMeshes.push(ceiling);
        this.mallCorridor.push(ceiling);
        
        // Pillars
        for (let i = -40; i <= 40; i += 10) {
            this.createPillar(new Vector3(-12, 0, i));
            this.createPillar(new Vector3(12, 0, i));
        }
    }
    
    private createPillar(position: Vector3): void {
        const pillar = MeshBuilder.CreateCylinder('pillar', {
            height: 8,
            diameter: 1,
            tessellation: 16
        }, this.scene);
        pillar.position = position;
        pillar.position.y = 4;
        
        const pillarMat = new StandardMaterial('pillarMat', this.scene);
        pillarMat.diffuseColor = new Color3(0.25, 0.2, 0.18);
        pillar.material = pillarMat;
        
        this.environmentMeshes.push(pillar);
        this.mallCorridor.push(pillar);
    }
    
    private createPersiaArch(): void {
        // Main arch structure
        const archBase = MeshBuilder.CreateBox('archBase', {
            width: 20,
            height: 2,
            depth: 3
        }, this.scene);
        archBase.position = new Vector3(0, 7, 0);
        
        const archMat = new StandardMaterial('archMat', this.scene);
        archMat.diffuseColor = new Color3(0.3, 0.25, 0.2);
        archMat.emissiveColor = new Color3(0.02, 0.01, 0.01);
        archBase.material = archMat;
        this.environmentMeshes.push(archBase);
        
        // Arch pillars
        const leftArchPillar = MeshBuilder.CreateCylinder('leftArchPillar', {
            height: 10,
            diameter: 1.5,
            tessellation: 16
        }, this.scene);
        leftArchPillar.position = new Vector3(-8, 5, 0);
        leftArchPillar.material = archMat;
        this.environmentMeshes.push(leftArchPillar);
        
        const rightArchPillar = leftArchPillar.clone('rightArchPillar');
        rightArchPillar.position.x = 8;
        this.environmentMeshes.push(rightArchPillar);
        
        // Decorative dome above arch
        const dome = MeshBuilder.CreateSphere('dome', {
            diameter: 6,
            segments: 16,
            slice: 0.5
        }, this.scene);
        dome.position = new Vector3(0, 10, 0);
        dome.rotation.x = Math.PI;
        
        const domeMat = new StandardMaterial('domeMat', this.scene);
        domeMat.diffuseColor = new Color3(0, 0.2, 0.3);
        domeMat.emissiveColor = new Color3(0, 0.02, 0.03);
        dome.material = domeMat;
        this.environmentMeshes.push(dome);
        
        this.persiaArch = archBase;
        
        // Add Persian-style decorative tiles (corrupted)
        this.createCorruptedTiles(new Vector3(0, 6, 1.6));
    }
    
    private createCorruptedTiles(position: Vector3): void {
        for (let x = -4; x <= 4; x += 2) {
            for (let y = 0; y < 3; y++) {
                const tile = MeshBuilder.CreateBox(`tile_${x}_${y}`, {
                    width: 1.8,
                    height: 0.8,
                    depth: 0.1
                }, this.scene);
                
                tile.position = position.clone();
                tile.position.x += x;
                tile.position.y += y * 0.9;
                
                const tileMat = new StandardMaterial(`tileMat_${x}_${y}`, this.scene);
                // Persian blue with corruption
                const corruption = Math.random() * 0.5;
                tileMat.diffuseColor = new Color3(
                    0.05 + corruption * 0.1,
                    0.2 * (1 - corruption),
                    0.4 * (1 - corruption)
                );
                tileMat.emissiveColor = new Color3(0, 0.02 * (1 - corruption), 0.05 * (1 - corruption));
                tile.material = tileMat;
                
                this.environmentMeshes.push(tile);
            }
        }
    }
    
    private createCorruptedFountain(): void {
        // Fountain base
        const base = MeshBuilder.CreateCylinder('fountainBase', {
            height: 0.5,
            diameter: 6,
            tessellation: 24
        }, this.scene);
        base.position = new Vector3(0, 0.25, 15);
        
        const baseMat = new StandardMaterial('baseMat', this.scene);
        baseMat.diffuseColor = new Color3(0.15, 0.15, 0.12);
        baseMat.specularColor = new Color3(0.2, 0.2, 0.25);
        base.material = baseMat;
        this.environmentMeshes.push(base);
        
        // Fountain bowl
        const bowl = MeshBuilder.CreateTorus('fountainBowl', {
            diameter: 5,
            thickness: 0.5,
            tessellation: 24
        }, this.scene);
        bowl.position = new Vector3(0, 0.75, 15);
        bowl.material = baseMat;
        this.environmentMeshes.push(bowl);
        
        // Central pillar
        const pillar = MeshBuilder.CreateCylinder('fountainPillar', {
            height: 3,
            diameter: 0.8,
            tessellation: 16
        }, this.scene);
        pillar.position = new Vector3(0, 2, 15);
        pillar.material = baseMat;
        this.environmentMeshes.push(pillar);
        
        // Corrupted water - black and glowing
        const water = MeshBuilder.CreateDisc('corruptedWater', {
            radius: 2.3
        }, this.scene);
        water.position = new Vector3(0, 0.6, 15);
        water.rotation.x = Math.PI / 2;
        
        const waterMat = new StandardMaterial('waterMat', this.scene);
        waterMat.diffuseColor = new Color3(0.02, 0.02, 0.05);
        waterMat.emissiveColor = new Color3(0, 0.05, 0.08);
        waterMat.alpha = 0.8;
        water.material = waterMat;
        this.environmentMeshes.push(water);
        
        this.fountain = base;
        
        // Corruption vines on fountain
        this.createCorruptionVines(new Vector3(0, 0, 15), 8);
    }
    
    private createShops(): void {
        // Create shop fronts on both sides
        const shopPositions = [-35, -25, -15, 20, 30, 40];
        
        shopPositions.forEach((z, index) => {
            this.createShop(new Vector3(-13, 0, z), `shop_left_${index}`);
            this.createShop(new Vector3(13, 0, z), `shop_right_${index}`);
        });
    }
    
    private createShop(position: Vector3, name: string): void {
        // Shop front
        const front = MeshBuilder.CreateBox(`${name}_front`, {
            width: 0.5,
            height: 4,
            depth: 8
        }, this.scene);
        
        front.position = position.clone();
        front.position.y = 2;
        
        const frontMat = new StandardMaterial(`${name}_frontMat`, this.scene);
        frontMat.diffuseColor = new Color3(0.12, 0.1, 0.08);
        front.material = frontMat;
        this.environmentMeshes.push(front);
        this.shops.push(front);
        
        // Broken/dark display
        const display = MeshBuilder.CreateBox(`${name}_display`, {
            width: 0.1,
            height: 3,
            depth: 6
        }, this.scene);
        display.position = position.clone();
        display.position.y = 2;
        display.position.x += position.x > 0 ? -0.3 : 0.3;
        
        const displayMat = new StandardMaterial(`${name}_displayMat`, this.scene);
        displayMat.diffuseColor = new Color3(0.02, 0.02, 0.03);
        displayMat.emissiveColor = new Color3(0, 0.01, 0.02);
        displayMat.alpha = 0.6;
        display.material = displayMat;
        this.environmentMeshes.push(display);
        
        // Random corruption on some shops
        if (Math.random() > 0.5) {
            this.createCorruptionVines(position, 3);
        }
    }
    
    private addCorruption(): void {
        // Scattered vine clusters
        const vinePositions = [
            new Vector3(-10, 0, -20),
            new Vector3(8, 0, -10),
            new Vector3(-5, 0, 25),
            new Vector3(10, 0, 35),
            new Vector3(0, 0, 45),
            new Vector3(-8, 0, 50)
        ];
        
        vinePositions.forEach(pos => {
            this.createCorruptionVines(pos, 3 + Math.floor(Math.random() * 4));
        });
        
        // Emergency lights
        const lightPositions = [
            new Vector3(-12, 3, -25),
            new Vector3(12, 3, -10),
            new Vector3(-12, 3, 20),
            new Vector3(12, 3, 40),
            new Vector3(-12, 3, 55)
        ];
        
        lightPositions.forEach(pos => {
            this.createEmergencyLight(pos);
        });
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Tutorial: Few demodogs
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(0, 1, 0), count: 3 }
                ],
                delayBetweenSpawns: 500
            },
            // Wave 2 - More demodogs + demobats
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-5, 1, 20), count: 4 },
                    { type: 'demobat', position: new Vector3(5, 3, 25), count: 3 }
                ],
                delayBetweenSpawns: 1000
            },
            // Wave 3 - Final push
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(0, 1, 40), count: 5 },
                    { type: 'demobat', position: new Vector3(0, 4, 45), count: 4 }
                ],
                delayBetweenSpawns: 800
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Lights Wall Message - appears after first wave
        window.addEventListener('waveComplete', (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.wave === 1) {
                this.showLightsWallMessage();
            }
        }, { once: true });
        
        // Start first wave after a delay
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 5000);
    }
    
    private showLightsWallMessage(): void {
        // Lights on the wall spell out "RUN"
        window.dispatchEvent(new CustomEvent('lightsWallMessage', {
            detail: {
                message: 'RUN',
                position: new Vector3(0, 4, 10)
            }
        }));
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        // Check for wave triggers based on player position
        if (playerPosition.z > 5 && !this.enemyManager.areAllWavesComplete()) {
            const currentWave = this.enemyManager.getCurrentWave();
            
            if (currentWave === 1 && playerPosition.z > 15) {
                this.enemyManager.startNextWave();
            } else if (currentWave === 2 && playerPosition.z > 35) {
                this.enemyManager.startNextWave();
            }
        }
        
        // Check for weapon pickup - Aidan's Nail Bat!
        if (!this.weaponCollected && this.weaponPickup) {
            const distanceToWeapon = Vector3.Distance(playerPosition, this.weaponPickup.position);
            
            if (distanceToWeapon < 2) {
                this.collectWeaponPickup();
            }
        }
    }
    
    /**
     * Collect Aidan's custom weapon!
     */
    private collectWeaponPickup(): void {
        if (this.weaponCollected) return;
        
        this.weaponCollected = true;
        
        // Hide the pickup
        if (this.weaponPickup) {
            this.weaponPickup.setEnabled(false);
        }
        
        // Dispatch weapon pickup event
        window.dispatchEvent(new CustomEvent('weaponPickup', {
            detail: {
                weaponId: 'nail_bat',
                weaponName: "Aidan's Nail Bat",
                message: "You found AIDAN'S NAIL BAT! This fearsome weapon was designed by Aidan himself!",
                createdBy: 'Aidan'
            }
        }));
        
        // Show special message for Aidan's weapon
        window.dispatchEvent(new CustomEvent('storyEvent', {
            detail: {
                type: 'weaponFound',
                message: "You found a weapon Aidan designed! The Nail Bat will help you fight through the Upside Down.",
                important: true
            }
        }));
    }
    
    /**
     * Clean up portal spawner on level dispose
     */
    dispose(): void {
        if (this.portalSpawner) {
            this.portalSpawner.dispose();
        }
        this.assetLoader.dispose();
        super.dispose();
    }
}

export default Level1_IbnBattuta;
