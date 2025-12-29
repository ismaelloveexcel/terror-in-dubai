/**
 * SAVE ISMAEL - Main React Application
 * A Stranger Things-inspired FPS game set in Upside Down Dubai
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import '@babylonjs/loaders';

// Game imports
import { Game } from './core/Game';

// Styles
import './App.css';

// Game states
type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'levelComplete' | 'victory' | 'gameover';

// Loading screen component
const LoadingScreen: React.FC<{ message: string; subtitle?: string }> = ({ message, subtitle }) => (
    <div className="loading-screen">
        <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>{message}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    </div>
);

// Main menu component
const MainMenuOverlay: React.FC<{
    onNewGame: () => void;
    onContinue: () => void;
    hasSaveData: boolean;
}> = ({ onNewGame, onContinue, hasSaveData }) => (
    <div className="main-menu">
        <div className="menu-content">
            <h1 className="game-title">SAVE ISMAEL</h1>
            <p className="game-subtitle">An Upside Down Dubai Adventure</p>
            
            <div className="menu-buttons">
                <button className="menu-btn primary" onClick={onNewGame}>
                    NEW GAME
                </button>
                {hasSaveData && (
                    <button className="menu-btn" onClick={onContinue}>
                        CONTINUE
                    </button>
                )}
                <button className="menu-btn" disabled>
                    OPTIONS
                </button>
                <button className="menu-btn" disabled>
                    CREDITS
                </button>
            </div>
            
            <div className="dedication">
                <p>For Aidan</p>
                <p>From Mammoo Ismael</p>
            </div>
        </div>
    </div>
);

// Pause menu component
const PauseMenu: React.FC<{
    onResume: () => void;
    onMainMenu: () => void;
}> = ({ onResume, onMainMenu }) => (
    <div className="pause-menu">
        <div className="pause-content">
            <h2>PAUSED</h2>
            <div className="pause-buttons">
                <button className="menu-btn primary" onClick={onResume}>
                    RESUME
                </button>
                <button className="menu-btn" onClick={onMainMenu}>
                    MAIN MENU
                </button>
            </div>
        </div>
    </div>
);

// Level complete component
const LevelCompleteOverlay: React.FC<{
    level: number;
    time: number;
    evidenceCollected: boolean;
    onContinue: () => void;
}> = ({ level, time, evidenceCollected, onContinue }) => (
    <div className="level-complete">
        <div className="complete-content">
            <h2>LEVEL {level} COMPLETE</h2>
            <div className="stats">
                <p>Time: {Math.floor(time / 60)}:{String(Math.floor(time % 60)).padStart(2, '0')}</p>
                <p>Evidence: {evidenceCollected ? '✓ Collected' : '✗ Missed'}</p>
            </div>
            <button className="menu-btn primary" onClick={onContinue}>
                CONTINUE
            </button>
        </div>
    </div>
);

// Victory screen component
const VictoryScreen: React.FC<{
    totalTime: number;
    evidenceCount: number;
    onMainMenu: () => void;
}> = ({ totalTime, evidenceCount, onMainMenu }) => (
    <div className="victory-screen">
        <div className="victory-content">
            <h1>VECNA DEFEATED</h1>
            <h2>UNCLE ISMAEL SAVED!</h2>
            
            <div className="final-stats">
                <p>Total Time: {Math.floor(totalTime / 60)}:{String(Math.floor(totalTime % 60)).padStart(2, '0')}</p>
                <p>Evidence Collected: {evidenceCount}/6</p>
            </div>
            
            <div className="credits-text">
                <p>In the game: You walked into the Upside Down and dragged me out.</p>
                <p>In real life: Same energy, honestly.</p>
                <br />
                <p>Vecna thought he understood what makes people strong.</p>
                <p>He didn't.</p>
                <br />
                <p>See you at movie night. Bring snacks.</p>
                <p className="signature">- Mammoo Ismael, 2025</p>
            </div>
            
            <button className="menu-btn primary" onClick={onMainMenu}>
                MAIN MENU
            </button>
        </div>
    </div>
);

// Game over component
const GameOverScreen: React.FC<{
    onRetry: () => void;
    onMainMenu: () => void;
}> = ({ onRetry, onMainMenu }) => (
    <div className="game-over">
        <div className="gameover-content">
            <h1>YOU DIED</h1>
            <p>The Upside Down claims another victim...</p>
            <div className="gameover-buttons">
                <button className="menu-btn primary" onClick={onRetry}>
                    TRY AGAIN
                </button>
                <button className="menu-btn" onClick={onMainMenu}>
                    MAIN MENU
                </button>
            </div>
        </div>
    </div>
);

// Main App component
const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const engineRef = useRef<Engine | null>(null);
    
    const [gameState, setGameState] = useState<GameState>('loading');
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');
    const [loadingSubtitle, setLoadingSubtitle] = useState('');
    const [hasSaveData, setHasSaveData] = useState(false);
    const [levelCompleteData, setLevelCompleteData] = useState<any>(null);
    const [victoryData, setVictoryData] = useState<any>(null);
    
    // Initialize Babylon.js
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        
        // Create game (Game creates its own engine and scene)
        const game = new Game(canvas);
        gameRef.current = game;
        
        // Check for save data
        const saveData = localStorage.getItem('saveIsmael_progress');
        setHasSaveData(!!saveData);
        
        // Initialize game
        game.initialize().then(() => {
            setLoadingMessage('Ready');
            setGameState('menu');
        }).catch((error) => {
            console.error('Failed to initialize game:', error);
            setLoadingMessage('Failed to load game');
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            // Game handles its own resize
        });
        
        return () => {
            game.dispose();
        };
    }, []);
    
    // Event listeners
    useEffect(() => {
        const handleShowLoading = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setLoadingMessage(detail.message);
            setLoadingSubtitle(detail.subtitle || '');
            setGameState('loading');
        };
        
        const handleHideLoading = () => {
            setGameState('playing');
        };
        
        const handleLevelComplete = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setLevelCompleteData(detail);
            setGameState('levelComplete');
        };
        
        const handleVictory = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setVictoryData(detail);
            setGameState('victory');
        };
        
        const handleGameOver = () => {
            setGameState('gameover');
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (gameState === 'playing') {
                    setGameState('paused');
                    gameRef.current?.pause();
                } else if (gameState === 'paused') {
                    setGameState('playing');
                    gameRef.current?.resume();
                }
            }
        };
        
        window.addEventListener('showLoading', handleShowLoading);
        window.addEventListener('hideLoading', handleHideLoading);
        window.addEventListener('showLevelComplete', handleLevelComplete);
        window.addEventListener('showVictory', handleVictory);
        window.addEventListener('gameOver', handleGameOver);
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('showLoading', handleShowLoading);
            window.removeEventListener('hideLoading', handleHideLoading);
            window.removeEventListener('showLevelComplete', handleLevelComplete);
            window.removeEventListener('showVictory', handleVictory);
            window.removeEventListener('gameOver', handleGameOver);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState]);
    
    // Game actions
    const handleNewGame = useCallback(() => {
        setLoadingMessage('Loading Level 1...');
        setLoadingSubtitle('Ibn Battuta Mall');
        setGameState('loading');
        
        gameRef.current?.startNewGame().then(() => {
            setGameState('playing');
        });
    }, []);
    
    const handleContinue = useCallback(() => {
        setLoadingMessage('Loading saved game...');
        setGameState('loading');
        
        gameRef.current?.continueGame().then(() => {
            setGameState('playing');
        });
    }, []);
    
    const handleResume = useCallback(() => {
        setGameState('playing');
        gameRef.current?.resume();
    }, []);
    
    const handleMainMenu = useCallback(() => {
        setGameState('menu');
        gameRef.current?.returnToMenu();
    }, []);
    
    const handleLevelContinue = useCallback(() => {
        setLoadingMessage('Loading next level...');
        setGameState('loading');
        
        gameRef.current?.nextLevel().then(() => {
            setGameState('playing');
        });
    }, []);
    
    const handleRetry = useCallback(() => {
        setLoadingMessage('Reloading...');
        setGameState('loading');
        
        gameRef.current?.retry().then(() => {
            setGameState('playing');
        });
    }, []);
    
    return (
        <div className="game-container">
            <canvas ref={canvasRef} id="gameCanvas" />
            
            {/* Loading Screen */}
            {gameState === 'loading' && (
                <LoadingScreen message={loadingMessage} subtitle={loadingSubtitle} />
            )}
            
            {/* Main Menu */}
            {gameState === 'menu' && (
                <MainMenuOverlay
                    onNewGame={handleNewGame}
                    onContinue={handleContinue}
                    hasSaveData={hasSaveData}
                />
            )}
            
            {/* Pause Menu */}
            {gameState === 'paused' && (
                <PauseMenu
                    onResume={handleResume}
                    onMainMenu={handleMainMenu}
                />
            )}
            
            {/* Level Complete */}
            {gameState === 'levelComplete' && levelCompleteData && (
                <LevelCompleteOverlay
                    level={levelCompleteData.level}
                    time={levelCompleteData.time}
                    evidenceCollected={levelCompleteData.evidenceCollected}
                    onContinue={handleLevelContinue}
                />
            )}
            
            {/* Victory Screen */}
            {gameState === 'victory' && victoryData && (
                <VictoryScreen
                    totalTime={victoryData.totalTime}
                    evidenceCount={victoryData.evidenceCollected}
                    onMainMenu={handleMainMenu}
                />
            )}
            
            {/* Game Over */}
            {gameState === 'gameover' && (
                <GameOverScreen
                    onRetry={handleRetry}
                    onMainMenu={handleMainMenu}
                />
            )}
            
            {/* Mobile Controls */}
            <div id="mobile-controls" className={gameState === 'playing' ? 'visible' : 'hidden'}>
                <div id="joystick-zone"></div>
                <div id="action-buttons">
                    <button id="fire-btn">FIRE</button>
                    <button id="interact-btn">USE</button>
                </div>
            </div>
        </div>
    );
};

export default App;
