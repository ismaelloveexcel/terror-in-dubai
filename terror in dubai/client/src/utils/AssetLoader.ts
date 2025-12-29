import { Scene, SceneLoader, Mesh, MeshBuilder } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { hasAsset, getAssetUrl } from '../config/assetConfig';

export class AssetLoader {
  constructor(private scene: Scene) {}

  async loadModel(assetId: string, fallbackCreator: () => Mesh): Promise<Mesh> {
    if (!hasAsset(assetId)) {
      console.log(`No asset configured, using fallback`);
      return fallbackCreator();
    }

    try {
      const url = getAssetUrl(assetId);
      const result = await SceneLoader.ImportMeshAsync('', '', url, this.scene);

      if (result.meshes.length === 0) {
        console.warn(`No meshes in ${assetId}, using fallback`);
        return fallbackCreator();
      }

      // Get the root or first mesh
      const mesh = result.meshes[0] as Mesh;

      // If it's a container, find the first actual mesh
      let actualMesh: Mesh | null = null;
      if (mesh.getChildMeshes().length > 0) {
        actualMesh = mesh.getChildMeshes()[0] as Mesh;
      } else {
        actualMesh = mesh;
      }

      // Ensure it has proper collision
      actualMesh.checkCollisions = true;

      return actualMesh;
    } catch (error) {
      console.warn(`Failed to load asset ${assetId}:`, error);
      return fallbackCreator();
    }
  }

  createFallbackHive(): Mesh {
    const hive = MeshBuilder.CreateCylinder('hive', {
      height: 3,
      diameter: 2,
      tessellation: 6
    }, this.scene);
    hive.position.y = 1.5;
    return hive;
  }

  createFallbackSwarmEnemy(): Mesh {
    const body = MeshBuilder.CreateBox('swarm', {
      width: 1,
      height: 0.6,
      depth: 1.5
    }, this.scene);
    return body;
  }

  createFallbackFlyingEnemy(): Mesh {
    const body = MeshBuilder.CreateSphere('flying', {
      diameter: 0.8,
      segments: 8
    }, this.scene);

    // Wings
    const wing1 = MeshBuilder.CreateBox('wing1', {
      width: 1.2,
      height: 0.1,
      depth: 0.3
    }, this.scene);
    wing1.parent = body;
    wing1.position.x = 0.5;

    const wing2 = MeshBuilder.CreateBox('wing2', {
      width: 1.2,
      height: 0.1,
      depth: 0.3
    }, this.scene);
    wing2.parent = body;
    wing2.position.x = -0.5;

    return body;
  }

  createFallbackEliteEnemy(): Mesh {
    const body = MeshBuilder.CreateCapsule('elite', {
      height: 2.5,
      radius: 0.6
    }, this.scene);
    return body;
  }

  createFallbackBoss(): Mesh {
    const body = MeshBuilder.CreateCapsule('boss', {
      height: 4,
      radius: 1.2
    }, this.scene);

    // Add menacing features
    const head = MeshBuilder.CreateSphere('bossHead', {
      diameter: 1.8,
      segments: 16
    }, this.scene);
    head.parent = body;
    head.position.y = 2.5;

    return body;
  }

  createFallbackAnchor(): Mesh {
    const anchor = MeshBuilder.CreateTorus('anchor', {
      diameter: 2,
      thickness: 0.4,
      tessellation: 16
    }, this.scene);
    anchor.position.y = 2;
    anchor.rotation.x = Math.PI / 2;
    return anchor;
  }

  createFallbackMemoryFragment(): Mesh {
    const fragment = MeshBuilder.CreateSphere('memory', {
      diameter: 0.5,
      segments: 16
    }, this.scene);
    return fragment;
  }
}
