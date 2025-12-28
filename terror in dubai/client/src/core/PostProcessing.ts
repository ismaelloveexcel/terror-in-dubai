import {
  Scene,
  Camera,
  DefaultRenderingPipeline,
  GlowLayer,
  Color4
} from '@babylonjs/core';
import { isMobile, performanceConfig } from '../config/gameConfig';

/**
 * PostProcessing - Enhanced visual effects for the game
 * 
 * Features:
 * - Bloom/Glow for emissive materials (enemies, collectibles, hazards)
 * - Chromatic aberration for eerie atmosphere
 * - Vignette for cinematic feel
 * - Tone mapping for better color grading
 * - Sharpen for crisp visuals (desktop only)
 */
export class PostProcessing {
  private pipeline: DefaultRenderingPipeline | null = null;
  private glowLayer: GlowLayer | null = null;
  private intensityMultiplier: number = 1.0;

  constructor(private scene: Scene, private camera: Camera) {
    this.setupPipeline();
    this.setupGlowLayer();
  }

  private setupPipeline(): void {
    // Only create pipeline on desktop for performance
    if (isMobile && performanceConfig.renderScale < 1) {
      return;
    }

    this.pipeline = new DefaultRenderingPipeline(
      'defaultPipeline',
      true, // HDR
      this.scene,
      [this.camera]
    );

    // Bloom - creates eerie glow on lights and emissive materials
    this.pipeline.bloomEnabled = true;
    this.pipeline.bloomThreshold = 0.7;
    this.pipeline.bloomWeight = 0.4;
    this.pipeline.bloomKernel = 64;
    this.pipeline.bloomScale = 0.5;

    // Chromatic aberration - subtle distortion for horror feel
    this.pipeline.chromaticAberrationEnabled = true;
    this.pipeline.chromaticAberration.aberrationAmount = 15;
    this.pipeline.chromaticAberration.radialIntensity = 0.8;

    // Vignette - darkens edges for cinematic look
    this.pipeline.imageProcessingEnabled = true;
    this.pipeline.imageProcessing.vignetteEnabled = true;
    this.pipeline.imageProcessing.vignetteWeight = 1.5;
    this.pipeline.imageProcessing.vignetteStretch = 0.8;
    this.pipeline.imageProcessing.vignetteColor = new Color4(0.1, 0, 0, 1); // Red tint
    this.pipeline.imageProcessing.vignetteCameraFov = 0.9;

    // Tone mapping for better dynamic range
    this.pipeline.imageProcessing.toneMappingEnabled = true;
    this.pipeline.imageProcessing.toneMappingType = 1; // ACES

    // Contrast and exposure adjustments
    this.pipeline.imageProcessing.contrast = 1.2;
    this.pipeline.imageProcessing.exposure = 0.9;

    // Color grading - slight red/crimson tint for "Upside-Down" look
    this.pipeline.imageProcessing.colorCurvesEnabled = true;
    if (this.pipeline.imageProcessing.colorCurves) {
      this.pipeline.imageProcessing.colorCurves.globalHue = 0;
      this.pipeline.imageProcessing.colorCurves.globalDensity = 10;
      this.pipeline.imageProcessing.colorCurves.globalSaturation = 20;
    }

    // Sharpen (desktop only for performance)
    if (!isMobile) {
      this.pipeline.sharpenEnabled = true;
      this.pipeline.sharpen.edgeAmount = 0.3;
      this.pipeline.sharpen.colorAmount = 0.8;
    }

    // FXAA anti-aliasing
    this.pipeline.fxaaEnabled = true;
  }

  private setupGlowLayer(): void {
    // Glow layer for emissive materials
    this.glowLayer = new GlowLayer('glow', this.scene, {
      mainTextureFixedSize: isMobile ? 256 : 512,
      blurKernelSize: isMobile ? 32 : 64
    });

    // Adjust glow intensity
    this.glowLayer.intensity = 0.8;

    // Customize which meshes glow more intensely
    this.glowLayer.customEmissiveColorSelector = (mesh, _subMesh, _material, result) => {
      // Make certain objects glow brighter
      if (mesh.name.includes('memory') || mesh.name.includes('hazard')) {
        result.set(1.5, 1.2, 0.3, 1); // Golden glow for memory fragments
      } else if (mesh.name.includes('rune')) {
        result.set(0.5, 0.5, 1.5, 1); // Blue glow for runes
      } else if (mesh.name.includes('hive') || mesh.name.includes('anchor')) {
        result.set(1, 0.2, 0.2, 1); // Red glow for spawners
      }
    };
  }

  /**
   * Set intensity of post-processing effects
   * @param multiplier Value from 0 to 2 (0 = off, 1 = normal, 2 = intense)
   */
  setIntensity(multiplier: number): void {
    this.intensityMultiplier = Math.max(0, Math.min(2, multiplier));

    if (this.pipeline) {
      this.pipeline.bloomWeight = 0.4 * this.intensityMultiplier;
      this.pipeline.imageProcessing.vignetteWeight = 1.5 * this.intensityMultiplier;

      if (this.pipeline.chromaticAberration) {
        this.pipeline.chromaticAberration.aberrationAmount = 15 * this.intensityMultiplier;
      }
    }

    if (this.glowLayer) {
      this.glowLayer.intensity = 0.8 * this.intensityMultiplier;
    }
  }

  /**
   * Trigger damage effect - intensify red effects briefly
   */
  triggerDamageEffect(): void {
    if (!this.pipeline) return;

    // Intensify vignette and chromatic aberration
    const originalVignette = this.pipeline.imageProcessing.vignetteWeight;
    const originalAberration = this.pipeline.chromaticAberration?.aberrationAmount || 15;

    this.pipeline.imageProcessing.vignetteWeight = 3.0;
    if (this.pipeline.chromaticAberration) {
      this.pipeline.chromaticAberration.aberrationAmount = 50;
    }

    // Restore after brief delay
    setTimeout(() => {
      if (this.pipeline) {
        this.pipeline.imageProcessing.vignetteWeight = originalVignette;
        if (this.pipeline.chromaticAberration) {
          this.pipeline.chromaticAberration.aberrationAmount = originalAberration;
        }
      }
    }, 200);
  }

  /**
   * Trigger boss phase change effect
   */
  triggerBossPhaseEffect(): void {
    if (!this.pipeline || !this.glowLayer) return;

    // Flash the glow layer
    const originalIntensity = this.glowLayer.intensity;
    this.glowLayer.intensity = 2.0;

    // Invert colors briefly
    this.pipeline.imageProcessing.exposure = 2.0;

    setTimeout(() => {
      if (this.glowLayer && this.pipeline) {
        this.glowLayer.intensity = originalIntensity;
        this.pipeline.imageProcessing.exposure = 0.9;
      }
    }, 300);
  }

  /**
   * Toggle low-performance mode
   */
  setLowPerformanceMode(enabled: boolean): void {
    if (this.pipeline) {
      this.pipeline.bloomEnabled = !enabled;
      this.pipeline.chromaticAberrationEnabled = !enabled;
      this.pipeline.sharpenEnabled = !enabled;
    }

    if (this.glowLayer) {
      this.glowLayer.isEnabled = !enabled;
    }
  }

  dispose(): void {
    if (this.pipeline) {
      this.pipeline.dispose();
      this.pipeline = null;
    }

    if (this.glowLayer) {
      this.glowLayer.dispose();
      this.glowLayer = null;
    }
  }
}
