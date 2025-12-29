/**
 * SAVE ISMAEL - Level 3: Dubai Frame
 * The iconic landmark - now a window to the Upside Down
 * Escape sequence level
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

export class Level3_Frame extends Level {
    private frame: Mesh | null = null;
    private observation: Mesh[] = [];
    private glassWalk: Mesh | null = null;
    
    constructor(scene: Scene) {
        const config: LevelConfig = {
            id: 3,
            name: 'DUBAI FRAME',
            subtitle: 'The Window',
            location: 'Observation Deck',
            description: 'The Frame shows both worlds now. The Upside Down bleeds through.',
            ambientColor: new Color3(0.04, 0.04, 0.08),
            fogColor: new Color3(0.02, 0.02, 0.05),
            fogDensity: 0.012,
            evidenceItem: 'Cracked Phone',
            evidenceDescription: 'Uncle\'s phone. Video shows him warning: "Don\'t come... whatever you do..."',
            mammooMessage: 'Aidan... I recorded a video... on my phone... don\'t... don\'t come after me... he\'s watching... through the Frame... you can see both worlds...',
            duration: { min: 8, max: 12 },
            hasBoss: false
        };
        
        super(scene, config);
        
        this.playerSpawnPoint = new Vector3(0, 1, -30);
        this.exitPoint = new Vector3(0, 150, 40);
    }
    
    protected getEvidenceConfig(): { position: Vector3 } {
        return { position: new Vector3(0, 151, 20) };
    }
    
    protected async createEnvironment(): Promise<void> {
        // Create base area
        this.createBaseArea();
        
        // Create the iconic frame structure
        this.createDubaiFrame();
        
        // Create observation deck
        this.createObservationDeck();
        
        // Create glass sky bridge
        this.createGlassBridge();
        
        // Add corruption
        this.addFrameCorruption();
    }
    
    private createBaseArea(): void {
        // Ground floor
        const ground = MeshBuilder.CreateGround('ground', {
            width: 100,
            height: 100
        }, this.scene);
        
        const groundMat = new StandardMaterial('groundMat', this.scene);
        groundMat.diffuseColor = new Color3(0.08, 0.08, 0.1);
        ground.material = groundMat;
        this.environmentMeshes.push(ground);
        
        // Entrance plaza
        const plaza = MeshBuilder.CreateBox('plaza', {
            width: 30,
            height: 0.3,
            depth: 30
        }, this.scene);
        plaza.position = new Vector3(0, 0.15, -20);
        
        const plazaMat = new StandardMaterial('plazaMat', this.scene);
        plazaMat.diffuseColor = new Color3(0.12, 0.1, 0.08);
        plazaMat.specularColor = new Color3(0.2, 0.2, 0.25);
        plaza.material = plazaMat;
        this.environmentMeshes.push(plaza);
    }
    
    private createDubaiFrame(): void {
        // Left pillar
        const leftPillar = MeshBuilder.CreateBox('frameLeftPillar', {
            width: 8,
            height: 150,
            depth: 8
        }, this.scene);
        leftPillar.position = new Vector3(-25, 75, 0);
        
        const pillarMat = new StandardMaterial('framePillarMat', this.scene);
        pillarMat.diffuseColor = new Color3(0.6, 0.5, 0.2);
        pillarMat.emissiveColor = new Color3(0.05, 0.04, 0.01);
        leftPillar.material = pillarMat;
        this.environmentMeshes.push(leftPillar);
        
        // Right pillar
        const rightPillar = leftPillar.clone('frameRightPillar');
        rightPillar.position.x = 25;
        this.environmentMeshes.push(rightPillar);
        
        // Top beam / Sky Bridge
        const topBeam = MeshBuilder.CreateBox('frameTopBeam', {
            width: 58,
            height: 10,
            depth: 12
        }, this.scene);
        topBeam.position = new Vector3(0, 150, 0);
        topBeam.material = pillarMat;
        this.environmentMeshes.push(topBeam);
        
        this.frame = topBeam;
        
        // Decorative gold trim
        this.createGoldTrim();
        
        // The portal effect in the center
        this.createPortalEffect();
    }
    
    private createGoldTrim(): void {
        // Vertical strips on pillars
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 5; i++) {
                const strip = MeshBuilder.CreateBox(`goldStrip_${side}_${i}`, {
                    width: 0.5,
                    height: 145,
                    depth: 0.5
                }, this.scene);
                strip.position = new Vector3(side * 25 + (i - 2) * 1.5, 72.5, 4);
                
                const goldMat = new StandardMaterial(`goldMat_${side}_${i}`, this.scene);
                goldMat.diffuseColor = new Color3(0.8, 0.6, 0.1);
                goldMat.emissiveColor = new Color3(0.1, 0.08, 0.01);
                strip.material = goldMat;
                this.environmentMeshes.push(strip);
            }
        }
    }
    
    private createPortalEffect(): void {
        // The "window" showing the Upside Down
        const portal = MeshBuilder.CreateBox('portal', {
            width: 40,
            height: 130,
            depth: 0.5
        }, this.scene);
        portal.position = new Vector3(0, 70, 0);
        
        const portalMat = new StandardMaterial('portalMat', this.scene);
        portalMat.diffuseColor = new Color3(0.02, 0.02, 0.05);
        portalMat.emissiveColor = new Color3(0, 0.02, 0.04);
        portalMat.alpha = 0.7;
        portal.material = portalMat;
        this.environmentMeshes.push(portal);
        
        // Swirling corruption within
        for (let i = 0; i < 30; i++) {
            const particle = MeshBuilder.CreateSphere(`portalParticle_${i}`, {
                diameter: 0.5 + Math.random() * 1
            }, this.scene);
            
            particle.position = new Vector3(
                (Math.random() - 0.5) * 35,
                10 + Math.random() * 120,
                (Math.random() - 0.5) * 2
            );
            
            const particleMat = new StandardMaterial(`particleMat_${i}`, this.scene);
            particleMat.emissiveColor = new Color3(0, 0.05 + Math.random() * 0.05, 0.08);
            particleMat.alpha = 0.5;
            particle.material = particleMat;
            this.environmentMeshes.push(particle);
            
            // Animate
            const speed = 0.5 + Math.random();
            const startY = particle.position.y;
            this.scene.onBeforeRenderObservable.add(() => {
                particle.position.y = startY + Math.sin(Date.now() * 0.001 * speed) * 5;
                particle.position.x += Math.sin(Date.now() * 0.002 * speed) * 0.01;
            });
        }
    }
    
    private createObservationDeck(): void {
        // Elevator shaft
        const shaft = MeshBuilder.CreateBox('elevatorShaft', {
            width: 6,
            height: 150,
            depth: 6
        }, this.scene);
        shaft.position = new Vector3(-20, 75, -10);
        
        const shaftMat = new StandardMaterial('shaftMat', this.scene);
        shaftMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        shaft.material = shaftMat;
        this.environmentMeshes.push(shaft);
        
        // Observation platforms at top
        const obsFloor = MeshBuilder.CreateBox('obsFloor', {
            width: 50,
            height: 1,
            depth: 20
        }, this.scene);
        obsFloor.position = new Vector3(0, 149.5, 0);
        
        const obsMat = new StandardMaterial('obsMat', this.scene);
        obsMat.diffuseColor = new Color3(0.15, 0.12, 0.1);
        obsMat.specularColor = new Color3(0.25, 0.25, 0.3);
        obsFloor.material = obsMat;
        this.environmentMeshes.push(obsFloor);
        this.observation.push(obsFloor);
        
        // Glass walls
        for (let side = -1; side <= 1; side += 2) {
            const glassWall = MeshBuilder.CreateBox(`glassWall_${side}`, {
                width: 0.3,
                height: 4,
                depth: 20
            }, this.scene);
            glassWall.position = new Vector3(side * 24, 152, 0);
            
            const glassMat = new StandardMaterial(`glassMat_${side}`, this.scene);
            glassMat.diffuseColor = new Color3(0.1, 0.15, 0.2);
            glassMat.alpha = 0.4;
            glassWall.material = glassMat;
            this.environmentMeshes.push(glassWall);
        }
    }
    
    private createGlassBridge(): void {
        // The famous glass floor sky bridge
        const bridge = MeshBuilder.CreateBox('glassBridge', {
            width: 8,
            height: 0.3,
            depth: 30
        }, this.scene);
        bridge.position = new Vector3(0, 150, 20);
        
        const bridgeMat = new StandardMaterial('bridgeMat', this.scene);
        bridgeMat.diffuseColor = new Color3(0.1, 0.15, 0.2);
        bridgeMat.alpha = 0.3;
        bridgeMat.specularColor = new Color3(0.5, 0.5, 0.6);
        bridge.material = bridgeMat;
        this.environmentMeshes.push(bridge);
        this.glassWalk = bridge;
        
        // Railings
        for (let side = -1; side <= 1; side += 2) {
            const railing = MeshBuilder.CreateBox(`bridgeRailing_${side}`, {
                width: 0.2,
                height: 1.5,
                depth: 30
            }, this.scene);
            railing.position = new Vector3(side * 3.9, 150.75, 20);
            
            const railMat = new StandardMaterial(`railMat_${side}`, this.scene);
            railMat.diffuseColor = new Color3(0.3, 0.3, 0.35);
            railing.material = railMat;
            this.environmentMeshes.push(railing);
        }
    }
    
    private addFrameCorruption(): void {
        // Corruption growing up the pillars
        for (let side = -1; side <= 1; side += 2) {
            for (let h = 0; h < 15; h++) {
                this.createCorruptionVines(
                    new Vector3(side * 25, h * 10, 0),
                    3 + Math.floor(Math.random() * 3)
                );
            }
        }
        
        // Emergency lights on observation deck
        const lightPositions = [
            new Vector3(-20, 152, -5),
            new Vector3(-20, 152, 5),
            new Vector3(20, 152, -5),
            new Vector3(20, 152, 5),
            new Vector3(0, 152, 30)
        ];
        
        lightPositions.forEach(pos => {
            this.createEmergencyLight(pos);
        });
        
        // Corruption on glass bridge
        this.createCorruptionVines(new Vector3(0, 150, 15), 4);
        this.createCorruptionVines(new Vector3(0, 150, 25), 4);
    }
    
    protected setupEnemyWaves(): void {
        const waves: WaveConfig[] = [
            // Wave 1 - Ground level
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-10, 1, -10), count: 4 },
                    { type: 'demobat', position: new Vector3(10, 5, -5), count: 3 }
                ],
                delayBetweenSpawns: 500
            },
            // Wave 2 - Elevator attack
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(-15, 1, 5), count: 5 },
                    { type: 'demobat', position: new Vector3(0, 8, 0), count: 6 }
                ],
                delayBetweenSpawns: 400
            },
            // Wave 3 - Observation deck (spawns when player reaches top)
            {
                enemies: [
                    { type: 'demodog', position: new Vector3(0, 151, 0), count: 5 },
                    { type: 'demobat', position: new Vector3(0, 155, 10), count: 6 }
                ],
                delayBetweenSpawns: 300
            },
            // Wave 4 - Glass bridge escape
            {
                enemies: [
                    { type: 'demobat', position: new Vector3(0, 155, 20), count: 8 },
                    { type: 'demodog', position: new Vector3(-3, 151, 35), count: 3 }
                ],
                delayBetweenSpawns: 200
            }
        ];
        
        this.enemyManager.setWaveConfigs(waves);
    }
    
    protected async setupLevelSpecific(): Promise<void> {
        // Elevator mechanic - player must "use" elevator to reach top
        // For now, simplified with teleport
        
        // Start first wave
        setTimeout(() => {
            this.enemyManager.startNextWave();
        }, 4000);
    }
    
    protected updateLevelSpecific(deltaTime: number, playerPosition: Vector3): void {
        const currentWave = this.enemyManager.getCurrentWave();
        
        // Ground level progression
        if (currentWave === 1 && playerPosition.z > -5) {
            this.enemyManager.startNextWave();
        }
        
        // Elevator trigger (simplified - player reaches certain height)
        if (currentWave === 2 && playerPosition.y > 100) {
            this.enemyManager.startNextWave();
            window.dispatchEvent(new CustomEvent('levelEvent', {
                detail: { type: 'reachedTop', message: 'The view... both worlds visible...' }
            }));
        }
        
        // Glass bridge trigger
        if (currentWave === 3 && playerPosition.z > 15 && playerPosition.y > 145) {
            this.enemyManager.startNextWave();
        }
        
        // Create vertigo effect on glass bridge
        if (playerPosition.y > 145 && playerPosition.z > 10 && playerPosition.z < 35) {
            // Could trigger visual effect here
        }
    }
}

export default Level3_Frame;
