#!/usr/bin/env node

/**
 * SAVE ISMAEL - Batch 3D Asset Generator
 * 
 * Generate multiple 3D assets from a JSON configuration file.
 * Useful for creating themed asset packs for the game.
 * 
 * Usage:
 *   node scripts/batch-generate-assets.js assets-config.json
 *   node scripts/batch-generate-assets.js --stranger-things
 * 
 * @see https://docs.meshy.ai/api-text-to-3d
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const MIN_GENERATION_TIME_MINUTES = 3;
const MAX_GENERATION_TIME_MINUTES = 5;
const REQUEST_DELAY_MS = 5000; // 5 seconds between requests

// Predefined asset packs for the game
const ASSET_PACKS = {
    'stranger-things': [
        { prompt: 'terrifying demogorgon monster with flower petal head', output: 'demogorgon', style: 'realistic' },
        { prompt: 'floating mind flayer shadow monster with tentacles', output: 'mind-flayer', style: 'realistic' },
        { prompt: 'creepy corruption vines with red glowing tips', output: 'corruption-vine', style: 'realistic' },
        { prompt: 'glowing purple portal to upside down dimension', output: 'portal', style: 'realistic' },
        { prompt: 'demodogs pack of monster dogs', output: 'demodog', style: 'realistic' },
        { prompt: 'floating demobat creature with wings', output: 'demobat', style: 'realistic' },
    ],
    'dubai-landmarks': [
        { prompt: 'burj khalifa tower skyscraper', output: 'burj-khalifa', style: 'low-poly' },
        { prompt: 'dubai frame golden arch landmark', output: 'dubai-frame', style: 'low-poly' },
        { prompt: 'palm tree tropical', output: 'palm-tree', style: 'realistic' },
        { prompt: 'metro train modern dubai', output: 'metro-train', style: 'low-poly' },
        { prompt: 'shopping mall interior escalators', output: 'mall-interior', style: 'realistic' },
    ],
    'collectibles': [
        { prompt: 'glowing memory fragment crystal shard', output: 'memory-fragment', style: 'realistic' },
        { prompt: 'old leather wallet with photos', output: 'wallet', style: 'realistic' },
        { prompt: 'cracked smartphone with glowing screen', output: 'cracked-phone', style: 'realistic' },
        { prompt: 'car keys with keychain', output: 'car-keys', style: 'realistic' },
        { prompt: 'luxury wristwatch stopped at 7:42', output: 'watch', style: 'realistic' },
        { prompt: 'gift bag with bow', output: 'gift-bag', style: 'realistic' },
    ],
    'weapons': [
        { prompt: 'futuristic plasma rifle sci-fi weapon', output: 'plasma-rifle', style: 'realistic' },
        { prompt: 'baseball bat wrapped with nails', output: 'spiked-bat', style: 'realistic' },
        { prompt: 'flashlight tactical LED', output: 'flashlight', style: 'realistic' },
    ],
};

function printHelp() {
    console.log(`
SAVE ISMAEL - Batch 3D Asset Generator

Generate multiple 3D assets from a config file or predefined pack.

USAGE:
  node scripts/batch-generate-assets.js <config.json>
  node scripts/batch-generate-assets.js --<pack-name>

PREDEFINED PACKS:
  --stranger-things    Demogorgon, Mind Flayer, vines, portal, etc.
  --dubai-landmarks    Burj Khalifa, Dubai Frame, metro, etc.
  --collectibles       Memory fragments, wallet, phone, keys, etc.
  --weapons            Plasma rifle, spiked bat, flashlight

CONFIG FILE FORMAT:
  {
    "assets": [
      { "prompt": "scary monster", "output": "monster-01", "style": "realistic" },
      { "prompt": "glowing crystal", "output": "crystal-01", "style": "cartoon" }
    ]
  }

ENVIRONMENT:
  MESHY_API_KEY    Your Meshy.ai API key (required)
`);
}

function runGenerateScript(asset) {
    return new Promise((resolve, reject) => {
        const args = [
            path.join(__dirname, 'generate-3d-asset.js'),
            asset.prompt,
        ];
        
        if (asset.output) {
            args.push('--output', asset.output);
        }
        if (asset.style) {
            args.push('--style', asset.style);
        }

        console.log(`\n🚀 Generating: ${asset.prompt}`);
        console.log(`   Output: ${asset.output || 'auto'}, Style: ${asset.style || 'realistic'}`);

        const child = spawn('node', args, {
            stdio: 'inherit',
            env: process.env,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Generation failed with code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        printHelp();
        process.exit(0);
    }

    let assets = [];

    // Check for predefined packs
    const packArg = args.find(a => a.startsWith('--'));
    if (packArg) {
        const packName = packArg.substring(2);
        if (ASSET_PACKS[packName]) {
            assets = ASSET_PACKS[packName];
            console.log(`📦 Using predefined pack: ${packName}`);
        } else {
            console.error(`❌ Unknown pack: ${packName}`);
            console.log('   Available packs:', Object.keys(ASSET_PACKS).join(', '));
            process.exit(1);
        }
    } else {
        // Load from config file
        const configPath = args[0];
        if (!fs.existsSync(configPath)) {
            console.error(`❌ Config file not found: ${configPath}`);
            process.exit(1);
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            assets = config.assets || [];
        } catch (e) {
            console.error(`❌ Failed to parse config file: ${e.message}`);
            process.exit(1);
        }
    }

    if (assets.length === 0) {
        console.error('❌ No assets to generate');
        process.exit(1);
    }

    console.log('');
    console.log('🎮 SAVE ISMAEL - Batch 3D Asset Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total assets to generate: ${assets.length}`);
    console.log('');
    console.log(`⚠️  Note: Each asset takes ${MIN_GENERATION_TIME_MINUTES}-${MAX_GENERATION_TIME_MINUTES} minutes to generate.`);
    console.log(`   Estimated total time: ${assets.length * MIN_GENERATION_TIME_MINUTES}-${assets.length * MAX_GENERATION_TIME_MINUTES} minutes`);
    console.log('');

    const results = { success: [], failed: [] };

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        console.log(`\n[${i + 1}/${assets.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            await runGenerateScript(asset);
            results.success.push(asset);
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            results.failed.push({ ...asset, error: error.message });
        }

        // Add delay between requests to avoid rate limiting
        if (i < assets.length - 1) {
            console.log(`\n⏳ Waiting ${REQUEST_DELAY_MS / 1000} seconds before next request...`);
            await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
        }
    }

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BATCH GENERATION COMPLETE');
    console.log(`   ✅ Success: ${results.success.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
        console.log('\nFailed assets:');
        results.failed.forEach(a => console.log(`   - ${a.output || a.prompt}: ${a.error}`));
    }
}

main();
