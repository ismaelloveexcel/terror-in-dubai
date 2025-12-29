import { Game } from './core/Game';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas');

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas not found');
  }

  // Create game
  new Game(canvas);

  console.log('🎮 Save Ismael - Game Loaded');
  console.log('📱 Mobile controls: Virtual joystick (left) + Fire button (right)');
  console.log('💻 Desktop controls: WASD + Mouse + Left Click');
  console.log('⚙️ Use Settings menu to toggle Family Mode');
});
