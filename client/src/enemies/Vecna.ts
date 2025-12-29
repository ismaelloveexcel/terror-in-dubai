/**
 * SAVE ISMAEL - Vecna Final Boss (Level 6: Burj Khalifa)
 * The Sovereign - Master of the Upside Down Dubai
 * Four-phase boss fight with memory-based mechanics
 */

import { Enemy } from './Enemy';
import { EnemyType } from '../types';
import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3, ParticleSystem, Animation, PointLight, Color4, Texture } from '@babylonjs/core';

interface VecnaPhase {
    name: string;
    healthThreshold: number;
    attacks: string[];
    dialogue: string[];
    mechanics: string[];
}

export class Vecna extends Enemy {
    private currentPhase: number = 0;
    private phases: VecnaPhase[] = [
        {
            name: 'Telekinesis',
            healthThreshold: 1.0,
            attacks: ['telekineticThrow', 'voidBolt', 'summonDemodogs'],
            dialogue: [
                "So... the boy comes to save his uncle.",
                "Your memories are exquisite. Such love. Such weakness.",
                "In my dimension, love is a lie. Only POWER is truth."
            ],
            mechanics: ['debris_throw', 'minion_summon']
        },
        {
            name: 'Mind Invasion',
            healthThreshold: 0.7,
            attacks: ['mindInvasion', 'fearProjection', 'voidStorm'],
            dialogue: [
                "Let me show you your deepest fears...",
                "Your uncle begged. Will you beg too?",
                "SUBMIT TO THE VOID!"
            ],
            mechanics: ['memory_attack', 'screen_distortion']
        },
        {
            name: 'Mind Flayer Assist',
            healthThreshold: 0.4,
            attacks: ['summonMindFlayerEcho', 'combinedAssault', 'voidRift'],
            dialogue: [
                "My creation will finish what it started!",
                "The Mind Flayer was merely a taste of my power!",
                "WITNESS TRUE DARKNESS!"
            ],
            mechanics: ['mind_flayer_echo', 'arena_corruption']
        },
        {
            name: 'Desperation',
            healthThreshold: 0.15,
            attacks: ['desperationStrike', 'voidCollapse', 'finalGrasp'],
            dialogue: [
                "NO! THIS CANNOT BE!",
                "I have lived for millennia! I WILL NOT FALL TO A CHILD!",
                "IF I DIE, YOUR UNCLE DIES WITH ME!"
            ],
            mechanics: ['uncle_hostage', 'memory_counter']
        }
    ];
    
    // Visual components
    private clockHand: any = null;
    private voidAura: ParticleSystem | null = null;
    private corruptions: any[] = [];
    private lightningEffects: any[] = [];
    
    // Combat state
    private lastAttackTime: number = 0;
    private bossAttackCooldown: number = 2500;
    private isPerformingAttack: boolean = false;
    private mindFlayerEchoActive: boolean = false;
    private isVulnerable: boolean = false;
    private vulnerabilityWindow: number = 0;
    
    // Dialogue system
    private lastDialogueTime: number = 0;
    private dialogueCooldown: number = 12000;
    private phaseDialogueTriggered: boolean[] = [false, false, false, false];
    
    // Uncle Ismael connection
    private unclePosition: Vector3 | null = null;
    private uncleFreed: boolean = false;
    
    constructor(scene: Scene, position: Vector3) {
        super(scene, EnemyType.VECNA, position);
        this.initializeVecnaMesh();
        this.createVoidAura();
        this.createClockMechanic();
    }
    
    protected createMesh(): Mesh {
        // Create a simple placeholder mesh - the actual mesh is created in initializeVecnaMesh
        const placeholder = MeshBuilder.CreateSphere('vecnaPlaceholder', { diameter: 0.1 }, this.scene);
        placeholder.isVisible = false;
        return placeholder;
    }
    
    protected updateMovement(deltaTime: number): void {
        // Boss doesn't follow standard movement - handled in update override
    }
    
