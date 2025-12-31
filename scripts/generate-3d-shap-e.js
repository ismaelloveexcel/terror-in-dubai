#!/usr/bin/env node

/**
 * SAVE ISMAEL - Free AI 3D Asset Generator (Shap-E)
 * 
 * Generates 3D GLB assets using OpenAI's Shap-E model.
 * This is completely FREE and runs locally (no API key needed).
 * Requires Python 3.8+ and a GPU for best performance (CPU works but slow).
 * 
 * First-time setup:
 *   node scripts/generate-3d-shap-e.js --setup
 * 
 * Usage:
 *   node scripts/generate-3d-shap-e.js "a scary demogorgon monster"
 *   node scripts/generate-3d-shap-e.js "glowing portal" --output my-portal
 * 
 * @see https://github.com/openai/shap-e
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SHAP_E_DIR = path.join(__dirname, '../.shap-e');
const ASSETS_DIR = path.join(__dirname, '../server/assets');
const PYTHON_SCRIPT = path.join(SHAP_E_DIR, 'generate_glb.py');

function printHelp() {
    console.log(`
SAVE ISMAEL - Free AI 3D Asset Generator (Shap-E)

Generate 3D GLB models using OpenAI's Shap-E model.
This is completely FREE and runs locally - no API key needed!

REQUIREMENTS:
  - Python 3.8+
  - pip (Python package manager)
  - ~4GB disk space for model weights
  - GPU recommended (CUDA) but CPU works (slower)

FIRST-TIME SETUP:
  node scripts/generate-3d-shap-e.js --setup

USAGE:
  node scripts/generate-3d-shap-e.js <prompt> [options]

OPTIONS:
  --output <name>      Output filename (without extension)
  --guidance <scale>   Guidance scale (default: 15.0, higher = more prompt adherence)
  --steps <number>     Diffusion steps (default: 64, higher = better quality)
  --setup              Install Shap-E and dependencies
  --help, -h           Show this help message

EXAMPLES:
  node scripts/generate-3d-shap-e.js "a terrifying demogorgon monster"
  node scripts/generate-3d-shap-e.js "glowing crystal" --output crystal
  node scripts/generate-3d-shap-e.js "scary tentacle vine" --guidance 20

NOTES:
  - First run downloads ~2GB model weights (one-time)
  - Generation takes 30-60 seconds on GPU, 5-10 minutes on CPU
  - Generated assets are saved to server/assets/
`);
}

// Check if Python is available
function checkPython() {
    try {
        const version = execSync('python3 --version 2>&1 || python --version 2>&1', { encoding: 'utf-8' });
        console.log(`✅ Python found: ${version.trim()}`);
        return true;
    } catch {
        console.error('❌ Python not found. Please install Python 3.8+');
        console.log('   Download from: https://www.python.org/downloads/');
        return false;
    }
}

// Check if pip is available
function checkPip() {
    try {
        execSync('pip3 --version 2>&1 || pip --version 2>&1', { encoding: 'utf-8' });
        return true;
    } catch {
        console.error('❌ pip not found. Please install pip');
        return false;
    }
}

// Setup Shap-E
async function setupShapE() {
    console.log('');
    console.log('🔧 Setting up Shap-E (OpenAI Free 3D Generator)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (!checkPython() || !checkPip()) {
        process.exit(1);
    }

    // Create Shap-E directory
    if (!fs.existsSync(SHAP_E_DIR)) {
        fs.mkdirSync(SHAP_E_DIR, { recursive: true });
    }

    console.log('📦 Installing Shap-E and dependencies...');
    console.log('   (This may take a few minutes)');
    console.log('');

    try {
        // Install shap-e from GitHub (pinned to specific commit for security)
        // Using commit from main branch for stability
        const SHAP_E_COMMIT = 'c6a59f0a3ce298d4e83ab55ebe7ff30461f83eb1'; // Latest stable
        execSync(`pip3 install git+https://github.com/openai/shap-e.git@${SHAP_E_COMMIT} || pip install git+https://github.com/openai/shap-e.git@${SHAP_E_COMMIT}`, {
            stdio: 'inherit',
            cwd: SHAP_E_DIR
        });

        // Install additional dependencies with version pinning
        execSync('pip3 install trimesh>=3.21.0 || pip install trimesh>=3.21.0', { stdio: 'inherit' });

        // Create the Python generation script
        const pythonScript = `#!/usr/bin/env python3
"""
Shap-E GLB Generator for SAVE ISMAEL
Generates 3D GLB models from text prompts using OpenAI's Shap-E
"""

import sys
import os
import torch
import trimesh

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_glb.py <prompt> <output_path> [guidance_scale] [steps]")
        sys.exit(1)

    prompt = sys.argv[1]
    output_path = sys.argv[2]
    guidance_scale = float(sys.argv[3]) if len(sys.argv) > 3 else 15.0
    steps = int(sys.argv[4]) if len(sys.argv) > 4 else 64

    print(f"📝 Prompt: {prompt}")
    print(f"🎨 Guidance: {guidance_scale}")
    print(f"🔢 Steps: {steps}")
    print("")

    # Import shap_e modules
    from shap_e.diffusion.sample import sample_latents
    from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
    from shap_e.models.download import load_model, load_config
    from shap_e.util.notebooks import decode_latent_mesh

    # Determine device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"🖥️  Using device: {device}")
    if device.type == 'cpu':
        print("   ⚠️  GPU not detected - generation will be slower")
    print("")

    print("⏳ Loading models (first run downloads ~2GB)...")
    xm = load_model('transmitter', device=device)
    model = load_model('text300M', device=device)
    diffusion = diffusion_from_config(load_config('diffusion'))

    print("🎨 Generating 3D model...")
    batch_size = 1
    
    latents = sample_latents(
        batch_size=batch_size,
        model=model,
        diffusion=diffusion,
        guidance_scale=guidance_scale,
        model_kwargs=dict(texts=[prompt] * batch_size),
        progress=True,
        clip_denoised=True,
        use_fp16=True,
        use_karras=True,
        karras_steps=steps,
        sigma_min=1e-3,
        sigma_max=160,
        s_churn=0,
    )

    print("💾 Converting to mesh...")
    for i, latent in enumerate(latents):
        t = decode_latent_mesh(xm, latent).tri_mesh()
        
        # Convert to trimesh for GLB export
        vertices = t.verts.cpu().numpy()
        faces = t.faces.cpu().numpy()
        
        # Create colors from vertex colors if available
        if hasattr(t, 'vertex_colors') and t.vertex_colors is not None:
            vertex_colors = t.vertex_colors.cpu().numpy()
        else:
            vertex_colors = None
        
        mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_colors=vertex_colors)
        
        # Export as GLB
        mesh.export(output_path, file_type='glb')
        print(f"✅ Saved: {output_path}")

    print("")
    print("🎉 Generation complete!")

if __name__ == '__main__':
    main()
`;

        fs.writeFileSync(PYTHON_SCRIPT, pythonScript);
        console.log('');
        console.log('✅ Shap-E setup complete!');
        console.log('');
        console.log('You can now generate free 3D assets:');
        console.log('  node scripts/generate-3d-shap-e.js "scary monster"');
        console.log('');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('Try manual installation:');
        console.log('  pip install git+https://github.com/openai/shap-e.git trimesh');
        process.exit(1);
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        prompt: '',
        output: null,
        guidance: 15.0,
        steps: 64,
        setup: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--output' && args[i + 1]) {
            options.output = args[++i];
        } else if (arg === '--guidance' && args[i + 1]) {
            options.guidance = parseFloat(args[++i]);
        } else if (arg === '--steps' && args[i + 1]) {
            options.steps = parseInt(args[++i]);
        } else if (arg === '--setup') {
            options.setup = true;
        } else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        } else if (!arg.startsWith('-')) {
            options.prompt = arg;
        }
    }

    return options;
}

// Generate filename from prompt
function generateFilename(prompt, customName) {
    if (customName) {
        return customName.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
    
    const slug = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    
    const timestamp = Date.now().toString(36);
    return `shap-e-${slug}-${timestamp}`;
}

// Run Python generation script
function runPythonScript(prompt, outputPath, guidance, steps) {
    return new Promise((resolve, reject) => {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        
        const child = spawn(pythonCmd, [
            PYTHON_SCRIPT,
            prompt,
            outputPath,
            guidance.toString(),
            steps.toString()
        ], {
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Python script exited with code ${code}`));
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

// Main function
async function main() {
    const options = parseArgs();

    if (options.setup) {
        await setupShapE();
        return;
    }

    if (!options.prompt) {
        console.error('❌ Error: Please provide a prompt for the 3D model.');
        console.log('   Example: node scripts/generate-3d-shap-e.js "a scary monster"');
        console.log('   Use --help for more options.');
        console.log('   Use --setup for first-time installation.');
        process.exit(1);
    }

    // Check if Shap-E is installed
    if (!fs.existsSync(PYTHON_SCRIPT)) {
        console.error('❌ Shap-E not set up. Run first:');
        console.log('   node scripts/generate-3d-shap-e.js --setup');
        process.exit(1);
    }

    console.log('');
    console.log('🎮 SAVE ISMAEL - Free AI 3D Generator (Shap-E)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Prompt: "${options.prompt}"`);
    console.log(`🎨 Guidance: ${options.guidance}`);
    console.log(`🔢 Steps: ${options.steps}`);
    console.log('');

    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    const filename = generateFilename(options.prompt, options.output);
    const outputPath = path.join(ASSETS_DIR, `${filename}.glb`);

    try {
        await runPythonScript(options.prompt, outputPath, options.guidance, options.steps);
        
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS! Free 3D asset generated:');
        console.log(`   📁 File: ${outputPath}`);
        console.log(`   🆔 Asset ID: ${filename}`);
        console.log('');
        console.log('To use in the game, add to assetConfig.ts:');
        console.log(`   ${filename.replace(/-/g, '_').toUpperCase()}: '${filename}'`);
        console.log('');

    } catch (error) {
        console.error('');
        console.error(`❌ Error: ${error.message}`);
        console.log('');
        console.log('Troubleshooting:');
        console.log('  1. Run --setup if not already done');
        console.log('  2. Ensure Python 3.8+ is installed');
        console.log('  3. For GPU: install CUDA and PyTorch with CUDA support');
        process.exit(1);
    }
}

main();
