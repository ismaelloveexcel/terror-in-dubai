import { Scene, Sound } from '@babylonjs/core';

export class AudioManager {
  private sounds: Map<string, Sound> = new Map();
  private unlocked: boolean = false;

  constructor(private scene: Scene) {}

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    // Unlock audio context on user gesture (required for mobile)
    const engine = this.scene.getEngine();
    const audioContext = (engine as any).audioContext;

    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('Audio unlocked');
    }

    this.unlocked = true;
  }

  loadSound(name: string, url: string, options?: {
    loop?: boolean;
    autoplay?: boolean;
    volume?: number;
  }): void {
    try {
      const sound = new Sound(name, url, this.scene, null, {
        loop: options?.loop || false,
        autoplay: options?.autoplay || false,
        volume: options?.volume || 1.0
      });
      this.sounds.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  play(name: string): void {
    const sound = this.sounds.get(name);
    if (sound && this.unlocked) {
      sound.play();
    }
  }

  stop(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
    }
  }

  setVolume(name: string, volume: number): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.setVolume(volume);
    }
  }

  dispose(): void {
    this.sounds.forEach(sound => sound.dispose());
    this.sounds.clear();
  }
}
