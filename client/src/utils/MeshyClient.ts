// Client-side API wrapper for Meshy.ai proxy

export interface MeshyTaskStatus {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_urls?: {
    glb?: string;
  };
  error?: string;
}

const API_BASE = '/api/meshy';

export class MeshyClient {
  static async createPreview(prompt: string, artStyle: string = 'low-poly'): Promise<string> {
    const response = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        art_style: artStyle,
        negative_prompt: 'high poly, realistic textures, complex geometry',
        ai_model: 'meshy-4'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create preview task');
    }

    const data = await response.json();
    return data.id;
  }

  static async createRefine(previewTaskId: string): Promise<string> {
    const response = await fetch(`${API_BASE}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preview_task_id: previewTaskId,
        texture_richness: 'medium',
        enable_pbr: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create refine task');
    }

    const data = await response.json();
    return data.id;
  }

  static async getTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    const response = await fetch(`${API_BASE}/task/${taskId}`);

    if (!response.ok) {
      throw new Error('Failed to get task status');
    }

    return await response.json();
  }

  static async pollUntilComplete(taskId: string, maxWaitMs: number = 900000): Promise<MeshyTaskStatus> {
    const startTime = Date.now();
    let delay = 5000; // Start with 5s

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getTaskStatus(taskId);

      if (status.status === 'SUCCEEDED' || status.status === 'FAILED') {
        return status;
      }

      console.log(`Task ${taskId}: ${status.status}... waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff up to 30s
      delay = Math.min(delay * 1.2, 30000);
    }

    throw new Error('Task timeout');
  }
}
