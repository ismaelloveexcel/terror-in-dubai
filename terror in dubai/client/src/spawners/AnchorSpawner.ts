import { Scene, Mesh, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { ISpawner } from '../types';
import { AssetLoader } from '../utils/AssetLoader';

export class AnchorSpawner implements ISpawner {
  public isActive: boolean = true;
  public isDestroyed: boolean = false;
  public mesh: Mesh;
  public health: number = 150;

  constructor(
    public position: Vector3,
    private scene: Scene,
    private assetLoader: AssetLoader
  ) {
    this.mesh = this.createMesh();
  }

  private createMesh(): Mesh {
    const anchor = this.assetLoader.createFallbackAnchor();
    anchor.position = this.position.clone();

    const mat = new StandardMaterial('anchorMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.5);
    mat.emissiveColor = new Color3(0.3, 0.3, 0.8);
    anchor.material = mat;

    return anchor;
  }

  spawn(): void {
    // Anchors don't spawn enemies, they cause interference
  }

  update(deltaTime: number): void {
    if (this.isDestroyed) return;

    // Rotate and pulse
    const time = performance.now() / 1000;
    this.mesh.rotation.y += deltaTime;

    const mat = this.mesh.material as StandardMaterial;
    if (mat) {
      const pulse = 0.3 + Math.sin(time * 4) * 0.5;
      mat.emissiveColor = new Color3(pulse, pulse, 1);
    }
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.isActive = false;

    const mat = this.mesh.material as StandardMaterial;
    if (mat) {
      mat.emissiveColor = new Color3(1, 1, 0);
    }

    setTimeout(() => {
      this.dispose();
    }, 500);
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.dispose();
    }
  }
}
