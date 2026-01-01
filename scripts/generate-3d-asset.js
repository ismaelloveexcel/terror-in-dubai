#!/usr/bin/env node

/**
 * SAVE ISMAEL - AI 3D Asset Generator
 * 
 * Generates 3D GLB assets using Meshy.ai's Text-to-3D API.
 * Assets are saved to the server/assets directory for use in the game.
 * 
 * Usage:
 *   node scripts/generate-3d-asset.js "a scary demogorgon monster"
 *   node scripts/generate-3d-asset.js "creepy vine tendrils" --style realistic
 *   node scripts/generate-3d-asset.js "glowing portal" --output my-portal
 * 
 * Environment:
 *   MESHY_API_KEY - Your Meshy.ai API key (required)
 * 
 * @see https://docs.meshy.ai/api-text-to-3d
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MESHY_API_BASE = 'https://api.meshy.ai/v2';
const ASSETS_DIR = path.join(__dirname, '../server/assets');
const POLL_INTERVAL = 10000; // 10 seconds
const MAX_POLL_TIME = 600000; // 10 minutes
const PLACEHOLDER_API_KEY = 'your_meshy_api_key_here';

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        prompt: '',
        style: 'realistic', // realistic, cartoon, low-poly, sculpture
        output: null,
        negativePrompt: 'low quality, blurry, distorted',
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--style' && args[i + 1]) {
            options.style = args[++i];
        } else if (arg === '--output' && args[i + 1]) {
            options.output = args[++i];
        } else if (arg === '--negative' && args[i + 1]) {
            options.negativePrompt = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        } else if (!arg.startsWith('-')) {
            options.prompt = arg;
        }
    }

    return options;
}

function printHelp() {
    console.log(`
SAVE ISMAEL - AI 3D Asset Generator

Generate 3D GLB models using Meshy.ai's Text-to-3D API.

USAGE:
  node scripts/generate-3d-asset.js <prompt> [options]

OPTIONS:
  --style <style>      Art style: realistic, cartoon, low-poly, sculpture
                       Default: realistic
  --output <name>      Output filename (without extension)
                       Default: generated from prompt
  --negative <prompt>  Negative prompt to avoid certain features
                       Default: "low quality, blurry, distorted"
  --help, -h           Show this help message

EXAMPLES:
  node scripts/generate-3d-asset.js "a terrifying demogorgon monster"
  node scripts/generate-3d-asset.js "glowing corruption vine" --style cartoon
  node scripts/generate-3d-asset.js "mind flayer boss" --output mind-flayer

ENVIRONMENT:
  MESHY_API_KEY        Your Meshy.ai API key (required)
                       Get one at: https://meshy.ai

NOTES:
  - Generated assets are saved to server/assets/
  - Typical generation time: 2-5 minutes
  - Supports GLB format (compatible with Babylon.js)
`);
}

// Make HTTP request to Meshy API
function meshyRequest(endpoint, method, data = null) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.MESHY_API_KEY;
        
        if (!apiKey || apiKey === PLACEHOLDER_API_KEY) {
            reject(new Error('MESHY_API_KEY environment variable is not set. Get your API key at https://meshy.ai'));
            return;
        }

        const url = new URL(endpoint, MESHY_API_BASE);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        reject(new Error(`API Error ${res.statusCode}: ${json.message || body}`));
                    } else {
                        resolve(json);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Download file from URL
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        
        const handleError = (err) => {
            file.close();
            fs.unlink(destPath, () => {});
            reject(err);
        };

        file.on('error', handleError);
        
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                file.close();
                fs.unlink(destPath, () => {});
                const newFile = fs.createWriteStream(destPath);
                newFile.on('error', handleError);
                
                https.get(response.headers.location, (redirectRes) => {
                    redirectRes.pipe(newFile);
                    newFile.on('finish', () => {
                        newFile.close();
                        resolve(destPath);
                    });
                }).on('error', (err) => {
                    newFile.close();
                    fs.unlink(destPath, () => {});
                    reject(err);
                });
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(destPath);
                });
            }
        }).on('error', handleError);
    });
}

// Generate filename from prompt
function generateFilename(prompt, customName) {
    if (customName) {
        return customName.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
    
    // Create a slug from the prompt
    const slug = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    
    // Add timestamp for uniqueness
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}`;
}

// Poll for task completion
async function pollTaskStatus(taskId) {
    const startTime = Date.now();
    
    console.log('⏳ Generating 3D model (this may take 2-5 minutes)...');
    
    while (Date.now() - startTime < MAX_POLL_TIME) {
        const task = await meshyRequest(`/text-to-3d/${taskId}`, 'GET');
        
        switch (task.status) {
            case 'SUCCEEDED':
                console.log('✅ Generation complete!');
                return task;
            
            case 'FAILED':
                throw new Error(`Generation failed: ${task.error || 'Unknown error'}`);
            
            case 'PENDING':
            case 'IN_PROGRESS':
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                process.stdout.write(`\r⏳ Status: ${task.status} (${elapsed}s elapsed)...`);
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
                break;
            
            default:
                console.log(`   Status: ${task.status}`);
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }
    
    throw new Error('Generation timed out after 10 minutes');
}

// Main function
async function main() {
    const options = parseArgs();
    
    if (!options.prompt) {
        console.error('❌ Error: Please provide a prompt for the 3D model.');
        console.log('   Example: node scripts/generate-3d-asset.js "a scary monster"');
        console.log('   Use --help for more options.');
        process.exit(1);
    }

    console.log('');
    console.log('🎮 SAVE ISMAEL - AI 3D Asset Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Prompt: "${options.prompt}"`);
    console.log(`🎨 Style: ${options.style}`);
    console.log('');

    try {
        // Step 1: Create text-to-3d task
        console.log('📤 Submitting generation request to Meshy.ai...');
        
        const createResponse = await meshyRequest('/text-to-3d', 'POST', {
            mode: 'preview', // Use 'refine' for higher quality (costs more)
            prompt: options.prompt,
            art_style: options.style,
            negative_prompt: options.negativePrompt,
        });

        const taskId = createResponse.result;
        console.log(`📋 Task ID: ${taskId}`);

        // Step 2: Poll for completion
        const completedTask = await pollTaskStatus(taskId);
        console.log('');

        // Step 3: Download the GLB file
        if (!completedTask.model_urls?.glb) {
            throw new Error('No GLB model URL in response');
        }

        const filename = generateFilename(options.prompt, options.output);
        const outputPath = path.join(ASSETS_DIR, `${filename}.glb`);

        // Ensure assets directory exists
        if (!fs.existsSync(ASSETS_DIR)) {
            fs.mkdirSync(ASSETS_DIR, { recursive: true });
        }

        console.log(`📥 Downloading GLB model...`);
        await downloadFile(completedTask.model_urls.glb, outputPath);

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS! Asset generated:');
        console.log(`   📁 File: ${outputPath}`);
        console.log(`   🆔 Asset ID: ${filename}`);
        console.log('');
        console.log('To use in the game, add to assetConfig.ts:');
        console.log(`   ${filename.replace(/-/g, '_').toUpperCase()}: '${filename}'`);
        console.log('');

        // Also download thumbnail if available
        if (completedTask.thumbnail_url) {
            const thumbPath = path.join(ASSETS_DIR, `${filename}-thumb.png`);
            await downloadFile(completedTask.thumbnail_url, thumbPath);
            console.log(`   🖼️  Thumbnail: ${thumbPath}`);
        }

    } catch (error) {
        console.error('');
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Run
main();
