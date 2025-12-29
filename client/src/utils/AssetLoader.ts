import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { assetConfig, fallbackMeshes } from '../config/assetConfig';

/**
 * AssetLoader - Handles loading of GLB models and creates fallback meshes
 * when models aren't available yet
 */
export class AssetLoader {
  private loadedMeshes: Map<string, Mesh> = new Map();
  private loadingPromises: Map<string, Promise<Mesh>> = new Map();

  constructor(private scene: Scene) {}

  /**
   * Load a GLB model from path or return a fallback
   */
  async loadModel(path: string, fallbackType?: keyof typeof fallbackMeshes): Promise<Mesh> {
    // Check if already loaded
    if (this.loadedMeshes.has(path)) {
      return this.loadedMeshes.get(path)!.clone(`${path}_clone`);
    }

    // Check if already loading
    if (this.loadingPromises.has(path)) {
      const mesh = await this.loadingPromises.get(path)!;
      return mesh.clone(`${path}_clone`);
    }

    // Start loading
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

  private async doLoad(path: string, fallbackType?: keyof typeof fallbackMeshes): Promise<Mesh> {
    try {
      const result = await SceneLoader.ImportMeshAsync('', '', path, this.scene);
      
      if (result.meshes.length > 0) {
        // Get root mesh or first mesh
        const rootMesh = result.meshes[0] as Mesh;
        rootMesh.name = `loaded_${path}`;
        rootMesh.isVisible = false; // Hide template
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
  createFallbackMesh(type: keyof typeof fallbackMeshes, name?: string): Mesh {
    const config = fallbackMeshes[type];
    let mesh: Mesh;

    switch (config.type) {
      case 'box':
        mesh = MeshBuilder.CreateBox(name || `fallback_${type}`, {
          width: config.width,
          height: config.height,
          depth: config.depth,
        }, this.scene);
        break;
      case 'sphere':
        mesh = MeshBuilder.CreateSphere(name || `fallback_${type}`, {
          diameter: config.diameter,
        }, this.scene);
        break;
      case 'capsule':
        mesh = MeshBuilder.CreateCapsule(name || `fallback_${type}`, {
          height: config.height,
          radius: config.radius,
        }, this.scene);
        break;
      case 'cylinder':
        mesh = MeshBuilder.CreateCylinder(name || `fallback_${type}`, {
          height: config.height,
          diameter: config.diameter,
        }, this.scene);
        break;
      default:
        mesh = MeshBuilder.CreateBox(name || `fallback_${type}`, {
          size: 1,
        }, this.scene);
    }

    // Apply material
    const material = new StandardMaterial(`${type}Mat`, this.scene);
    material.diffuseColor = Color3.FromHexString(config.color);
    material.emissiveColor = Color3.FromHexString(config.emissive);
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    mesh.material = material;

    return mesh;
  }

  // =============================================================================
  // CONVENIENCE METHODS - Create specific enemy/spawner fallbacks
  // =============================================================================

  createFallbackDemodog(name?: string): Mesh {
    return this.createFallbackMesh('demodog', name);
  }

  createFallbackDemobat(name?: string): Mesh {
    return this.createFallbackMesh('demobat', name);
  }

  createFallbackDemogorgon(name?: string): Mesh {
    return this.createFallbackMesh('demogorgon', name);
  }

  createFallbackMindFlayer(name?: string): Mesh {
    return this.createFallbackMesh('mindFlayer', name);
  }

  createFallbackVecna(name?: string): Mesh {
    return this.createFallbackMesh('vecna', name);
  }

  createFallbackHive(name?: string): Mesh {
    return this.createFallbackMesh('hive', name);
  }

  createFallbackPod(name?: string): Mesh {
    return this.createFallbackMesh('pod', name);
  }

  createFallbackVine(name?: string): Mesh {
    return this.createFallbackMesh('vine', name);
  }

  createFallbackSwarmEnemy(name?: string): Mesh {
    // Swarm enemies are smaller, faster versions
    const mesh = MeshBuilder.CreateSphere(name || 'swarmEnemy', {
      diameter: 0.5,
      segments: 8,
    }, this.scene);
    
    const mat = new StandardMaterial('swarmMat', this.scene);
    mat.diffuseColor = new Color3(0.3, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    mesh.material = mat;
    
    return mesh;
  }

  createFallbackFlyingEnemy(name?: string): Mesh {
    // Flying enemies have a distinctive shape
    const body = MeshBuilder.CreateSphere(name || 'flyingEnemy', {
      diameter: 0.8,
      segments: 8,
    }, this.scene);
    
    // Add wing-like extensions
    const wing1 = MeshBuilder.CreateBox('wing_left', {
      width: 1.5,
      height: 0.1,
      depth: 0.5,
    }, this.scene);
    wing1.parent = body;
    wing1.position.x = -0.5;
    wing1.name = 'wing_left';
    
    const wing2 = MeshBuilder.CreateBox('wing_right', {
      width: 1.5,
      height: 0.1,
      depth: 0.5,
    }, this.scene);
    wing2.parent = body;
    wing2.position.x = 0.5;
    wing2.name = 'wing_right';
    
    const mat = new StandardMaterial('flyingMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.4);
    mat.emissiveColor = new Color3(0.3, 0.3, 0.6);
    body.material = mat;
    wing1.material = mat;
    wing2.material = mat;
    
    return body;
  }

  createFallbackElite(name?: string): Mesh {
    // Elite enemies are larger, more imposing
    const mesh = MeshBuilder.CreateCapsule(name || 'eliteEnemy', {
      height: 3,
      radius: 0.8,
    }, this.scene);
    
    const mat = new StandardMaterial('eliteMat', this.scene);
    mat.diffuseColor = new Color3(0.4, 0.1, 0.2);
    mat.emissiveColor = new Color3(0.6, 0.1, 0.2);
    mesh.material = mat;
    
    mesh.scaling = new Vector3(1.5, 1.5, 1.5);
    
    return mesh;
  }

  createFallbackBoss(name?: string): Mesh {
    // Generic boss fallback
    const mesh = MeshBuilder.CreateSphere(name || 'boss', {
      diameter: 3,
      segments: 16,
    }, this.scene);
    
    const mat = new StandardMaterial('bossMat', this.scene);
    mat.diffuseColor = new Color3(0.5, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.8, 0.2, 0.2);
    mesh.material = mat;
    
    return mesh;
  }

  createFallbackAnchor(name?: string): Mesh {
    // Rift anchor - crystal-like shape
    const mesh = MeshBuilder.CreatePolyhedron(name || 'anchor', {
      type: 1, // Octahedron
      size: 1.5,
    }, this.scene);
    
    const mat = new StandardMaterial('anchorMat', this.scene);
    mat.diffuseColor = new Color3(0.2, 0.2, 0.5);
    mat.emissiveColor = new Color3(0.4, 0.4, 1.0);
    mat.alpha = 0.8;
    mesh.material = mat;
    
    return mesh;
  }

  createFallbackPortal(type: 'blue' | 'standard' | 'large' = 'standard', name?: string): Mesh {
    const size = type === 'large' ? 4 : type === 'blue' ? 2 : 3;
    
    const portal = MeshBuilder.CreateTorus(name || `portal_${type}`, {
      diameter: size,
      thickness: 0.3,
      tessellation: 32,
    }, this.scene);
    
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

  // =============================================================================
  // WEAPON LOADERS - For Aidan's nephew's weapons!
  // =============================================================================

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

  // =============================================================================
  // PORTAL LOADERS
  // =============================================================================

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

  // =============================================================================
  // CLEANUP
  // =============================================================================

  dispose(): void {
    this.loadedMeshes.forEach(mesh => mesh.dispose());
    this.loadedMeshes.clear();
    this.loadingPromises.clear();
  }
}
