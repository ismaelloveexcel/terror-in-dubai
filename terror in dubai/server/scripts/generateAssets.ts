import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_BASE = 'https://api.meshy.ai';

interface AssetDefinition {
  name: string;
  prompt: string;
  configKey: string;
}

const assets: AssetDefinition[] = [
  {
    name: 'Hive Spawner',
    prompt: 'organic alien hive spawner, dark red pulsing flesh, tentacles and vines, corrupted biomass, low poly, game ready, horror style, mobile optimized',
    configKey: 'hiveModelAssetId'
  },
  {
    name: 'Signal Anchor',
    prompt: 'floating corrupted signal antenna, dark metallic torus ring, pulsing blue energy, alien technology, low poly, game ready, sci-fi horror, mobile optimized',
    configKey: 'anchorAssetId'
  },
  {
    name: 'Swarm Enemy (Demodog)',
    prompt: 'small quadruped alien creature, dark red skin, no face, predatory stance, low poly, game ready, horror monster, mobile optimized',
    configKey: 'swarmEnemyAssetId'
  },
  {
    name: 'Flying Enemy (Demobat)',
    prompt: 'small flying alien bat creature, dark blue leathery wings, elongated body, horror monster, low poly, game ready, mobile optimized',
    configKey: 'flyingEnemyAssetId'
  },
  {
    name: 'Elite Enemy (Demogorgon)',
    prompt: 'tall bipedal alien creature, dark crimson skin, menacing humanoid silhouette, powerful build, horror monster, low poly, game ready, mobile optimized',
    configKey: 'eliteEnemyAssetId'
  },
  {
    name: 'Boss (Vecna)',
    prompt: 'massive corrupted humanoid boss, dark red decaying flesh, imposing stance, tendrils and vines, final boss monster, low poly, game ready, horror, mobile optimized',
    configKey: 'bossAssetId'
  }
];

async function createPreviewTask(prompt: string): Promise<string> {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY not set');
  }

  const response = await axios.post(
    `${MESHY_API_BASE}/v2/text-to-3d`,
    {
      mode: 'preview',
      prompt,
      art_style: 'low-poly',
      negative_prompt: 'high poly, realistic textures, complex geometry, pbr materials',
      ai_model: 'meshy-4'
    },
    {
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.result;
}

async function createRefineTask(previewTaskId: string): Promise<string> {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY not set');
  }

  const response = await axios.post(
    `${MESHY_API_BASE}/v2/text-to-3d`,
    {
      mode: 'refine',
      preview_task_id: previewTaskId,
      texture_richness: 'low',
      enable_pbr: false
    },
    {
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.result;
}

async function pollTaskStatus(taskId: string, maxWaitMs: number = 900000): Promise<any> {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY not set');
  }

  const startTime = Date.now();
  let delay = 5000;

  while (Date.now() - startTime < maxWaitMs) {
    const response = await axios.get(
      `${MESHY_API_BASE}/v2/text-to-3d/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`
        }
      }
    );

    const status = response.data.status;
    console.log(`  Task ${taskId}: ${status}`);

    if (status === 'SUCCEEDED') {
      return response.data;
    } else if (status === 'FAILED') {
      throw new Error(`Task failed: ${response.data.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.2, 30000);
  }

  throw new Error('Task timeout');
}

async function downloadModel(url: string, taskId: string): Promise<void> {
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filePath = path.join(assetsDir, `${taskId}.glb`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, response.data);

  const sizeMB = (response.data.length / 1024 / 1024).toFixed(2);
  console.log(`  ✅ Downloaded: ${taskId}.glb (${sizeMB}MB)`);
}

async function generateAsset(asset: AssetDefinition): Promise<{ configKey: string; taskId: string }> {
  console.log(`\n🔨 Generating: ${asset.name}`);
  console.log(`Prompt: ${asset.prompt}`);

  // Create preview
  console.log('  Creating preview...');
  const previewId = await createPreviewTask(asset.prompt);
  console.log(`  Preview task: ${previewId}`);

  // Wait for preview
  console.log('  Waiting for preview...');
  await pollTaskStatus(previewId);

  // Create refine
  console.log('  Creating refined model...');
  const refineId = await createRefineTask(previewId);
  console.log(`  Refine task: ${refineId}`);

  // Wait for refine
  console.log('  Waiting for refined model...');
  const result = await pollTaskStatus(refineId);

  // Download
  if (result.model_urls?.glb) {
    console.log('  Downloading GLB...');
    await downloadModel(result.model_urls.glb, refineId);
  } else {
    throw new Error('No GLB URL in result');
  }

  return {
    configKey: asset.configKey,
    taskId: refineId
  };
}

async function updateAssetConfig(results: { configKey: string; taskId: string }[]): Promise<void> {
  const configPath = path.join(__dirname, '../../client/src/config/assetConfig.ts');
  let config = fs.readFileSync(configPath, 'utf-8');

  results.forEach(({ configKey, taskId }) => {
    const regex = new RegExp(`${configKey}:\\s*['"][^'"]*['"]`);
    config = config.replace(regex, `${configKey}: '${taskId}'`);
  });

  fs.writeFileSync(configPath, config);
  console.log('\n✅ Updated assetConfig.ts with task IDs');
}

async function main() {
  console.log('🎨 Meshy.ai Asset Generator');
  console.log('===========================\n');

  if (!MESHY_API_KEY) {
    console.error('❌ MESHY_API_KEY not set in .env file');
    console.log('Please add your Meshy API key to the .env file and try again.');
    process.exit(1);
  }

  console.log(`📦 Generating ${assets.length} assets...`);

  const results: { configKey: string; taskId: string }[] = [];

  for (const asset of assets) {
    try {
      const result = await generateAsset(asset);
      results.push(result);
    } catch (error: any) {
      console.error(`❌ Failed to generate ${asset.name}:`, error.message);
      console.log('Continuing with remaining assets...\n');
    }
  }

  if (results.length > 0) {
    await updateAssetConfig(results);

    console.log('\n🎉 Asset generation complete!');
    console.log(`Generated ${results.length}/${assets.length} assets successfully.`);
    console.log('\nTask IDs:');
    results.forEach(({ configKey, taskId }) => {
      console.log(`  ${configKey}: ${taskId}`);
    });
  } else {
    console.log('\n❌ No assets were generated successfully.');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
