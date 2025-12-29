/**
 * SAVE ISMAEL - Weapon System
 * Features Aidan's custom-designed weapons!
 */

import {
  Scene,
  Vector3,
  UniversalCamera,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ParticleSystem,
  Texture,
  Color4,
  SceneLoader,
  AbstractMesh,
  Animation,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { weaponConfig } from '../config/gameConfig';

// Weapon definitions including Aidan's custom weapons
export interface WeaponDefinition {
  id: string;
  name: string;
  displayName: string;
  type: 'melee' | 'ranged';
  damage: number;
  fireRate: number; // Attacks per second
  range: number;
  magazineSize: number;
  reloadTime: number;
  recoil: number;
  special?: string;
  modelPath?: string;
  description: string;
  createdBy?: string;
}

// Aidan's custom weapons - made with love!
export const CUSTOM_WEAPONS: Record<string, WeaponDefinition> = {
  nail_bat: {
    id: 'nail_bat',
    name: 'nail_bat',
    displayName: "Aidan's Nail Bat",
    type: 'melee',
    damage: 45,
    fireRate: 1.2,
    range: 3,
    magazineSize: Infinity,
    reloadTime: 0,
    recoil: 0,
    special: 'Stuns enemies on hit',
    modelPath: '/assets/weapons/nail_bat.glb',
    description: 'A fearsome bat covered in nails. Perfect for demodogs.',
    createdBy: 'Aidan'
  },
  katana_staff: {
    id: 'katana_staff',
    name: 'katana_staff',
    displayName: "Dragon's Fang",
    type: 'melee',
    damage: 60,
    fireRate: 1.5,
    range: 4,
    magazineSize: Infinity,
    reloadTime: 0,
    recoil: 0,
    special: 'Cleaves through multiple enemies',
    modelPath: '/assets/weapons/katana_staff.glb',
    description: 'An elegant katana mounted on a staff. Slices through void creatures.',
    createdBy: 'Aidan'
  },
  spiky_shield: {
    id: 'spiky_shield',
    name: 'spiky_shield',
    displayName: "Void Breaker Shield",
    type: 'melee',
    damage: 35,
    fireRate: 0.8,
    range: 2.5,
    magazineSize: Infinity,
    reloadTime: 0,
    recoil: 0,
    special: 'Blocks 50% damage when holding, reflects projectiles',
    modelPath: '/assets/weapons/spiky_shield.glb',
    description: 'A shield covered in deadly spikes. Defense and offense in one.',
    createdBy: 'Aidan'
  }
};

// Default weapons
export const DEFAULT_WEAPONS: Record<string, WeaponDefinition> = {
  flashlight: {
    id: 'flashlight',
    name: 'flashlight',
    displayName: 'Flashlight',
    type: 'ranged',
    damage: 5,
    fireRate: 5,
    range: 15,
    magazineSize: Infinity,
    reloadTime: 0,
    recoil: 0,
    special: 'Reveals hidden enemies, weak damage',
    description: 'A trusty flashlight. The light hurts void creatures.'
  },
  pistol: {
    id: 'pistol',
    name: 'pistol',
    displayName: 'Pistol',
    type: 'ranged',
    damage: 25,
    fireRate: 2,
    range: 30,
    magazineSize: 12,
    reloadTime: 1.5,
    recoil: 0.1,
    description: 'Standard pistol. Reliable but not powerful.'
  }
};

interface WeaponState {
  definition: WeaponDefinition;
  currentAmmo: number;
  totalAmmo: number;
  isReloading: boolean;
  lastFireTime: number;
  reloadStartTime: number;
  isBlocking: boolean;
}

export class WeaponSystem {
  private scene: Scene;
  private camera: UniversalCamera;
  
  // All available weapons
  private unlockedWeapons: Map<string, WeaponDefinition> = new Map();
  private weaponStates: Map<string, WeaponState> = new Map();
  
  // Current weapon
  private currentWeaponId: string = 'flashlight';
  private currentState: WeaponState;
  
  // Visual
  private weaponMesh: AbstractMesh | null = null;
  private weaponMeshes: Map<string, AbstractMesh> = new Map();
  private muzzleFlash: ParticleSystem | null = null;
  
  // Melee swing
  private isSwinging: boolean = false;
  private swingAnimation: Animation | null = null;
  
  // Recoil
  private recoilOffset: number = 0;
  private recoilRecoverySpeed: number = 10;
  
  // Callbacks
  public onFire?: () => void;
  public onMeleeSwing?: () => void;
  public onReload?: () => void;
  public onReloadComplete?: () => void;
  public onAmmoChange?: (current: number, total: number) => void;
  public onWeaponChange?: (weapon: WeaponDefinition) => void;
  public onWeaponUnlocked?: (weapon: WeaponDefinition) => void;
  
  constructor(scene: Scene, camera: UniversalCamera) {
    this.scene = scene;
    this.camera = camera;
    
    // Initialize with default weapons
    this.unlockWeapon(DEFAULT_WEAPONS.flashlight);
    this.unlockWeapon(DEFAULT_WEAPONS.pistol);
    
    // Set flashlight as starting weapon
    this.currentState = this.weaponStates.get('flashlight')!;
    
    this.createDefaultWeaponVisual();
    this.createMuzzleFlash();
    this.setupWeaponPickupListener();
  }
  
  /**
   * Unlock a weapon for the player
   */
  public unlockWeapon(definition: WeaponDefinition): void {
    if (this.unlockedWeapons.has(definition.id)) return;
    
    this.unlockedWeapons.set(definition.id, definition);
    
    const state: WeaponState = {
      definition,
      currentAmmo: definition.magazineSize === Infinity ? Infinity : definition.magazineSize,
      totalAmmo: definition.type === 'ranged' ? 999 : Infinity,
      isReloading: false,
      lastFireTime: 0,
      reloadStartTime: 0,
      isBlocking: false
    };
    
    this.weaponStates.set(definition.id, state);
    
    // Load 3D model if available
    if (definition.modelPath) {
      this.loadWeaponModel(definition);
    }
    
    this.onWeaponUnlocked?.(definition);
    
    // Show unlock notification
    if (definition.createdBy) {
      window.dispatchEvent(new CustomEvent('weaponUnlocked', {
        detail: {
          weapon: definition,
          message: `${definition.displayName} unlocked! (Created by ${definition.createdBy})`
        }
      }));
    }
  }
  
  /**
   * Load a weapon's 3D model
   */
  private async loadWeaponModel(definition: WeaponDefinition): Promise<void> {
    if (!definition.modelPath) return;
    
    try {
      const result = await SceneLoader.ImportMeshAsync(
        '',
        '',
        definition.modelPath,
        this.scene
      );
      
      if (result.meshes.length > 0) {
        const weaponMesh = result.meshes[0];
        weaponMesh.name = `weapon_${definition.id}`;
        
        // Scale and position for first-person view
        weaponMesh.scaling = new Vector3(0.1, 0.1, 0.1);
        weaponMesh.parent = this.camera;
        
        // Position based on weapon type
        if (definition.type === 'melee') {
          weaponMesh.position = new Vector3(0.3, -0.2, 0.5);
          weaponMesh.rotation = new Vector3(0, Math.PI / 4, 0);
        } else {
          weaponMesh.position = new Vector3(0.15, -0.1, 0.3);
        }
        
        // Hide initially
        weaponMesh.setEnabled(false);
        
        this.weaponMeshes.set(definition.id, weaponMesh);
        
        console.log(`Loaded weapon model: ${definition.displayName}`);
      }
    } catch (error) {
      console.warn(`Failed to load weapon model for ${definition.displayName}:`, error);
    }
  }
  
  /**
   * Listen for weapon pickups in levels
   */
  private setupWeaponPickupListener(): void {
    window.addEventListener('weaponPickup', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const weaponId = detail.weaponId;
      
      // Check custom weapons first
      if (CUSTOM_WEAPONS[weaponId]) {
        this.unlockWeapon(CUSTOM_WEAPONS[weaponId]);
        this.switchWeapon(weaponId);
      }
    });
  }
  
  /**
   * Switch to a different weapon
   */
  public switchWeapon(weaponId: string): boolean {
    if (!this.unlockedWeapons.has(weaponId)) {
      console.warn(`Weapon ${weaponId} not unlocked`);
      return false;
    }
    
    // Hide current weapon mesh
    if (this.weaponMesh) {
      this.weaponMesh.setEnabled(false);
    }
    
    // Switch to new weapon
    this.currentWeaponId = weaponId;
    this.currentState = this.weaponStates.get(weaponId)!;
    
    // Show new weapon mesh
    const newMesh = this.weaponMeshes.get(weaponId);
    if (newMesh) {
      newMesh.setEnabled(true);
      this.weaponMesh = newMesh;
    } else {
      // Use default visual
      this.showDefaultWeapon();
    }
    
    this.onWeaponChange?.(this.currentState.definition);
    
    return true;
  }
  
  /**
   * Cycle to next weapon
   */
  public nextWeapon(): void {
    const weaponIds = Array.from(this.unlockedWeapons.keys());
    const currentIndex = weaponIds.indexOf(this.currentWeaponId);
    const nextIndex = (currentIndex + 1) % weaponIds.length;
    this.switchWeapon(weaponIds[nextIndex]);
  }
  
  /**
   * Cycle to previous weapon
   */
  public previousWeapon(): void {
    const weaponIds = Array.from(this.unlockedWeapons.keys());
    const currentIndex = weaponIds.indexOf(this.currentWeaponId);
    const prevIndex = (currentIndex - 1 + weaponIds.length) % weaponIds.length;
    this.switchWeapon(weaponIds[prevIndex]);
  }
  
  private createDefaultWeaponVisual(): void {
    // Simple pistol shape
    const barrel = MeshBuilder.CreateBox('weaponBarrel', {
      width: 0.03,
      height: 0.03,
      depth: 0.2,
    }, this.scene);
    
    const grip = MeshBuilder.CreateBox('weaponGrip', {
      width: 0.03,
      height: 0.1,
      depth: 0.05,
    }, this.scene);
    grip.position.y = -0.05;
    grip.position.z = -0.05;
    
    const merged = Mesh.MergeMeshes([barrel, grip], true, true, undefined, false, true);
    if (merged) {
      merged.name = 'weapon_default';
      
      const mat = new StandardMaterial('weaponMat', this.scene);
      mat.diffuseColor = new Color3(0.15, 0.15, 0.15);
      mat.specularColor = new Color3(0.3, 0.3, 0.3);
      merged.material = mat;
      
      merged.parent = this.camera;
      merged.position = new Vector3(0.15, -0.1, 0.3);
      
      this.weaponMesh = merged;
      this.weaponMeshes.set('default', merged);
    }
  }
  
  private showDefaultWeapon(): void {
    const defaultMesh = this.weaponMeshes.get('default');
    if (defaultMesh) {
      defaultMesh.setEnabled(true);
      this.weaponMesh = defaultMesh;
    }
  }
  
  private createMuzzleFlash(): void {
    this.muzzleFlash = new ParticleSystem('muzzleFlash', 20, this.scene);
    
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    this.muzzleFlash.particleTexture = new Texture('data:' + canvas.toDataURL(), this.scene);
    
    this.muzzleFlash.color1 = new Color4(1, 0.8, 0.3, 1);
    this.muzzleFlash.color2 = new Color4(1, 0.5, 0.1, 0.8);
    this.muzzleFlash.colorDead = new Color4(0.5, 0.2, 0, 0);
    
    this.muzzleFlash.minSize = 0.05;
    this.muzzleFlash.maxSize = 0.15;
    this.muzzleFlash.minLifeTime = 0.03;
    this.muzzleFlash.maxLifeTime = 0.06;
    this.muzzleFlash.emitRate = 100;
    this.muzzleFlash.blendMode = ParticleSystem.BLENDMODE_ADD;
  }
  
  // ===========================================================================
  // COMBAT
  // ===========================================================================
  
  public canFire(): boolean {
    if (this.currentState.isReloading) return false;
    if (this.isSwinging) return false;
    
    if (this.currentState.definition.type === 'ranged') {
      if (this.currentState.currentAmmo <= 0) {
        this.reload();
        return false;
      }
    }
    
    const timeSinceFire = performance.now() - this.currentState.lastFireTime;
    const fireInterval = 1000 / this.currentState.definition.fireRate;
    return timeSinceFire >= fireInterval;
  }
  
  public fire(): boolean {
    if (!this.canFire()) return false;
    
    const def = this.currentState.definition;
    
    if (def.type === 'melee') {
      return this.meleeSwing();
    } else {
      return this.rangedFire();
    }
  }
  
  private rangedFire(): boolean {
    if (this.currentState.currentAmmo !== Infinity) {
      this.currentState.currentAmmo--;
    }
    this.currentState.lastFireTime = performance.now();
    
    this.showMuzzleFlash();
    this.applyRecoil();
    
    this.onFire?.();
    this.onAmmoChange?.(this.currentState.currentAmmo, this.currentState.totalAmmo);
    
    return true;
  }
  
  private meleeSwing(): boolean {
    if (this.isSwinging) return false;
    
    this.isSwinging = true;
    this.currentState.lastFireTime = performance.now();
    
    // Swing animation
    if (this.weaponMesh) {
      const startRotation = this.weaponMesh.rotation.clone();
      
      // Quick swing
      const swingDuration = 300; // ms
      const startTime = performance.now();
      
      const animateSwing = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / swingDuration, 1);
        
        if (this.weaponMesh) {
          // Swing arc
          if (progress < 0.5) {
            // Wind up and swing
            const swingProgress = progress * 2;
            this.weaponMesh.rotation.z = startRotation.z - Math.sin(swingProgress * Math.PI) * 1.5;
            this.weaponMesh.position.x = 0.3 + Math.sin(swingProgress * Math.PI) * 0.2;
          } else {
            // Return
            const returnProgress = (progress - 0.5) * 2;
            this.weaponMesh.rotation.z = startRotation.z - Math.sin((1 - returnProgress) * Math.PI) * 0.5;
            this.weaponMesh.position.x = 0.3 + Math.sin((1 - returnProgress) * Math.PI) * 0.1;
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateSwing);
        } else {
          this.isSwinging = false;
          if (this.weaponMesh) {
            this.weaponMesh.rotation = startRotation;
            this.weaponMesh.position.x = 0.3;
          }
        }
      };
      
      animateSwing();
    }
    
    this.onMeleeSwing?.();
    
    // Dispatch melee hit event
    window.dispatchEvent(new CustomEvent('meleeAttack', {
      detail: {
        weapon: this.currentState.definition,
        damage: this.currentState.definition.damage,
        range: this.currentState.definition.range,
        special: this.currentState.definition.special
      }
    }));
    
    return true;
  }
  
  /**
   * Block with shield (if equipped)
   */
  public startBlocking(): void {
    if (this.currentState.definition.id !== 'spiky_shield') return;
    
    this.currentState.isBlocking = true;
    
    // Raise shield
    if (this.weaponMesh) {
      this.weaponMesh.position = new Vector3(0, 0, 0.4);
      this.weaponMesh.rotation = new Vector3(0, 0, 0);
    }
    
    window.dispatchEvent(new CustomEvent('shieldBlock', { detail: { active: true } }));
  }
  
  public stopBlocking(): void {
    this.currentState.isBlocking = false;
    
    // Lower shield
    if (this.weaponMesh && this.currentState.definition.id === 'spiky_shield') {
      this.weaponMesh.position = new Vector3(0.3, -0.2, 0.5);
      this.weaponMesh.rotation = new Vector3(0, Math.PI / 4, 0);
    }
    
    window.dispatchEvent(new CustomEvent('shieldBlock', { detail: { active: false } }));
  }
  
  public isBlocking(): boolean {
    return this.currentState.isBlocking;
  }
  
  private showMuzzleFlash(): void {
    if (this.muzzleFlash && this.weaponMesh) {
      this.muzzleFlash.emitter = this.weaponMesh;
      this.muzzleFlash.minEmitBox = new Vector3(0, 0, 0.15);
      this.muzzleFlash.maxEmitBox = new Vector3(0, 0, 0.15);
      this.muzzleFlash.manualEmitCount = 15;
      this.muzzleFlash.start();
      
      setTimeout(() => this.muzzleFlash?.stop(), 50);
    }
  }
  
  private applyRecoil(): void {
    this.recoilOffset = this.currentState.definition.recoil;
    
    if (this.weaponMesh) {
      this.weaponMesh.position.z -= 0.02;
      this.weaponMesh.rotation.x -= 0.05;
    }
  }
  
  // ===========================================================================
  // RELOAD
  // ===========================================================================
  
  public reload(): void {
    if (this.currentState.isReloading) return;
    if (this.currentState.definition.type === 'melee') return;
    if (this.currentState.currentAmmo === this.currentState.definition.magazineSize) return;
    
    this.currentState.isReloading = true;
    this.currentState.reloadStartTime = performance.now();
    
    this.onReload?.();
    
    if (this.weaponMesh) {
      this.weaponMesh.rotation.x = -0.5;
    }
  }
  
  private completeReload(): void {
    this.currentState.currentAmmo = this.currentState.definition.magazineSize;
    this.currentState.isReloading = false;
    
    if (this.weaponMesh) {
      this.weaponMesh.rotation.x = 0;
    }
    
    this.onReloadComplete?.();
    this.onAmmoChange?.(this.currentState.currentAmmo, this.currentState.totalAmmo);
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    // Check reload completion
    if (this.currentState.isReloading) {
      const reloadTime = (performance.now() - this.currentState.reloadStartTime) / 1000;
      if (reloadTime >= this.currentState.definition.reloadTime) {
        this.completeReload();
      }
    }
    
    // Recover recoil
    if (this.recoilOffset > 0) {
      this.recoilOffset -= this.recoilRecoverySpeed * deltaTime;
      this.recoilOffset = Math.max(0, this.recoilOffset);
    }
    
    // Recover weapon position (only if not swinging or blocking)
    if (this.weaponMesh && !this.currentState.isReloading && !this.isSwinging && !this.currentState.isBlocking) {
      const targetZ = this.currentState.definition.type === 'melee' ? 0.5 : 0.3;
      this.weaponMesh.position.z += (targetZ - this.weaponMesh.position.z) * 0.2;
      this.weaponMesh.rotation.x += (0 - this.weaponMesh.rotation.x) * 0.2;
    }
    
    // Weapon sway
    if (this.weaponMesh && !this.isSwinging && !this.currentState.isBlocking) {
      const time = performance.now() / 1000;
      const baseX = this.currentState.definition.type === 'melee' ? 0.3 : 0.15;
      const swayX = Math.sin(time * 1.5) * 0.002;
      const swayY = Math.sin(time * 2) * 0.001;
      this.weaponMesh.position.x = baseX + swayX;
      this.weaponMesh.position.y = -0.1 + swayY;
    }
  }
  
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  
  public getCurrentWeapon(): WeaponDefinition {
    return this.currentState.definition;
  }
  
  public getCurrentState(): WeaponState {
    return { ...this.currentState };
  }
  
  public getDamage(): number {
    return this.currentState.definition.damage;
  }
  
  public getRange(): number {
    return this.currentState.definition.range;
  }
  
  public getUnlockedWeapons(): WeaponDefinition[] {
    return Array.from(this.unlockedWeapons.values());
  }
  
  public hasWeapon(weaponId: string): boolean {
    return this.unlockedWeapons.has(weaponId);
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.muzzleFlash?.dispose();
    this.weaponMeshes.forEach(mesh => mesh.dispose());
  }
}

export default WeaponSystem;
