/**
 * SAVE ISMAEL - Express Server
 * Serves assets and provides API endpoints
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Static assets with caching
app.use('/assets', express.static(path.join(__dirname, '../assets'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
        // Set appropriate content type for GLB files
        if (filePath.endsWith('.glb')) {
            res.set('Content-Type', 'model/gltf-binary');
        }
    }
}));

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        game: 'SAVE ISMAEL',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Get available assets list
app.get('/api/assets', (req, res) => {
    const assets = {
        enemies: {
            hiveModel: '019b6990-8959-78a0-b2bb-07a545d27f3c',
            swarmEnemy: '019b6990-91e3-78a2-a5b3-1291e610b633',
            flyingEnemy: '019b6990-9622-7588-8bb7-ef219121b5c1',
            eliteEnemy: '019b6990-9a67-7072-a0fa-88c7b92b3b93',
            mindFlayer: '019b6a00-ef68-76eb-9820-97273eb1b774'
        },
        bosses: {
            vecna: '019b6990-9eb0-78a7-b171-c6ae4467fce2'
        },
        environment: {
            anchor: '019b6990-8d9d-78a2-98f8-b2a673b06ff6',
            vineCluster: '019b6990-a2f1-7072-9f02-cf6711208df2',
            sporeCloud: '019b6990-a72f-78a7-931a-effc48600868',
            fleshWall: '019b6990-afd0-7769-83c9-a0d490f8db36',
            metroPillar: '019b6990-b40f-7588-858d-4f00e4871ca0',
            deadPalm: '019b6990-b853-7077-8a2f-7f3a1728863d',
            corruptionNode: '019b6a06-0bd9-7b86-9869-c8c152ed17d8'
        },
        collectibles: {
            memoryFragment: '019b6990-ab70-7588-9a63-353df34e1460'
        }
    };
    
    res.json(assets);
});

// Get asset URL by ID
app.get('/api/assets/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        id,
        url: `/assets/${id}.glb`
    });
});

// Save progress (for future implementation)
app.post('/api/progress/save', (req, res) => {
    // In a real implementation, this would save to a database
    const { playerId, progress } = req.body;
    
    console.log(`Saving progress for player: ${playerId}`);
    
    res.json({
        success: true,
        message: 'Progress saved',
        timestamp: new Date().toISOString()
    });
});

// Load progress
app.get('/api/progress/:playerId', (req, res) => {
    const { playerId } = req.params;
    
    // In a real implementation, this would load from a database
    res.json({
        playerId,
        progress: null, // No saved progress
        message: 'No saved progress found'
    });
});

// Leaderboard (future feature)
app.get('/api/leaderboard', (req, res) => {
    res.json({
        leaderboard: [],
        message: 'Leaderboard coming soon!'
    });
});

// Game statistics
app.get('/api/stats', (req, res) => {
    res.json({
        totalPlayers: 0,
        vecnaDefeats: 0,
        averagePlaytime: 0,
        message: 'Statistics tracking coming soon!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.url} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║          SAVE ISMAEL SERVER            ║');
    console.log('║    An Upside Down Dubai Adventure      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Server running on port ${PORT}            ║`);
    console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}              ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Assets: http://localhost:${PORT}/api/assets`);
    console.log('');
});

export default app;
