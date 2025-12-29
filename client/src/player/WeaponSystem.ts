// WeaponSystem.ts - Weapon Management
// Save Ismael

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
} from '@babylonjs/core';
import { weaponConfig } from '../config/gameConfig';

interface WeaponState {
  name: string;
  damage: number;
  fireRate: number;
  range: number;
  magazineSize: number;
  currentAmmo: number;
  totalAmmo: number;
  isReloading: boolean;
  lastFireTime: number;
  reloadStartTime: number;
}

export class WeaponSystem {
  private scene: Scene;
  private camera: UniversalCamera;
  
  // Weapon state
  private currentWeapon: WeaponState;
  
  // Visual
  private weaponMesh: Mesh | null = null;
  private muzzleFlash: ParticleSystem | null = null;
  
  // Recoil
  private recoilOffset: number = 0;
  private recoilRecoverySpeed: number = 10;
  
  // Callbacks
  public onFire?: () => void;
  public onReload?: () => void;
  public onReloadComplete?: () => void;
  public onAmmoChange?: (current: number, total: number) => void;
  
  constructor(scene: Scene, camera: UniversalCamera) {
    this.scene = scene;
    this.camera = camera;
    
    // Initialize with pistol
    const pistol = weaponConfig.pistol;
    this.currentWeapon = {
      name: pistol.name,
      damage: pistol.damage,
      fireRate: pistol.fireRate,
      range: pistol.range,
      magazineSize: pistol.magazineSize,
      currentAmmo: pistol.magazineSize,
      totalAmmo: 999, // Infinite for now
      isReloading: false,
      lastFireTime: 0,
      reloadStartTime: 0,
    };
    
    this.createWeaponVisual();
    this.createMuzzleFlash();
  }
  
  // ===========================================================================
  // VISUAL
  // ===========================================================================
  
  private createWeaponVisual(): void {
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
    
    // Merge into single mesh
    this.weaponMesh = Mesh.MergeMeshes([barrel, grip], true, true, undefined, false, true);
    if (this.weaponMesh) {
      this.weaponMesh.name = 'weapon';
      
      // Material
      const mat = new StandardMaterial('weaponMat', this.scene);
      mat.diffuseColor = new Color3(0.15, 0.15, 0.15);
      mat.specularColor = new Color3(0.3, 0.3, 0.3);
      mat.specularPower = 32;
      this.weaponMesh.material = mat;
      
      // Parent to camera
      this.weaponMesh.parent = this.camera;
      this.weaponMesh.position = new Vector3(0.15, -0.1, 0.3);
      this.weaponMesh.rotation = new Vector3(0, 0, 0);
    }
  }
  
  private createMuzzleFlash(): void {
    this.muzzleFlash = new ParticleSystem('muzzleFlash', 20, this.scene);
    
    // Create texture
    const texture = this.createFlashTexture();
    this.muzzleFlash.particleTexture = texture;
    
    // Position at barrel tip
    if (this.weaponMesh) {
      this.muzzleFlash.emitter = new Vector3(0, 0, 0.15);
      this.muzzleFlash.parent = this.weaponMesh;
    }
    
    // Particle settings
    this.muzzleFlash.color1 = new Color4(1, 0.8, 0.3, 1);
    this.muzzleFlash.color2 = new Color4(1, 0.5, 0.1, 0.8);
    this.muzzleFlash.colorDead = new Color4(0.5, 0.2, 0, 0);
    
    this.muzzleFlash.minSize = 0.05;
    this.muzzleFlash.maxSize = 0.15;
    
    this.muzzleFlash.minLifeTime = 0.03;
    this.muzzleFlash.maxLifeTime = 0.06;
    
    this.muzzleFlash.emitRate = 100;
    this.muzzleFlash.manualEmitCount = 15;
    
    this.muzzleFlash.minEmitPower = 2;
    this.muzzleFlash.maxEmitPower = 5;
    
    this.muzzleFlash.direction1 = new Vector3(-0.2, -0.2, 1);
    this.muzzleFlash.direction2 = new Vector3(0.2, 0.2, 1);
    
    this.muzzleFlash.blendMode = ParticleSystem.BLENDMODE_ADD;
  }
  
