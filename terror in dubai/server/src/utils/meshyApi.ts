import axios from 'axios';
import fs from 'fs';
import path from 'path';

const MESHY_API_BASE = 'https://api.meshy.ai';
const API_KEY = process.env.MESHY_API_KEY;

export interface MeshyPreviewRequest {
  prompt: string;
  art_style?: string;
  negative_prompt?: string;
  ai_model?: string;
}

export interface MeshyRefineRequest {
  preview_task_id: string;
  texture_richness?: string;
  enable_pbr?: boolean;
}

export interface MeshyTaskResponse {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_urls?: {
    glb?: string;
  };
  error?: string;
}

export async function createPreviewTask(data: MeshyPreviewRequest): Promise<{ id: string }> {
  if (!API_KEY) {
    console.warn('⚠️ MESHY_API_KEY not set - returning mock task ID');
    return { id: `mock-preview-${Date.now()}` };
  }

  try {
    const response = await axios.post(
      `${MESHY_API_BASE}/v2/text-to-3d`,
      {
        mode: 'preview',
        prompt: data.prompt,
        art_style: data.art_style || 'realistic',
        negative_prompt: data.negative_prompt || '',
        ai_model: data.ai_model || 'meshy-4'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { id: response.data.result };
  } catch (error: any) {
    console.error('Meshy preview error:', error.response?.data || error.message);
    throw new Error('Failed to create preview task');
  }
}

export async function createRefineTask(data: MeshyRefineRequest): Promise<{ id: string }> {
  if (!API_KEY) {
    console.warn('⚠️ MESHY_API_KEY not set - returning mock task ID');
    return { id: `mock-refine-${Date.now()}` };
  }

  try {
    const response = await axios.post(
      `${MESHY_API_BASE}/v2/text-to-3d`,
      {
        mode: 'refine',
        preview_task_id: data.preview_task_id,
        texture_richness: data.texture_richness || 'high',
        enable_pbr: data.enable_pbr !== false
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { id: response.data.result };
  } catch (error: any) {
    console.error('Meshy refine error:', error.response?.data || error.message);
    throw new Error('Failed to create refine task');
  }
}

export async function getTaskStatus(taskId: string): Promise<MeshyTaskResponse> {
  // Check if cached file exists
  const assetPath = path.join(__dirname, '../../assets', `${taskId}.glb`);
  if (fs.existsSync(assetPath)) {
    return {
      id: taskId,
      status: 'SUCCEEDED',
      model_urls: { glb: `/assets/${taskId}.glb` }
    };
  }

  if (!API_KEY || taskId.startsWith('mock-')) {
    return {
      id: taskId,
      status: 'FAILED',
      error: 'Mock task or no API key - use placeholder models'
    };
  }

  try {
    const response = await axios.get(
      `${MESHY_API_BASE}/v2/text-to-3d/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const data = response.data;

    // If task succeeded and has GLB URL, download it
    if (data.status === 'SUCCEEDED' && data.model_urls?.glb) {
      await downloadModel(data.model_urls.glb, taskId);
      return {
        id: taskId,
        status: 'SUCCEEDED',
        model_urls: { glb: `/assets/${taskId}.glb` }
      };
    }

    return {
      id: taskId,
      status: data.status,
      model_urls: data.model_urls
    };
  } catch (error: any) {
    console.error('Meshy task status error:', error.response?.data || error.message);
    throw new Error('Failed to get task status');
  }
}

async function downloadModel(url: string, taskId: string): Promise<void> {
  const assetsDir = path.join(__dirname, '../../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filePath = path.join(assetsDir, `${taskId}.glb`);

  // Check file size before downloading
  const headResponse = await axios.head(url);
  const contentLength = parseInt(headResponse.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    throw new Error(`Model too large: ${(contentLength / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
  }

  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, response.data);
  console.log(`✅ Downloaded model: ${taskId}.glb (${(contentLength / 1024).toFixed(2)}KB)`);
}
