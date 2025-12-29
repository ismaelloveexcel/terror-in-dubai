// SceneManager.ts - Scene Setup & Post-Processing
// Save Ismael - Premium Visual Direction

import {
  Scene,
  Vector3,
  Color3,
  Color4,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  FogMode,
  GlowLayer,
  DefaultRenderingPipeline,
  DepthOfFieldEffectBlurLevel,
  CubeTexture,
  StandardMaterial,
  PBRMaterial,
  Mesh,
  MeshBuilder,
} from '@babylonjs/core';
import { visualConfig, performanceConfig } from '../config/gameConfig';

export class SceneManager {
  private scene: Scene;
  
  // Lighting
  private ambientLight: HemisphericLight | null = null;
  private mainLight: DirectionalLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;
  
  // Effects
  private glowLayer: GlowLayer | null = null;
  private renderPipeline: DefaultRenderingPipeline | null = null;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.setupLighting();
  }
  
  // ===========================================================================
  // LIGHTING SETUP
  // ===========================================================================
  
  private setupLighting(): void {
    // Ambient light (very dim, bluish)
    this.ambientLight = new HemisphericLight(
      'ambientLight',
      new Vector3(0, 1, 0),
      this.scene
    );
    this.ambientLight.intensity = visualConfig.ambient.intensity;
    this.ambientLight.diffuse = new Color3(
      visualConfig.ambient.color.r,
      visualConfig.ambient.color.g,
      visualConfig.ambient.color.b
    );
    this.ambientLight.groundColor = new Color3(0.02, 0.02, 0.04);
    this.ambientLight.specular = Color3.Black();
    
    // Main directional light (for shadows, very dim)
    if (performanceConfig.shadowsEnabled) {
      this.mainLight = new DirectionalLight(
        'mainLight',
        new Vector3(-0.5, -1, 0.5),
        this.scene
      );
      this.mainLight.intensity = 0.3;
      this.mainLight.diffuse = new Color3(0.1, 0.1, 0.15);
      this.mainLight.specular = Color3.Black();
      
      // Shadow generator
      this.shadowGenerator = new ShadowGenerator(
        performanceConfig.shadowMapSize,
        this.mainLight
      );
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurKernel = 32;
      this.shadowGenerator.darkness = 0.5;
    }
  }
  
  // ===========================================================================
  // FOG SETUP
  // ===========================================================================
  
  public setupFog(): void {
    if (!visualConfig.fog.enabled) return;
    
    this.scene.fogMode = FogMode.EXP2;
    this.scene.fogDensity = visualConfig.fog.density;
    this.scene.fogColor = new Color3(
      visualConfig.fog.color.r,
      visualConfig.fog.color.g,
      visualConfig.fog.color.b
    );
  }
  
  public setFogDensity(density: number): void {
    this.scene.fogDensity = density;
  }
  
  public setFogColor(r: number, g: number, b: number): void {
    this.scene.fogColor = new Color3(r, g, b);
  }
  
  // ===========================================================================
  // POST-PROCESSING SETUP
  // ===========================================================================
  
  public setupPostProcessing(): void {
    if (!performanceConfig.postProcessEnabled) return;
    
    const camera = this.scene.activeCamera;
    if (!camera) return;
    
    // Create default rendering pipeline
    this.renderPipeline = new DefaultRenderingPipeline(
      'renderPipeline',
      true, // HDR
      this.scene,
      [camera]
    );
    
    // Bloom
    if (visualConfig.postProcess.bloom.enabled) {
      this.renderPipeline.bloomEnabled = true;
      this.renderPipeline.bloomThreshold = visualConfig.postProcess.bloom.threshold;
      this.renderPipeline.bloomWeight = visualConfig.postProcess.bloom.weight;
      this.renderPipeline.bloomKernel = visualConfig.postProcess.bloom.kernel;
      this.renderPipeline.bloomScale = visualConfig.postProcess.bloom.scale;
    }
    
    // Chromatic Aberration
    if (visualConfig.postProcess.chromaticAberration.enabled) {
      this.renderPipeline.chromaticAberrationEnabled = true;
      this.renderPipeline.chromaticAberration.aberrationAmount = 
        visualConfig.postProcess.chromaticAberration.amount;
    }
    
    // Grain
    if (visualConfig.postProcess.grain.enabled) {
      this.renderPipeline.grainEnabled = true;
      this.renderPipeline.grain.intensity = visualConfig.postProcess.grain.intensity;
      this.renderPipeline.grain.animated = true;
    }
    
    // Vignette (image processing)
    this.renderPipeline.imageProcessingEnabled = true;
    if (visualConfig.postProcess.vignette.enabled) {
      this.renderPipeline.imageProcessing.vignetteEnabled = true;
      this.renderPipeline.imageProcessing.vignetteWeight = 
        visualConfig.postProcess.vignette.weight;
      this.renderPipeline.imageProcessing.vignetteColor = new Color4(
        visualConfig.postProcess.vignette.color.r,
        visualConfig.postProcess.vignette.color.g,
        visualConfig.postProcess.vignette.color.b,
        1
      );
    }
    
    // Tone mapping
    this.renderPipeline.imageProcessing.toneMappingEnabled = true;
    this.renderPipeline.imageProcessing.toneMappingType = 1; // ACES
    this.renderPipeline.imageProcessing.contrast = 1.2;
    this.renderPipeline.imageProcessing.exposure = 0.9;
    
    // FXAA
    this.renderPipeline.fxaaEnabled = true;
  }
  
  // ===========================================================================
  // GLOW LAYER
  // ===========================================================================
  
  public setupGlowLayer(): void {
    if (this.glowLayer) return;
    
    this.glowLayer = new GlowLayer('glow', this.scene, {
      mainTextureFixedSize: performanceConfig.isMobile ? 256 : 512,
      blurKernelSize: performanceConfig.isMobile ? 32 : 64,
    });
    
    this.glowLayer.intensity = 0.8;
    
    // Custom glow colors for different materials
    this.glowLayer.customEmissiveColorSelector = (mesh, subMesh, material, result) => {
      if (material.name.includes('infection') || material.name.includes('vine')) {
        result.set(0, 1, 0.8, 1); // Teal glow
      } else if (material.name.includes('emergency') || material.name.includes('warning')) {
        result.set(1, 0.4, 0, 1); // Orange glow
      } else if (material.name.includes('danger') || material.name.includes('boss')) {
        result.set(0.5, 0, 0, 1); // Red glow
      }
    };
  }
  
  public setGlowIntensity(intensity: number): void {
    if (this.glowLayer) {
      this.glowLayer.intensity = intensity;
    }
  }
  
  // ===========================================================================
  // MATERIAL HELPERS
  // ===========================================================================
  
  /**
   * Create infection material with teal glow
   */
  public createInfectionMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name + '_infection', this.scene);
    
    mat.albedoColor = new Color3(0.05, 0.1, 0.1);
    mat.metallic = 0.3;
    mat.roughness = 0.6;
    mat.emissiveColor = new Color3(0, 0.8, 0.65); // Teal
    mat.emissiveIntensity = 0.5;
    
    return mat;
  }
  
  /**
   * Create wet surface material
   */
  public createWetMaterial(name: string, baseColor: Color3): PBRMaterial {
    const mat = new PBRMaterial(name + '_wet', this.scene);
    
    mat.albedoColor = baseColor;
    mat.metallic = 0.1;
    mat.roughness = 0.3; // Smoother = more reflective
    mat.environmentIntensity = 0.5;
    
    return mat;
  }
  
  /**
   * Create emergency light material
   */
  public createEmergencyLightMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name + '_emergency', this.scene);
    
    mat.albedoColor = new Color3(0.2, 0.1, 0.05);
    mat.emissiveColor = new Color3(1, 0.4, 0); // Orange
    mat.emissiveIntensity = 2.0;
    mat.metallic = 0.8;
    mat.roughness = 0.3;
    
    return mat;
  }
  
  /**
   * Create corrupted Dubai material (tarnished gold)
   */
  public createCorruptedGoldMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name + '_corruptedGold', this.scene);
    
    mat.albedoColor = new Color3(0.55, 0.45, 0.35);
    mat.metallic = 0.8;
    mat.roughness = 0.4;
    
    return mat;
  }
  
  /**
   * Create dark concrete material
   */
  public createConcreteMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name + '_concrete', this.scene);
    
    mat.albedoColor = new Color3(0.15, 0.15, 0.15);
    mat.metallic = 0;
    mat.roughness = 0.9;
    
    return mat;
  }
  
  // ===========================================================================
  // EFFECT TRIGGERS
  // ===========================================================================
  
  /**
   * Trigger damage screen effect
   */
  public triggerDamageEffect(): void {
    if (!this.renderPipeline) return;
    
    const originalVignette = this.renderPipeline.imageProcessing.vignetteWeight;
    const originalAberration = this.renderPipeline.chromaticAberration.aberrationAmount;
    
    // Intensify effects
    this.renderPipeline.imageProcessing.vignetteWeight = 3.0;
    this.renderPipeline.imageProcessing.vignetteColor = new Color4(0.5, 0, 0, 1);
    this.renderPipeline.chromaticAberration.aberrationAmount = 50;
    
    // Reset after delay
    setTimeout(() => {
      if (this.renderPipeline) {
        this.renderPipeline.imageProcessing.vignetteWeight = originalVignette;
        this.renderPipeline.imageProcessing.vignetteColor = new Color4(
          visualConfig.postProcess.vignette.color.r,
          visualConfig.postProcess.vignette.color.g,
          visualConfig.postProcess.vignette.color.b,
          1
        );
        this.renderPipeline.chromaticAberration.aberrationAmount = originalAberration;
      }
    }, 200);
  }
  
  /**
   * Trigger boss phase change effect
   */
  public triggerBossPhaseEffect(): void {
    if (!this.glowLayer || !this.renderPipeline) return;
    
    const originalGlow = this.glowLayer.intensity;
    const originalExposure = this.renderPipeline.imageProcessing.exposure;
    
    // Flash effect
    this.glowLayer.intensity = 2.0;
    this.renderPipeline.imageProcessing.exposure = 2.0;
    
    setTimeout(() => {
      if (this.glowLayer && this.renderPipeline) {
        this.glowLayer.intensity = originalGlow;
        this.renderPipeline.imageProcessing.exposure = originalExposure;
      }
    }, 300);
  }
  
  /**
   * Set low performance mode
   */
  public setLowPerformanceMode(enabled: boolean): void {
    if (enabled) {
      this.scene.fogEnabled = false;
      if (this.renderPipeline) {
        this.renderPipeline.bloomEnabled = false;
        this.renderPipeline.chromaticAberrationEnabled = false;
        this.renderPipeline.grainEnabled = false;
      }
      if (this.glowLayer) {
        this.glowLayer.intensity = 0;
      }
    } else {
      this.setupFog();
      this.setupPostProcessing();
    }
  }
  
  // ===========================================================================
  // SHADOW HELPERS
  // ===========================================================================
  
  public addShadowCaster(mesh: Mesh): void {
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }
  
  public enableShadowReceiver(mesh: Mesh): void {
    mesh.receiveShadows = performanceConfig.shadowsEnabled;
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  public dispose(): void {
    this.renderPipeline?.dispose();
    this.glowLayer?.dispose();
    this.shadowGenerator?.dispose();
    this.mainLight?.dispose();
    this.ambientLight?.dispose();
  }
}

export default SceneManager;
