import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import meshyRouter from './routes/meshy';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API routes
app.use('/api/meshy', meshyRouter);

// Serve client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', meshyConfigured: !!process.env.MESHY_API_KEY });
});

app.listen(PORT, () => {
  console.log(`🎮 Server running on port ${PORT}`);
  console.log(`🔑 Meshy API: ${process.env.MESHY_API_KEY ? 'Configured' : 'Not configured (using placeholders)'}`);
});
