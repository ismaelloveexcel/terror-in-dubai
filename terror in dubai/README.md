# SAVE ISMAEL

A Stranger Things-inspired 3D first-person shooter game set in Dubai, created as a gift for Aidan.

## 🎮 Game Overview

**Premise:** Dubai has been twisted by a rift into the Upside-Down. Aidan must fight through 3 corrupted levels to save his Uncle Ismael.

### Levels
1. **The Beginning** - Dubai Metro station overtaken by hives
2. **Illusion** - Downtown Dubai with mind-bending interference
3. **The Climax** - Desert-edge arena boss fight

### Features
- ✅ Full 3D FPS gameplay with Babylon.js
- ✅ Mobile-optimized (virtual joystick + fire button)
- ✅ Desktop controls (WASD + mouse)
- ✅ Two modes: **Family Mode** (private) and **Public Mode** (customizable)
- ✅ Story-driven levels with collectible memory fragments
- ✅ Meshy.ai integration for custom 3D models
- ✅ Fully playable with placeholder primitives (no API key required)

## 🧭 Upgrade Proposal

Looking for a higher-fidelity build? See **[UPGRADE_PROPOSAL.md](UPGRADE_PROPOSAL.md)** for a prioritized plan covering visual polish, UX improvements, and deployment recommendations.

---

## 📦 Installation

### Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Meshy API key (optional)

# 3. Run development servers (client + server concurrently)
npm run dev
```

Open http://localhost:5173 in your browser.

### Replit Deployment

1. **Import to Replit:**
   - Upload the entire project folder
   - Or connect via GitHub repository

2. **Set Secrets (Environment Variables):**
   - Go to Replit Secrets (lock icon in sidebar)
   - Add:
     - `PORT` = `3000` (Replit will auto-detect)
     - `MESHY_API_KEY` = `your_meshy_api_key_here` (optional)
     - `VITE_FAMILY_MODE` = `true` or `false`
     - `VITE_NEPHEW_NAME` = `Aidan`
     - `VITE_RESCUE_TARGET` = `Ismael`

3. **Run:**
   ```bash
   npm run install:all
   npm run dev
   ```

4. **For Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Meshy.ai Setup (Optional)

The game works perfectly with placeholder primitive models (boxes, spheres, capsules). However, you can generate custom 3D models using Meshy.ai.

### Getting Your API Key

1. Sign up at https://www.meshy.ai
2. Go to API settings
3. Copy your API key

### Generating All 6 Assets Automatically

```bash
# 1. Add your API key to .env
echo "MESHY_API_KEY=your_key_here" >> .env

# 2. Run the asset generator script
cd server
npm run generate-assets
```

This will:
- Generate 6 models (hive, anchor, swarm enemy, flying enemy, elite enemy, boss)
- Download them to `server/assets/`
- Automatically update `client/src/config/assetConfig.ts` with task IDs
- Take 15-30 minutes total (Meshy processing time)

### Manual Asset Generation (Advanced)

If you want to generate models one by one:

```bash
# 1. Create preview task
curl -X POST https://api.meshy.ai/v2/text-to-3d \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "preview",
    "prompt": "organic alien hive, dark red, low poly",
    "art_style": "low-poly",
    "ai_model": "meshy-4"
  }'

# Response: { "result": "preview_task_id_here" }

# 2. Wait for preview (5-10 min), then create refine task
curl -X POST https://api.meshy.ai/v2/text-to-3d \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "refine",
    "preview_task_id": "preview_task_id_here",
    "texture_richness": "low",
    "enable_pbr": false
  }'

# Response: { "result": "refine_task_id_here" }

# 3. Check status
curl https://api.meshy.ai/v2/text-to-3d/refine_task_id_here \
  -H "Authorization: Bearer YOUR_API_KEY"

# When status is SUCCEEDED, download the GLB and place in server/assets/

# 4. Update client/src/config/assetConfig.ts
# Set the appropriate asset ID:
# hiveModelAssetId: 'refine_task_id_here'
```

---

## ⚙️ Configuration

### Game Modes

**Family Mode (Private):**
- Shows "Save Ismael" title
- Uses recognizable enemy names (Demodog, Demobat, Demogorgon, Vecna)
- Personal story messages
- Enable by setting `VITE_FAMILY_MODE=true` or toggle in-game settings

**Public Mode (Default):**
- Shows "Save [Them]" title
- Uses safe enemy names (D-Dog, Rift Bat, The Gorgon, The One)
- Player can choose who to save (customizable name)

### Customization

Edit these environment variables:

```bash
# Client (build-time)
VITE_FAMILY_MODE=false          # true for family mode
VITE_NEPHEW_NAME=Aidan          # Player's name
VITE_RESCUE_TARGET=Ismael       # Who to rescue (family mode default)

