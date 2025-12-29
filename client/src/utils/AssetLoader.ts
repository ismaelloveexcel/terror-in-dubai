import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { assetConfig } from '../config/assetConfig';

// Fallback mesh configurations
const fallbackConfigs = {
  demodog: { type: 'box', width: 1, height: 0.6, depth: 1.5, color: '#1a1a1a', emissive: '#00ffcc' },
  demobat: { type: 'sphere', diameter: 0.8, color: '#2a2a2a', emissive: '#00ffcc' },
  demogorgon: { type: 'capsule', height: 2.5, radius: 0.6, color: '#1a1a1a', emissive: '#00ffcc' },
  mindFlayer: { type: 'sphere', diameter: 5, color: '#0a0a0a', emissive: '#00ffcc' },
  vecna: { type: 'capsule', height: 2.2, radius: 0.5, color: '#1a0a0a', emissive: '#8b0000' },
  hive: { type: 'cylinder', height: 3, diameter: 2, color: '#1a1a1a', emissive: '#00ffcc' },
  pod: { type: 'sphere', diameter: 0.6, color: '#0a1a1a', emissive: '#00ffcc' },
  vine: { type: 'cylinder', height: 2, diameter: 0.1, color: '#0a1a0a', emissive: '#39ff14' },
};

type FallbackType = keyof typeof fallbackConfigs;

/**
 * AssetLoader - Handles loading of GLB models and creates fallback meshes
 */
export class AssetLoader {
  private loadedMeshes: Map<string, Mesh> = new Map();
  private loadingPromises: Map<string, Promise<Mesh>> = new Map();

  constructor(private scene: Scene) {}

  /**
   * Load a GLB model from path or return a fallback
   */
  async loadModel(path: string, fallbackType?: FallbackType): Promise<Mesh> {
    if (this.loadedMeshes.has(path)) {
      return this.loadedMeshes.get(path)!.clone(`${path}_clone`);
    }

    if (this.loadingPromises.has(path)) {
      const mesh = await this.loadingPromises.get(path)!;
      return mesh.clone(`${path}_clone`);
    }

    const loadPromise = this.doLoad(path, fallbackType);
    this.loadingPromises.set(path, loadPromise);
    
    try {
      const mesh = await loadPromise;
      this.loadedMeshes.set(path, mesh);
      return mesh;
    } catch (error) {
      console.warn(`Failed to load model: ${path}`, error);
      if (fallbackType) {
        return this.createFallbackMesh(fallbackType);
      }
      throw error;
    }
  }

  private async doLoad(path: string, fallbackType?: FallbackType): Promise<Mesh> {
    try {
      const result = await SceneLoader.ImportMeshAsync('', '', path, this.scene);
      
      if (result.meshes.length > 0) {
        const rootMesh = result.meshes[0] as Mesh;
        rootMesh.name = `loaded_${path}`;
        rootMesh.isVisible = false;
        return rootMesh;
      }
      throw new Error('No meshes found in model');
    } catch (error) {
      if (fallbackType) {
        console.warn(`Creating fallback for ${path}`);
        return this.createFallbackMesh(fallbackType);
      }
      throw error;
    }
  }

  /**
   * Create a fallback mesh from configuration
   */
  createFallbackMesh(type: FallbackType, name?: string): Mesh {
    const config = fallbackConfigs[type];
    let mesh: Mesh;

    if (config.type === 'box') {
      const boxConfig = config as typeof fallbackConfigs.demodog;
      mesh = MeshBuilder.CreateBox(name || `fallback_${type}`, {
        width: boxConfig.width,
        height: boxConfig.height,
        depth: boxConfig.depth,
      }, this.scene);
    } else if (config.type === 'sphere') {
      const sphereConfig = config as typeof fallbackConfigs.demobat;
      mesh = MeshBuilder.CreateSphere(name || `fallback_${type}`, {
        diameter: sphereConfig.diameter,
      }, this.scene);
    } else if (config.type === 'capsule') {
      const capsuleConfig = config as typeof fallbackConfigs.demogorgon;
      mesh = MeshBuilder.CreateCapsule(name || `fallback_${type}`, {
        height: capsuleConfig.height,
        radius: capsuleConfig.radius,
      }, this.scene);
    } else if (config.type === 'cylinder') {
      const cylinderConfig = config as typeof fallbackConfigs.hive;
      mesh = MeshBuilder.CreateCylinder(name || `fallback_${type}`, {
        height: cylinderConfig.height,
        diameter: cylinderConfig.diameter,
      }, this.scene);
    } else {
      mesh = MeshBuilder.CreateBox(name || `fallback_${type}`, { size: 1 }, this.scene);
    }

    // Apply material
    const material = new StandardMaterial(`${type}Mat`, this.scene);
    material.diffuseColor = Color3.FromHexString(config.color);
    material.emissiveColor = Color3.FromHexString(config.emissive);
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    mesh.material = material;

    return mesh;
  }