    private initializeVecnaMesh(): void {
        // Humanoid base - tall and imposing
        const torso = MeshBuilder.CreateCylinder('vecnaTorso', {
            height: 3,
            diameterTop: 1.2,
            diameterBottom: 1.5,
            tessellation: 16
        }, this.scene);
        torso.position = this.position.clone();
        torso.position.y += 4;
        
        const torsoMat = new StandardMaterial('vecnaTorsoMat', this.scene);
        torsoMat.diffuseColor = new Color3(0.15, 0.1, 0.1);
        torsoMat.emissiveColor = new Color3(0.1, 0, 0);
        torso.material = torsoMat;
        
        // Head
        const head = MeshBuilder.CreateSphere('vecnaHead', {
            diameter: 1.2,
            segments: 32
        }, this.scene);
        head.parent = torso;
        head.position.y = 2;
        
        const headMat = new StandardMaterial('vecnaHeadMat', this.scene);
        headMat.diffuseColor = new Color3(0.2, 0.15, 0.15);
        head.material = headMat;
        
        // Glowing red eyes
        const leftEye = MeshBuilder.CreateSphere('vecnaLeftEye', { diameter: 0.15 }, this.scene);
        leftEye.parent = head;
        leftEye.position = new Vector3(-0.25, 0.1, 0.5);
        
        const rightEye = MeshBuilder.CreateSphere('vecnaRightEye', { diameter: 0.15 }, this.scene);
        rightEye.parent = head;
        rightEye.position = new Vector3(0.25, 0.1, 0.5);
        
        const eyeMat = new StandardMaterial('vecnaEyeMat', this.scene);
        eyeMat.emissiveColor = new Color3(1, 0, 0);
        leftEye.material = eyeMat;
        rightEye.material = eyeMat;
        
        // Arms
        const createArm = (side: number) => {
            const arm = MeshBuilder.CreateCylinder(`vecnaArm_${side}`, {
                height: 2,
                diameterTop: 0.2,
                diameterBottom: 0.35,
                tessellation: 12
            }, this.scene);
            arm.parent = torso;
            arm.position = new Vector3(side * 1, 1, 0);
            arm.rotation.z = side * 0.3;
            
            arm.material = torsoMat;
            
            // Clawed hand
            const hand = MeshBuilder.CreateSphere(`vecnaHand_${side}`, { diameter: 0.4 }, this.scene);
            hand.parent = arm;
            hand.position.y = -1.2;
            hand.material = torsoMat;
            
            // Claws
            for (let i = 0; i < 4; i++) {
                const claw = MeshBuilder.CreateCylinder(`claw_${side}_${i}`, {
                    height: 0.4,
                    diameterTop: 0.02,
                    diameterBottom: 0.05
                }, this.scene);
                claw.parent = hand;
                const angle = (i - 1.5) * 0.3;
                claw.position = new Vector3(Math.sin(angle) * 0.15, -0.3, Math.cos(angle) * 0.15);
                claw.rotation.x = 0.5;
                
                const clawMat = new StandardMaterial(`clawMat_${side}_${i}`, this.scene);
                clawMat.diffuseColor = new Color3(0.1, 0.05, 0.05);
                claw.material = clawMat;
            }
            
            return arm;
        };
        
        createArm(-1);
        createArm(1);
        
        // Floating robes/tendrils at bottom
        for (let i = 0; i < 6; i++) {
            const tendril = MeshBuilder.CreateCylinder(`vecnaTendril_${i}`, {
                height: 3,
                diameterTop: 0.3,
                diameterBottom: 0.05,
                tessellation: 8
            }, this.scene);
            tendril.parent = torso;
            const angle = (i / 6) * Math.PI * 2;
            tendril.position = new Vector3(Math.cos(angle) * 0.5, -2.5, Math.sin(angle) * 0.5);
            
            const tendrilMat = new StandardMaterial(`tendrilMat_${i}`, this.scene);
            tendrilMat.diffuseColor = new Color3(0.1, 0.05, 0.1);
            tendrilMat.alpha = 0.8;
            tendril.material = tendrilMat;
            
            // Sway animation
            const swayAnim = new Animation(
                `vecnaTendrilSway_${i}`,
                'rotation.x',
                30,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            swayAnim.setKeys([
                { frame: 0, value: Math.sin(angle) * 0.2 },
                { frame: 45, value: Math.sin(angle + Math.PI) * 0.2 },
                { frame: 90, value: Math.sin(angle) * 0.2 }
            ]);
            
            tendril.animations.push(swayAnim);
            this.scene.beginAnimation(tendril, 0, 90, true);
        }
        
        this.mesh = torso;
        
        // Floating animation
        const floatAnim = new Animation(
            'vecnaFloat',
            'position.y',
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        floatAnim.setKeys([
            { frame: 0, value: torso.position.y },
            { frame: 60, value: torso.position.y + 0.5 },
            { frame: 120, value: torso.position.y }
        ]);
        
        torso.animations.push(floatAnim);
        this.scene.beginAnimation(torso, 0, 120, true);
        
        // Ominous light
        const vecnaLight = new PointLight('vecnaLight', torso.position.clone(), this.scene);
        vecnaLight.parent = torso;
        vecnaLight.diffuse = new Color3(1, 0, 0);
        vecnaLight.intensity = 2;
        vecnaLight.range = 15;
    }
    
    private createVoidAura(): void {
        if (!this.mesh) return;
        
        this.voidAura = new ParticleSystem('voidAura', 1000, this.scene);
        
        this.voidAura.emitter = this.mesh;
        this.voidAura.minEmitBox = new Vector3(-2, -2, -2);
        this.voidAura.maxEmitBox = new Vector3(2, 4, 2);
        
        this.voidAura.color1 = new Color4(0.5, 0, 0, 0.8);
        this.voidAura.color2 = new Color4(0.2, 0, 0.1, 0.6);
        this.voidAura.colorDead = new Color4(0.1, 0, 0, 0);
        
        this.voidAura.minSize = 0.1;
        this.voidAura.maxSize = 0.4;
        
        this.voidAura.minLifeTime = 0.5;
        this.voidAura.maxLifeTime = 1.5;
        
        this.voidAura.emitRate = 150;
        this.voidAura.gravity = new Vector3(0, 0.3, 0);
        
        this.voidAura.start();
    }
    
    private createClockMechanic(): void {
        // Vecna's signature - a floating grandfather clock element
        const clockBase = MeshBuilder.CreateCylinder('clockBase', {
            height: 0.1,
            diameter: 2
        }, this.scene);
        
        if (this.mesh) {
            clockBase.parent = this.mesh;
            clockBase.position.y = 3;
        }
        
        const clockMat = new StandardMaterial('clockMat', this.scene);
        clockMat.diffuseColor = new Color3(0.3, 0.2, 0.1);
        clockMat.emissiveColor = new Color3(0.2, 0.1, 0);
        clockBase.material = clockMat;
        
        // Clock hand
        this.clockHand = MeshBuilder.CreateBox('clockHand', {
            width: 0.05,
            height: 0.8,
            depth: 0.02
        }, this.scene);
        this.clockHand.parent = clockBase;
        this.clockHand.position.y = 0.1;
        this.clockHand.setPivotPoint(new Vector3(0, -0.4, 0));
        
        const handMat = new StandardMaterial('handMat', this.scene);
        handMat.emissiveColor = new Color3(1, 0, 0);
        this.clockHand.material = handMat;
        
        // Rotate clock hand continuously
        const rotateAnim = new Animation(
            'clockRotate',
            'rotation.z',
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        rotateAnim.setKeys([
            { frame: 0, value: 0 },
            { frame: 300, value: Math.PI * 2 }
        ]);
        
        this.clockHand.animations.push(rotateAnim);
        this.scene.beginAnimation(this.clockHand, 0, 300, true);
    }
    
    public override update(deltaTime: number): void {
        if (this.isDead() || !this.mesh) return;
        
        // Call parent update for basic functionality
        super.update(deltaTime);
        
        this.updatePhase();
        
        const playerPosition = this.target;
        if (!playerPosition) return;
        
        this.lookAtPlayer(playerPosition);
        
        const now = Date.now();
        const distanceToPlayer = Vector3.Distance(this.mesh.position, playerPosition);
        
        // Handle attacks
        if (!this.isPerformingAttack && now - this.lastAttackTime >= this.bossAttackCooldown) {
            if (distanceToPlayer <= this.attackRange) {
                this.performAttack(playerPosition);
                this.lastAttackTime = now;
            }
        }
        
        // Slow, menacing approach
        if (distanceToPlayer > 8 && !this.isPerformingAttack) {
            const direction = playerPosition.subtract(this.mesh.position).normalize();
            this.mesh.position.addInPlace(direction.scale(this.speed * deltaTime * 0.001));
        }
        
        // Phase-specific updates
        this.updatePhaseSpecific(deltaTime, playerPosition);
        
        // Dialogue triggers
        if (now - this.lastDialogueTime >= this.dialogueCooldown) {
            this.triggerDialogue();
            this.lastDialogueTime = now;
        }
        
        // Check vulnerability window
        if (this.isVulnerable && now > this.vulnerabilityWindow) {
            this.isVulnerable = false;
            this.onVulnerabilityEnd();
        }
    }
    
    private updatePhase(): void {
        const healthPercent = this.health / this.maxHealth;
        
        for (let i = this.phases.length - 1; i >= 0; i--) {
            if (healthPercent <= this.phases[i].healthThreshold) {
                if (this.currentPhase !== i) {
                    this.currentPhase = i;
                    this.onPhaseChange(i);
                }
                break;
            }
        }
    }
    
    private onPhaseChange(phase: number): void {
        console.log(`Vecna enters ${this.phases[phase].name} phase!`);
        
        // Phase transition dialogue
        if (!this.phaseDialogueTriggered[phase]) {
            this.phaseDialogueTriggered[phase] = true;
            window.dispatchEvent(new CustomEvent('bossDialogue', {
                detail: { 
                    speaker: 'VECNA', 
                    text: this.phases[phase].dialogue[0],
                    important: true
                }
            }));
        }
        
        // Increase aggression
        this.bossAttackCooldown = Math.max(1500, 2500 - (phase * 300));
        
        // Visual intensity increase
        if (this.voidAura) {
            this.voidAura.emitRate = 150 + (phase * 100);
        }
        
        // Phase-specific setup
        switch (phase) {
            case 2: // Mind Flayer Assist
                this.summonMindFlayerEcho();
                break;
            case 3: // Desperation
                this.initiateUncleHostage();
                break;
        }
    }
    
    private updatePhaseSpecific(deltaTime: number, playerPosition: Vector3): void {
        // Phase 3: Mind Flayer Echo attacks independently
        // Phase 4: Uncle hostage mechanics
        if (this.currentPhase === 3 && !this.uncleFreed) {
            // Uncle hostage visual indicator
            window.dispatchEvent(new CustomEvent('uncleInDanger', {
                detail: { active: true }
            }));
        }
    }
    
    private performAttack(playerPosition: Vector3): void {
        const phase = this.phases[this.currentPhase];
        const attackIndex = Math.floor(Math.random() * phase.attacks.length);
        const attack = phase.attacks[attackIndex];
        
        this.isPerformingAttack = true;
        
        switch (attack) {
            case 'telekineticThrow':
                this.telekineticThrow(playerPosition);
                break;
            case 'voidBolt':
                this.voidBolt(playerPosition);
                break;
            case 'summonDemodogs':
                this.summonDemodogs();
                break;
            case 'mindInvasion':
                this.mindInvasion();
                break;
            case 'fearProjection':
                this.fearProjection(playerPosition);
                break;
            case 'voidStorm':
                this.voidStorm();
                break;
            case 'summonMindFlayerEcho':
                this.summonMindFlayerEcho();
                break;
            case 'combinedAssault':
                this.combinedAssault(playerPosition);
                break;
            case 'voidRift':
                this.voidRift(playerPosition);
                break;
            case 'desperationStrike':
                this.desperationStrike(playerPosition);
                break;
            case 'voidCollapse':
                this.voidCollapse();
                break;
            case 'finalGrasp':
                this.finalGrasp(playerPosition);
                break;
        }
        
        setTimeout(() => {
            this.isPerformingAttack = false;
        }, 2000);
    }
    
    // === PHASE 1 ATTACKS ===
    
    private telekineticThrow(playerPosition: Vector3): void {
        if (!this.mesh) return;
        
        // Create debris objects
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const debris = MeshBuilder.CreateBox(`debris_${i}`, {
                    size: 0.5 + Math.random() * 0.5
                }, this.scene);
                
                debris.position = this.mesh!.position.clone();
                debris.position.x += (Math.random() - 0.5) * 10;
                debris.position.z += (Math.random() - 0.5) * 10;
                debris.position.y = 1;
                
                const debrisMat = new StandardMaterial(`debrisMat_${i}`, this.scene);
                debrisMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
                debris.material = debrisMat;
                
                // Lift then throw at player
                const liftTime = 500;
                const initialY = debris.position.y;
                
                const liftInterval = setInterval(() => {
                    debris.position.y += 0.1;
                }, 30);
                
                setTimeout(() => {
                    clearInterval(liftInterval);
                    
                    // Throw at player
                    const direction = playerPosition.subtract(debris.position).normalize();
                    const throwInterval = setInterval(() => {
                        debris.position.addInPlace(direction.scale(0.8));
                        debris.rotation.x += 0.2;
                        debris.rotation.y += 0.1;
                        
                        if (debris.position.y < 0 || 
                            Vector3.Distance(debris.position, playerPosition) < 1 ||
                            Vector3.Distance(debris.position, this.mesh!.position) > 50) {
                            clearInterval(throwInterval);
                            debris.dispose();
                        }
                    }, 30);
                }, liftTime);
            }, i * 300);
        }
        
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { type: 'telekineticThrow', damage: this.damage * 0.4 }
        }));
    }
    
    private voidBolt(playerPosition: Vector3): void {
        if (!this.mesh) return;
        
        const bolt = MeshBuilder.CreateSphere('voidBolt', { diameter: 0.6 }, this.scene);
        bolt.position = this.mesh.position.clone();
        bolt.position.y += 2;
        
        const boltMat = new StandardMaterial('boltMat', this.scene);
        boltMat.emissiveColor = new Color3(0.8, 0, 0.2);
        bolt.material = boltMat;
        
        const direction = playerPosition.subtract(bolt.position).normalize();
        
        const moveInterval = setInterval(() => {
            bolt.position.addInPlace(direction.scale(1.2));
            
            if (Vector3.Distance(bolt.position, playerPosition) < 1.5) {
                window.dispatchEvent(new CustomEvent('vecnaAttack', {
                    detail: { type: 'voidBolt', damage: this.damage * 0.6, hit: true }
                }));
                clearInterval(moveInterval);
                bolt.dispose();
            } else if (Vector3.Distance(bolt.position, this.mesh!.position) > 60) {
                clearInterval(moveInterval);
                bolt.dispose();
            }
        }, 30);
    }
    
    private summonDemodogs(): void {
        window.dispatchEvent(new CustomEvent('spawnEnemies', {
            detail: {
                type: 'demodog',
                count: 3 + this.currentPhase,
                position: this.mesh?.position
            }
        }));
    }
    
    // === PHASE 2 ATTACKS ===
    
    private mindInvasion(): void {
        console.log('Vecna invades your mind!');
        
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { 
                type: 'mindInvasion', 
                duration: 4000,
                memorySequence: true
            }
        }));
        
        // This triggers the memory defense mini-game
        window.dispatchEvent(new CustomEvent('triggerMemoryDefense', {
            detail: { difficulty: this.currentPhase + 1 }
        }));
    }
    
    private fearProjection(playerPosition: Vector3): void {
        // Create fear illusions around player
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const illusion = MeshBuilder.CreateBox(`fearIllusion_${i}`, {
                height: 2,
                width: 0.8,
                depth: 0.8
            }, this.scene);
            
            illusion.position = playerPosition.clone();
            illusion.position.x += Math.cos(angle) * 5;
            illusion.position.z += Math.sin(angle) * 5;
            illusion.position.y = 1;
            
            const illusionMat = new StandardMaterial(`illusionMat_${i}`, this.scene);
            illusionMat.emissiveColor = new Color3(0.3, 0, 0);
            illusionMat.alpha = 0.6;
            illusion.material = illusionMat;
            
            // Illusions close in
            const closeInterval = setInterval(() => {
                const dir = playerPosition.subtract(illusion.position).normalize();
                illusion.position.addInPlace(dir.scale(0.15));
                illusionMat.alpha -= 0.005;
                
                if (Vector3.Distance(illusion.position, playerPosition) < 1.5 || illusionMat.alpha <= 0) {
                    clearInterval(closeInterval);
                    illusion.dispose();
                }
            }, 50);
        }
        
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { type: 'fearProjection', damage: this.damage * 0.3 }
        }));
    }
    
    private voidStorm(): void {
        if (!this.mesh) return;
        
        // Create swirling void projectiles
        for (let i = 0; i < 16; i++) {
            setTimeout(() => {
                const projectile = MeshBuilder.CreateSphere(`voidProjectile_${i}`, {
                    diameter: 0.4
                }, this.scene);
                
                projectile.position = this.mesh!.position.clone();
                
                const mat = new StandardMaterial(`voidProjMat_${i}`, this.scene);
                mat.emissiveColor = new Color3(0.6, 0, 0.1);
                projectile.material = mat;
                
                const angle = (i / 16) * Math.PI * 2;
                const spiralRadius = 0.5;
                let spiralAngle = 0;
                
                const moveInterval = setInterval(() => {
                    spiralAngle += 0.1;
                    const expandRadius = spiralRadius + spiralAngle * 0.5;
                    
                    projectile.position.x = this.mesh!.position.x + Math.cos(angle + spiralAngle) * expandRadius;
                    projectile.position.z = this.mesh!.position.z + Math.sin(angle + spiralAngle) * expandRadius;
                    
                    if (expandRadius > 25) {
                        clearInterval(moveInterval);
                        projectile.dispose();
                    }
                }, 30);
            }, i * 50);
        }
        
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { type: 'voidStorm', damage: this.damage * 0.2 }
        }));
    }
    
    // === PHASE 3 ATTACKS ===
    
    private summonMindFlayerEcho(): void {
        if (this.mindFlayerEchoActive) return;
        
        this.mindFlayerEchoActive = true;
        
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: { 
                speaker: 'VECNA', 
                text: "Rise, my creation! Destroy this pest!",
                important: true
            }
        }));
        
        window.dispatchEvent(new CustomEvent('spawnMindFlayerEcho', {
            detail: { position: this.mesh?.position }
        }));
    }
    
    private combinedAssault(playerPosition: Vector3): void {
        // Vecna and Mind Flayer Echo attack simultaneously
        this.voidBolt(playerPosition);
        
        window.dispatchEvent(new CustomEvent('mindFlayerEchoAttack', {
            detail: { target: playerPosition }
        }));
    }
    
    private voidRift(playerPosition: Vector3): void {
        // Create a damaging zone on the ground
        const rift = MeshBuilder.CreateDisc('voidRift', {
            radius: 4
        }, this.scene);
        
        rift.position = playerPosition.clone();
        rift.position.y = 0.1;
        rift.rotation.x = Math.PI / 2;
        
        const riftMat = new StandardMaterial('riftMat', this.scene);
        riftMat.emissiveColor = new Color3(0.5, 0, 0.1);
        riftMat.alpha = 0.7;
        rift.material = riftMat;
        
        // Damage over time zone
        let ticks = 0;
        const damageInterval = setInterval(() => {
            ticks++;
            
            window.dispatchEvent(new CustomEvent('vecnaAttack', {
                detail: { 
                    type: 'voidRift', 
                    damage: this.damage * 0.1,
                    position: rift.position,
                    radius: 4
                }
            }));
            
            if (ticks >= 10) {
                clearInterval(damageInterval);
                rift.dispose();
            }
        }, 500);
    }
    
    // === PHASE 4 ATTACKS ===
    
    private initiateUncleHostage(): void {
        // Position Uncle Ismael near Vecna
        this.unclePosition = this.mesh?.position.clone() || new Vector3(0, 0, 0);
        this.unclePosition.x += 5;
        this.unclePosition.y = 2;
        
        window.dispatchEvent(new CustomEvent('uncleHostage', {
            detail: { 
                active: true, 
                position: this.unclePosition,
                message: "AIDAN! USE OUR MEMORIES! SHOW HIM WHAT LOVE REALLY MEANS!"
            }
        }));
    }
    
    private desperationStrike(playerPosition: Vector3): void {
        // Rapid succession of void bolts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.voidBolt(playerPosition);
            }, i * 200);
        }
    }
    
    private voidCollapse(): void {
        // Arena-wide attack - player must find safe spot
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { 
                type: 'voidCollapse', 
                damage: this.damage * 1.5,
                warning: 3000,
                safeSpots: [
                    new Vector3(10, 0, 10),
                    new Vector3(-10, 0, -10)
                ]
            }
        }));
    }
    
    private finalGrasp(playerPosition: Vector3): void {
        // Vecna grabs player - only escaped with memory counter
        window.dispatchEvent(new CustomEvent('vecnaAttack', {
            detail: { 
                type: 'finalGrasp', 
                requiresMemoryCounter: true,
                damage: this.damage * 2
            }
        }));
        
        // Open vulnerability window if memory counter succeeds
        this.vulnerabilityWindow = Date.now() + 5000;
    }
    
    private triggerDialogue(): void {
        const phase = this.phases[this.currentPhase];
        const dialogueIndex = Math.floor(Math.random() * phase.dialogue.length);
        
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: { 
                speaker: 'VECNA', 
                text: phase.dialogue[dialogueIndex] 
            }
        }));
    }
    
    private lookAtPlayer(playerPosition: Vector3): void {
        if (!this.mesh) return;
        
        const direction = playerPosition.subtract(this.mesh.position);
        direction.y = 0;
        
        if (direction.length() > 0.1) {
            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;
        }
    }
    
    public override takeDamage(amount: number): void {
        // In Phase 4, Vecna has temporary invulnerability
        if (this.currentPhase === 3 && !this.isVulnerable && !this.uncleFreed) {
            window.dispatchEvent(new CustomEvent('bossDialogue', {
                detail: { 
                    speaker: 'VECNA', 
                    text: "HAHAHA! You cannot hurt me while I hold your uncle!" 
                }
            }));
            return;
        }
        
        const wasDead = this.isDead();
        super.takeDamage(amount);
        
        if (!wasDead && this.isDead()) {
            this.onBossDeath();
        }
    }
    
    public freeUncle(): void {
        this.uncleFreed = true;
        this.isVulnerable = true;
        this.vulnerabilityWindow = Date.now() + 10000;
        
        window.dispatchEvent(new CustomEvent('uncleFreed', {
            detail: { 
                message: "Uncle Ismael: AIDAN! You did it! Now finish him!" 
            }
        }));
    }
    
    private onVulnerabilityEnd(): void {
        if (this.currentPhase === 3 && !this.uncleFreed) {
            // Re-establish hostage
            this.initiateUncleHostage();
        }
    }
    
    private onBossDeath(): void {
        console.log('Vecna has been defeated!');
        
        // Final dialogue
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: { 
                speaker: 'VECNA', 
                text: "I... WILL... FIND... YOU... IN YOUR DREAMS...",
                important: true,
                final: true
            }
        }));
        
        // Stop particles
        if (this.voidAura) {
            this.voidAura.stop();
        }
        
        // Death animation - disintegration
        if (this.mesh) {
            let alpha = 1;
            const deathInterval = setInterval(() => {
                alpha -= 0.02;
                
                this.mesh!.getChildMeshes().forEach(child => {
                    if (child.material) {
                        (child.material as StandardMaterial).alpha = alpha;
                    }
                });
                
                if (alpha <= 0) {
                    clearInterval(deathInterval);
                    this.dispose();
                }
            }, 50);
        }
        
        // Trigger game victory
        window.dispatchEvent(new CustomEvent('gameVictory', {
            detail: { boss: 'Vecna' }
        }));
    }
    
    public dispose(): void {
        if (this.voidAura) {
            this.voidAura.dispose();
        }
        
        if (this.clockHand) {
            this.clockHand.dispose();
        }
        
        this.corruptions.forEach(c => c.dispose());
        this.lightningEffects.forEach(l => l.dispose());
        
        super.dispose();
    }
}

export default Vecna;
