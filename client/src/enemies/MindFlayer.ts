/**
 * SAVE ISMAEL - Mind Flayer Boss (Level 4: Dubai Marina)
 * The lieutenant of Vecna - a terrifying psychic entity
 */

import { Enemy, EnemyConfig } from './Enemy';
import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ParticleSystem, Texture, Animation, Sound } from '@babylonjs/core';

interface MindFlayerPhase {
    name: string;
    healthThreshold: number;
    attackPattern: string[];
    dialogue: string[];
}

export class MindFlayer extends Enemy {
    private currentPhase: number = 0;
    private phases: MindFlayerPhase[] = [
        {
            name: 'Awakening',
            healthThreshold: 1.0,
            attackPattern: ['psychicWave', 'summonMinions'],
            dialogue: [
                "Ah... another mind enters my domain.",
                "Your memories... so delicious.",
                "The one you seek belongs to my master now."
            ]
        },
        {
            name: 'Fury',
            healthThreshold: 0.6,
            attackPattern: ['psychicWave', 'tentacleStrike', 'mindControl'],
            dialogue: [
                "You dare resist?!",
                "Your uncle screamed just like you will.",
                "THE MASTER SEES ALL!"
            ]
        },
        {
            name: 'Desperation',
            healthThreshold: 0.3,
            attackPattern: ['psychicStorm', 'tentacleBarrage', 'summonMinions'],
            dialogue: [
                "NO! This cannot be!",
                "Vecna will destroy you!",
                "THE UPSIDE DOWN IS ETERNAL!"
            ]
        }
    ];
    
    private tentacles: any[] = [];
    private psychicAura: ParticleSystem | null = null;
    private lastAttackTime: number = 0;
    private attackCooldown: number = 3000;
    private isPerformingAttack: boolean = false;
    private minionsSpawned: number = 0;
    private maxMinions: number = 6;
    
    // Dialogue system
    private dialogueQueue: string[] = [];
    private lastDialogueTime: number = 0;
    private dialogueCooldown: number = 15000;
    
    constructor(scene: Scene, position: Vector3) {
        const config: EnemyConfig = {
            name: 'Mind Flayer',
            health: 2000,
            maxHealth: 2000,
            damage: 40,
            speed: 1.5,
            detectionRange: 50,
            attackRange: 25,
            type: 'boss'
        };
        
        super(scene, position, config);
        this.createMindFlayerMesh();
        this.createPsychicAura();
        this.initializeTentacles();
    }
    