  // Convenience methods
  createFallbackDemodog(name?: string): Mesh { return this.createFallbackMesh('demodog', name); }
  createFallbackDemobat(name?: string): Mesh { return this.createFallbackMesh('demobat', name); }
  createFallbackDemogorgon(name?: string): Mesh { return this.createFallbackMesh('demogorgon', name); }
  createFallbackMindFlayer(name?: string): Mesh { return this.createFallbackMesh('mindFlayer', name); }
  createFallbackVecna(name?: string): Mesh { return this.createFallbackMesh('vecna', name); }
  createFallbackHive(name?: string): Mesh { return this.createFallbackMesh('hive', name); }
  createFallbackPod(name?: string): Mesh { return this.createFallbackMesh('pod', name); }
  createFallbackVine(name?: string): Mesh { return this.createFallbackMesh('vine', name); }

  createFallbackSwarmEnemy(name?: string): Mesh {
    const mesh = MeshBuilder.CreateSphere(name || 'swarmEnemy', { diameter: 0.5, segments: 8 }, this.scene);
    const mat = new StandardMaterial('swarmMat', this.scene);
    mat.diffuseColor = new Color3(0.3, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    mesh.material = mat;
    return mesh;
  }

  createFallbackFlyingEnemy(name?: string): Mesh {
    const body = MeshBuilder.CreateSphere(name || 'flyingEnemy', { diameter: 0.8, segments: 8 }, this.scene);
    const mat = new StandardMaterial('flyingMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.4);
    mat.emissiveColor = new Color3(0.3, 0.3, 0.6);
    body.material = mat;
    return body;
  }

  createFallbackElite(name?: string): Mesh {
    const mesh = MeshBuilder.CreateCapsule(name || 'eliteEnemy', { height: 3, radius: 0.8 }, this.scene);
    const mat = new StandardMaterial('eliteMat', this.scene);
    mat.diffuseColor = new Color3(0.4, 0.1, 0.2);
    mat.emissiveColor = new Color3(0.6, 0.1, 0.2);
    mesh.material = mat;
    mesh.scaling = new Vector3(1.5, 1.5, 1.5);
    return mesh;
  }

  createFallbackBoss(name?: string): Mesh {
    const mesh = MeshBuilder.CreateSphere(name || 'boss', { diameter: 3, segments: 16 }, this.scene);
    const mat = new StandardMaterial('bossMat', this.scene);
    mat.diffuseColor = new Color3(0.5, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.8, 0.2, 0.2);
    mesh.material = mat;
    return mesh;
  }

  createFallbackAnchor(name?: string): Mesh {
    const mesh = MeshBuilder.CreatePolyhedron(name || 'anchor', { type: 1, size: 1.5 }, this.scene);
    const mat = new StandardMaterial('anchorMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.5);
    mat.emissiveColor = new Color3(0.4, 0.4, 1.0);
    mat.alpha = 0.8;
    mesh.material = mat;
    return mesh;
  }

  createFallbackPortal(type: 'blue' | 'standard' | 'large' = 'standard', name?: string): Mesh {
    const size = type === 'large' ? 4 : type === 'blue' ? 2 : 3;
    const portal = MeshBuilder.CreateTorus(name || `portal_${type}`, { diameter: size, thickness: 0.3, tessellation: 32 }, this.scene);
    const mat = new StandardMaterial(`portalMat_${type}`, this.scene);
    
    switch (type) {
      case 'blue':
        mat.diffuseColor = new Color3(0.2, 0.4, 1.0);
        mat.emissiveColor = new Color3(0.3, 0.5, 1.0);
        break;
      case 'large':
        mat.diffuseColor = new Color3(1.0, 0.2, 0.1);
        mat.emissiveColor = new Color3(1.0, 0.3, 0.2);
        break;
      default:
        mat.diffuseColor = new Color3(0.5, 0.0, 0.8);
        mat.emissiveColor = new Color3(0.6, 0.1, 0.9);
    }
    mat.alpha = 0.9;
    portal.material = mat;
    return portal;
  }

  // Weapon loaders
  async loadKatanaStaff(): Promise<Mesh> {
    return this.loadModel(assetConfig.weapons.katanaStaff, 'demodog');
  }

  async loadNailBat(): Promise<Mesh> {
    return this.loadModel(assetConfig.weapons.nailBat, 'demodog');
  }

  async loadNailBatAlt(): Promise<Mesh> {
    return this.loadModel(assetConfig.weapons.nailBatAlt, 'demodog');
  }

  async loadSpikyShield(): Promise<Mesh> {
    return this.loadModel(assetConfig.weapons.spikyShield, 'demodog');
  }

  // Portal loaders
  async loadBluePortal(): Promise<Mesh> {
    try {
      return await this.loadModel(assetConfig.portals.bluePortal);
    } catch {
      return this.createFallbackPortal('blue');
    }
  }

  async loadStandardPortal(): Promise<Mesh> {
    try {
      return await this.loadModel(assetConfig.portals.standardPortal);
    } catch {
      return this.createFallbackPortal('standard');
    }
  }

  async loadLargePortal(): Promise<Mesh> {
    try {
      return await this.loadModel(assetConfig.portals.largePortal);
    } catch {
      return this.createFallbackPortal('large');
    }
  }

  dispose(): void {
    this.loadedMeshes.forEach(mesh => mesh.dispose());
    this.loadedMeshes.clear();
    this.loadingPromises.clear();
  }
}