  private createFlashTexture(): Texture {
    // Create a simple radial gradient texture
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    const texture = new Texture('data:' + canvas.toDataURL(), this.scene);
    return texture;
  }
  
  // ===========================================================================
  // FIRING
  // ===========================================================================
  
  public canFire(): boolean {
    if (this.currentWeapon.isReloading) return false;
    if (this.currentWeapon.currentAmmo <= 0) {
      this.reload();
      return false;
    }
    
    const timeSinceFire = performance.now() - this.currentWeapon.lastFireTime;
    return timeSinceFire >= this.currentWeapon.fireRate * 1000;
  }
  
  public fire(): boolean {
    if (!this.canFire()) return false;
    
    this.currentWeapon.currentAmmo--;
    this.currentWeapon.lastFireTime = performance.now();
    
    // Visual feedback
    this.showMuzzleFlash();
    this.applyRecoil();
    
    // Callbacks
    this.onFire?.();
    this.onAmmoChange?.(this.currentWeapon.currentAmmo, this.currentWeapon.totalAmmo);
    
    return true;
  }
  
  private showMuzzleFlash(): void {
    if (this.muzzleFlash) {
      this.muzzleFlash.manualEmitCount = 15;
      this.muzzleFlash.start();
      
      setTimeout(() => {
        this.muzzleFlash?.stop();
      }, 50);
    }
  }
  
  private applyRecoil(): void {
    this.recoilOffset = weaponConfig.pistol.recoil;
    
    if (this.weaponMesh) {
      this.weaponMesh.position.z -= 0.02;
      this.weaponMesh.rotation.x -= 0.05;
    }
  }
  
  // ===========================================================================
  // RELOAD
  // ===========================================================================
  
  public reload(): void {
    if (this.currentWeapon.isReloading) return;
    if (this.currentWeapon.currentAmmo === this.currentWeapon.magazineSize) return;
    
    this.currentWeapon.isReloading = true;
    this.currentWeapon.reloadStartTime = performance.now();
    
    this.onReload?.();
    
    // Reload animation
    if (this.weaponMesh) {
      this.weaponMesh.rotation.x = -0.5;
    }
  }
  
  private completeReload(): void {
    this.currentWeapon.currentAmmo = this.currentWeapon.magazineSize;
    this.currentWeapon.isReloading = false;
    
    if (this.weaponMesh) {
      this.weaponMesh.rotation.x = 0;
    }
    
    this.onReloadComplete?.();
    this.onAmmoChange?.(this.currentWeapon.currentAmmo, this.currentWeapon.totalAmmo);
  }
  
  // ===========================================================================
  // UPDATE
  // ===========================================================================
  
  public update(deltaTime: number): void {
    // Check reload completion
    if (this.currentWeapon.isReloading) {
      const reloadTime = (performance.now() - this.currentWeapon.reloadStartTime) / 1000;
      if (reloadTime >= weaponConfig.pistol.reloadTime) {
        this.completeReload();
      }
    }
    
    // Recover recoil
    if (this.recoilOffset > 0) {
      this.recoilOffset -= this.recoilRecoverySpeed * deltaTime;
      this.recoilOffset = Math.max(0, this.recoilOffset);
    }
    
    // Recover weapon position
    if (this.weaponMesh && !this.currentWeapon.isReloading) {
      this.weaponMesh.position.z += (0.3 - this.weaponMesh.position.z) * 0.2;
      this.weaponMesh.rotation.x += (0 - this.weaponMesh.rotation.x) * 0.2;
    }
    
    // Weapon sway (idle animation)
    if (this.weaponMesh) {
      const time = performance.now() / 1000;
      const swayX = Math.sin(time * 1.5) * 0.002;
      const swayY = Math.sin(time * 2) * 0.001;
      this.weaponMesh.position.x = 0.15 + swayX;
      this.weaponMesh.position.y = -0.1 + swayY;
    }
  }
  
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  
  public getCurrentWeapon(): IWeapon {
    return { ...this.currentWeapon };
  }
  
  public getDamage(): number {
    return this.currentWeapon.damage;
  }
  
  public getRange(): number {
    return this.currentWeapon.range;
  }
  
  public isReloading(): boolean {
    return this.currentWeapon.isReloading;
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.muzzleFlash?.dispose();
    this.weaponMesh?.dispose();
  }
}

export default WeaponSystem;