    private createMindFlayerMesh(): void {
        // Main body - large floating entity
        const body = MeshBuilder.CreateSphere('mindFlayerBody', {
            diameter: 4,
            segments: 32
        }, this.scene);
        body.position = this.position.clone();
        body.position.y += 5;
        
        const bodyMaterial = new StandardMaterial('mindFlayerMat', this.scene);
        bodyMaterial.diffuseColor = new Color3(0.2, 0, 0.3);
        bodyMaterial.emissiveColor = new Color3(0.4, 0, 0.5);
        bodyMaterial.specularColor = new Color3(0.5, 0.2, 0.8);
        body.material = bodyMaterial;
        
        // Head/Face area
        const head = MeshBuilder.CreateSphere('mindFlayerHead', {
            diameter: 2.5,
            segments: 32
        }, this.scene);
        head.parent = body;
        head.position.y = 2;
        
        const headMaterial = new StandardMaterial('headMat', this.scene);
        headMaterial.diffuseColor = new Color3(0.3, 0.1, 0.4);
        headMaterial.emissiveColor = new Color3(0.2, 0, 0.3);
        head.material = headMaterial;
        
        // Glowing eyes
        const leftEye = MeshBuilder.CreateSphere('leftEye', { diameter: 0.4 }, this.scene);
        leftEye.parent = head;
        leftEye.position = new Vector3(-0.5, 0.3, 1);
        
        const rightEye = MeshBuilder.CreateSphere('rightEye', { diameter: 0.4 }, this.scene);
        rightEye.parent = head;
        rightEye.position = new Vector3(0.5, 0.3, 1);
        
        const eyeMaterial = new StandardMaterial('eyeMat', this.scene);
        eyeMaterial.emissiveColor = new Color3(1, 0, 0);
        leftEye.material = eyeMaterial;
        rightEye.material = eyeMaterial;
        
        this.mesh = body;
        
        // Floating animation
        const floatAnimation = new Animation(
            'floatAnim',
            'position.y',
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keyFrames = [
            { frame: 0, value: body.position.y },
            { frame: 30, value: body.position.y + 1 },
            { frame: 60, value: body.position.y }
        ];
        
        floatAnimation.setKeys(keyFrames);
        body.animations.push(floatAnimation);
        this.scene.beginAnimation(body, 0, 60, true);
    }
    
    private initializeTentacles(): void {
        const tentacleCount = 8;
        
        for (let i = 0; i < tentacleCount; i++) {
            const angle = (i / tentacleCount) * Math.PI * 2;
            const tentacle = this.createTentacle(angle);
            this.tentacles.push(tentacle);
        }
    }
    
    private createTentacle(angle: number): any {
        const segments = 6;
        const tentacleSegments: any[] = [];
        
        for (let i = 0; i < segments; i++) {
            const segment = MeshBuilder.CreateCylinder(`tentacle_${angle}_${i}`, {
                height: 1.5,
                diameterTop: 0.3 - (i * 0.04),
                diameterBottom: 0.4 - (i * 0.04),
                tessellation: 12
            }, this.scene);
            
            if (i === 0 && this.mesh) {
                segment.parent = this.mesh;
                segment.position.x = Math.cos(angle) * 2;
                segment.position.z = Math.sin(angle) * 2;
                segment.position.y = -1;
            } else if (tentacleSegments[i - 1]) {
                segment.parent = tentacleSegments[i - 1];
                segment.position.y = -1.4;
            }
            
            const mat = new StandardMaterial(`tentacleMat_${i}`, this.scene);
            mat.diffuseColor = new Color3(0.3, 0.1, 0.35);
            mat.emissiveColor = new Color3(0.1, 0, 0.15);
            segment.material = mat;
            
            // Animate each segment
            const swayAnim = new Animation(
                `sway_${angle}_${i}`,
                'rotation.x',
                30,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            const phase = angle + (i * 0.2);
            swayAnim.setKeys([
                { frame: 0, value: Math.sin(phase) * 0.3 },
                { frame: 30, value: Math.sin(phase + Math.PI) * 0.3 },
                { frame: 60, value: Math.sin(phase) * 0.3 }
            ]);
            
            segment.animations.push(swayAnim);
            this.scene.beginAnimation(segment, 0, 60, true, 0.5 + Math.random() * 0.5);
            
            tentacleSegments.push(segment);
        }
        
        return tentacleSegments;
    }
    
    private createPsychicAura(): void {
        if (!this.mesh) return;
        
        this.psychicAura = new ParticleSystem('psychicAura', 500, this.scene);
        this.psychicAura.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', this.scene);
        
        this.psychicAura.emitter = this.mesh;
        this.psychicAura.minEmitBox = new Vector3(-3, -3, -3);
        this.psychicAura.maxEmitBox = new Vector3(3, 3, 3);
        
        this.psychicAura.color1 = new BABYLON.Color4(0.5, 0, 0.8, 0.8);
        this.psychicAura.color2 = new BABYLON.Color4(0.8, 0, 1, 0.6);
        this.psychicAura.colorDead = new BABYLON.Color4(0.2, 0, 0.3, 0);
        
        this.psychicAura.minSize = 0.3;
        this.psychicAura.maxSize = 0.8;
        
        this.psychicAura.minLifeTime = 0.5;
        this.psychicAura.maxLifeTime = 1.5;
        
        this.psychicAura.emitRate = 100;
        
        this.psychicAura.gravity = new Vector3(0, 0.5, 0);
        
        this.psychicAura.start();
    }
    
    public update(deltaTime: number, playerPosition: Vector3): void {
        if (!this.isAlive || !this.mesh) return;
        
        // Update phase based on health
        this.updatePhase();
        
        // Face the player
        this.lookAtPlayer(playerPosition);
        
        // Handle attacks
        const now = Date.now();
        const distanceToPlayer = Vector3.Distance(this.mesh.position, playerPosition);
        
        if (distanceToPlayer <= this.config.attackRange && !this.isPerformingAttack) {
            if (now - this.lastAttackTime >= this.attackCooldown) {
                this.performAttack(playerPosition);
                this.lastAttackTime = now;
            }
        }
        
        // Slow movement towards player
        if (distanceToPlayer > 10 && !this.isPerformingAttack) {
            const direction = playerPosition.subtract(this.mesh.position).normalize();
            this.mesh.position.addInPlace(direction.scale(this.config.speed * deltaTime * 0.001));
        }
        
        // Trigger dialogue
        if (now - this.lastDialogueTime >= this.dialogueCooldown) {
            this.triggerDialogue();
            this.lastDialogueTime = now;
        }
    }
    
    private updatePhase(): void {
        const healthPercent = this.config.health / this.config.maxHealth;
        
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
        console.log(`Mind Flayer enters phase: ${this.phases[phase].name}`);
        
        // Increase aggression with each phase
        this.attackCooldown = Math.max(1500, 3000 - (phase * 500));
        
        // Trigger phase dialogue
        const dialogue = this.phases[phase].dialogue[0];
        this.dialogueQueue.push(dialogue);
        
        // Visual feedback
        if (this.mesh && this.mesh.material) {
            const mat = this.mesh.material as StandardMaterial;
            mat.emissiveColor = new Color3(0.4 + phase * 0.2, 0, 0.5 + phase * 0.1);
        }
        
        // Increase particle intensity
        if (this.psychicAura) {
            this.psychicAura.emitRate = 100 + (phase * 100);
        }
    }
    
    private performAttack(playerPosition: Vector3): void {
        const phase = this.phases[this.currentPhase];
        const attackIndex = Math.floor(Math.random() * phase.attackPattern.length);
        const attack = phase.attackPattern[attackIndex];
        
        this.isPerformingAttack = true;
        
        switch (attack) {
            case 'psychicWave':
                this.psychicWave(playerPosition);
                break;
            case 'tentacleStrike':
                this.tentacleStrike(playerPosition);
                break;
            case 'mindControl':
                this.mindControl(playerPosition);
                break;
            case 'psychicStorm':
                this.psychicStorm();
                break;
            case 'tentacleBarrage':
                this.tentacleBarrage(playerPosition);
                break;
            case 'summonMinions':
                this.summonMinions();
                break;
        }
        
        setTimeout(() => {
            this.isPerformingAttack = false;
        }, 2000);
    }
    
    private psychicWave(playerPosition: Vector3): void {
        if (!this.mesh) return;
        
        // Create expanding ring
        const ring = MeshBuilder.CreateTorus('psychicRing', {
            diameter: 2,
            thickness: 0.3,
            tessellation: 32
        }, this.scene);
        
        ring.position = this.mesh.position.clone();
        
        const ringMat = new StandardMaterial('ringMat', this.scene);
        ringMat.emissiveColor = new Color3(0.8, 0, 1);
        ringMat.alpha = 0.7;
        ring.material = ringMat;
        
        // Expand animation
        let scale = 1;
        const expandInterval = setInterval(() => {
            scale += 0.5;
            ring.scaling = new Vector3(scale, 1, scale);
            ringMat.alpha -= 0.02;
            
            if (scale >= 20) {
                clearInterval(expandInterval);
                ring.dispose();
            }
        }, 50);
        
        // Emit damage event
        window.dispatchEvent(new CustomEvent('mindFlayerAttack', {
            detail: { type: 'psychicWave', damage: this.config.damage, range: 15 }
        }));
    }
    
    private tentacleStrike(playerPosition: Vector3): void {
        // Animate tentacles toward player
        this.tentacles.forEach((tentacle, index) => {
            setTimeout(() => {
                // Visual strike effect
                console.log(`Tentacle ${index} strikes!`);
            }, index * 200);
        });
        
        window.dispatchEvent(new CustomEvent('mindFlayerAttack', {
            detail: { type: 'tentacleStrike', damage: this.config.damage * 0.5 }
        }));
    }
    
    private mindControl(playerPosition: Vector3): void {
        console.log('Mind Flayer attempts mind control!');
        
        window.dispatchEvent(new CustomEvent('mindFlayerAttack', {
            detail: { type: 'mindControl', duration: 3000 }
        }));
    }
    
    private psychicStorm(): void {
        if (!this.mesh) return;
        
        // Create multiple projectiles
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const projectile = MeshBuilder.CreateSphere(`psychicProjectile_${i}`, {
                    diameter: 0.5
                }, this.scene);
                
                const angle = (i / 12) * Math.PI * 2;
                projectile.position = this.mesh!.position.clone();
                
                const mat = new StandardMaterial(`projMat_${i}`, this.scene);
                mat.emissiveColor = new Color3(0.8, 0, 1);
                projectile.material = mat;
                
                // Move outward
                const direction = new Vector3(Math.cos(angle), 0, Math.sin(angle));
                const moveInterval = setInterval(() => {
                    projectile.position.addInPlace(direction.scale(0.5));
                    
                    if (Vector3.Distance(projectile.position, this.mesh!.position) > 30) {
                        clearInterval(moveInterval);
                        projectile.dispose();
                    }
                }, 50);
            }, i * 100);
        }
        
