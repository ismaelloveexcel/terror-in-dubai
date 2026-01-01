/**
 * Meshy.ai API Routes
 * Provides endpoints for text-to-3D model generation
 */

import { Router } from 'express';
import { createPreviewTask, createRefineTask, getTaskStatus } from '../utils/meshyApi.js';

const router = Router();

// Create preview task
router.post('/preview', async (req, res) => {
  try {
    const result = await createPreviewTask(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create refine task
router.post('/refine', async (req, res) => {
  try {
    const result = await createRefineTask(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task status
router.get('/task/:id', async (req, res) => {
  try {
    const result = await getTaskStatus(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