# Server
PORT=3000                        # Server port
MESHY_API_KEY=your_key_here     # Optional
```

### In-Game Settings

You can also toggle **Family Mode** in-game:
1. Click **SETTINGS** on main menu
2. Click the **Mode** button to toggle
3. In Public Mode, set rescue target by opening browser console and typing:
   ```javascript
   setTarget("YourNameHere")
   ```

---

## 🎯 Controls

### Mobile (Auto-detected)
- **Left side:** Virtual joystick for movement
- **Right side:** Fire button
- **Landscape orientation required**

### Desktop
- **WASD:** Move
- **Mouse:** Look around
- **Left Click:** Shoot
- **Shift:** Sprint
- **Click canvas** to lock pointer

---

## 🎨 Asset Mapping

Models are loaded from `server/assets/<task_id>.glb`. The mapping is in `client/src/config/assetConfig.ts`:

```typescript
export const assetConfig = {
  hiveModelAssetId: '',       // Level 1 spawner
  anchorAssetId: '',          // Level 2 signal anchor
  swarmEnemyAssetId: '',      // Demodog/D-Dog
  flyingEnemyAssetId: '',     // Demobat/Rift Bat
  eliteEnemyAssetId: '',      // Demogorgon/Gorgon
  bossAssetId: '',            // Vecna/The One
};
```

If empty, fallback primitives are used automatically.

---

## 🏗️ Project Structure

```
/
├── client/                  # Vite + TypeScript + Babylon.js
│   ├── src/
│   │   ├── config/         # Game config, story, assets
│   │   ├── core/           # Game loop, scene manager, input
│   │   ├── player/         # Player controller, weapon, health
│   │   ├── enemies/        # Enemy AI classes
│   │   ├── spawners/       # Hive, Anchor, Boss spawners
│   │   ├── levels/         # Level 1, 2, 3 implementations
│   │   ├── ui/             # HUD, overlays, mobile controls
│   │   ├── utils/          # Asset loader, Meshy client
│   │   └── main.ts         # Entry point
│   └── index.html
├── server/                  # Express API
│   ├── src/
│   │   ├── routes/         # Meshy proxy endpoints
│   │   └── utils/          # Meshy API wrapper
│   ├── assets/             # Downloaded GLB models
│   └── scripts/
│       └── generateAssets.ts  # Auto asset generator
├── scripts/
│   └── dev.js              # Concurrent dev script
├── package.json            # Root workspace
└── README.md
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build client
npm run build

# Start production server (serves built client + API)
npm start
```

### Replit Auto-Deploy

Replit will auto-deploy when you click "Run". The server will:
1. Serve the API on port 3000 (or Replit's assigned port)
2. Serve static client files from `client/dist`
3. Serve assets from `server/assets`

### Environment Variables for Replit

Set these in Replit Secrets:
- `PORT` - Auto-set by Replit
- `MESHY_API_KEY` - Your Meshy.ai key (optional)
- `NODE_ENV` - Set to `production` for production build

---

## 🎮 Gameplay Tips

### Level 1: The Beginning
- Destroy all 5 hives by shooting them
- Elite enemy spawns after 2 hives destroyed
- Collect 3 memory fragments (glowing orbs)

### Level 2: Illusion
- Destroy 3 Signal Anchors
- Watch for interference effects:
  - Shadow enemies (fake, dissolve in 1 hit)
  - HUD flicker (visual only)
  - Movement drag (temporary slowdown)
  - "SAVE ME, ISMAEL" lights wall messages

### Level 3: The Climax
- Boss has 3 phases (100→70%, 70→35%, 35→0%)
- **Phase 1:** Shoot glowing rune pillars during psychic stun to avoid being frozen
- **Phase 2:** Boss teleports, spawns minions
- **Phase 3:** Avoid red hazard zones on ground
- Final victory saves Ismael!

---

## 🐛 Troubleshooting

### Audio not playing on mobile
- Tap anywhere on screen first (required by browsers to unlock audio)

### Pointer lock not working
- Click the canvas area
- Desktop browsers only (mobile uses touch controls)

### Assets not loading
- Check `server/assets/` folder has `.glb` files
- Check task IDs in `assetConfig.ts` match downloaded file names
- Fallback primitives will show if assets are missing (this is normal!)

### Meshy generation fails
- Check API key is correct
- Check you have remaining credits on Meshy.ai
- Generation takes 5-15 minutes per asset
- Max file size is 10MB (script will reject larger models)

---

## 📝 Credits

**Created with love for Aidan by Uncle Ismael**

- **Engine:** Babylon.js 6.38
- **3D Models:** Meshy.ai (optional) + fallback primitives
- **Inspiration:** Stranger Things (Duffer Brothers / Netflix)
- **Setting:** Dubai, UAE

---

## 📄 License

MIT License - Personal gift project

---

## 🎁 For Aidan

You just unlocked a game made just for you. In this story, you saved me. But in real life, you inspire me every day.

Never stop being brave.

- Uncle Ismael, 2025