        window.dispatchEvent(new CustomEvent('mindFlayerAttack', {
            detail: { type: 'psychicStorm', damage: this.config.damage * 0.3 }
        }));
    }
    
    private tentacleBarrage(playerPosition: Vector3): void {
        // Rapid tentacle attacks
        let strikes = 0;
        const strikeInterval = setInterval(() => {
            this.tentacleStrike(playerPosition);
            strikes++;
            
            if (strikes >= 5) {
                clearInterval(strikeInterval);
            }
        }, 300);
    }
    
    private summonMinions(): void {
        if (this.minionsSpawned >= this.maxMinions) return;
        
        const minionCount = 2 + this.currentPhase;
        
        window.dispatchEvent(new CustomEvent('spawnEnemies', {
            detail: {
                type: 'demodog',
                count: minionCount,
                position: this.mesh?.position
            }
        }));
        
        this.minionsSpawned += minionCount;
        console.log(`Mind Flayer summons ${minionCount} minions!`);
    }
    
    private triggerDialogue(): void {
        const phase = this.phases[this.currentPhase];
        const dialogueIndex = Math.floor(Math.random() * phase.dialogue.length);
        const dialogue = phase.dialogue[dialogueIndex];
        
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: { speaker: 'Mind Flayer', text: dialogue }
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
    
    public takeDamage(amount: number): boolean {
        const died = super.takeDamage(amount);
        
        if (died) {
            this.onDeath();
        }
        
        return died;
    }
    
    private onDeath(): void {
        console.log('Mind Flayer defeated!');
        
        // Final dialogue
        window.dispatchEvent(new CustomEvent('bossDialogue', {
            detail: { 
                speaker: 'Mind Flayer', 
                text: "Vecna... will... avenge... me..." 
            }
        }));
        
        // Cleanup
        if (this.psychicAura) {
            this.psychicAura.stop();
            this.psychicAura.dispose();
        }
        
        this.tentacles.forEach(tentacle => {
            tentacle.forEach((segment: any) => segment.dispose());
        });
        
        // Trigger level completion
        window.dispatchEvent(new CustomEvent('bossDefeated', {
            detail: { boss: 'MindFlayer', level: 4 }
        }));
    }
    
    public dispose(): void {
        if (this.psychicAura) {
            this.psychicAura.dispose();
        }
        
        this.tentacles.forEach(tentacle => {
            tentacle.forEach((segment: any) => segment.dispose());
        });
        
        super.dispose();
    }
}

export default MindFlayer;
