/**
 * SAVE ISMAEL - Express Server
 * Serves assets and provides API endpoints
 * 
 * Security enhancements included:
 * - Helmet for secure HTTP headers
 * - Rate limiting on API endpoints
 * - CORS with configurable origins
 * - Input validation
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Helmet for secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Babylon.js
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'", "blob:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Babylon.js asset loading
}));

// Security: Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Middleware
app.use(compression());
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Input validation helper
const validatePlayerId = (playerId) => {
    if (!playerId || typeof playerId !== 'string') return false;
    // Allow only alphanumeric characters, max 64 chars (security: no hyphens to prevent path traversal)
    return /^[a-zA-Z0-9]{1,64}$/.test(playerId);
};

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
        version: '2.0.0',
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
    
    // Validate asset ID format (UUID format: 8-4-4-4-12)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({
            error: 'Invalid asset ID format',
            message: 'Asset ID must be a valid UUID'
        });
    }
    
    res.json({
        id,
        url: `/assets/${id}.glb`
    });
});

// Save progress (for future implementation)
app.post('/api/progress/save', (req, res) => {
    const { playerId, progress } = req.body;
    
    // Validate input
    if (!validatePlayerId(playerId)) {
        return res.status(400).json({
            error: 'Invalid player ID',
            message: 'Player ID must be alphanumeric and max 64 characters'
        });
    }
    
    if (!progress || typeof progress !== 'object') {
        return res.status(400).json({
            error: 'Invalid progress data',
            message: 'Progress must be a valid object'
        });
    }
    
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
    
    // Validate player ID
    if (!validatePlayerId(playerId)) {
        return res.status(400).json({
            error: 'Invalid player ID',
            message: 'Player ID must be alphanumeric and max 64 characters'
        });
    }
    
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
    const env = (process.env.NODE_ENV || 'development').slice(0, 19).padEnd(19);
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║          SAVE ISMAEL SERVER            ║');
    console.log('║    An Upside Down Dubai Adventure      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Server running on port ${String(PORT).padEnd(14)}║`);
    console.log(`║  Environment: ${env}║`);
    console.log('║  Security: Helmet + Rate Limiting      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Assets: http://localhost:${PORT}/api/assets`);
    console.log('');
});

export default app;
