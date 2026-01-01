# 🚀 QUICKSTART GUIDE

## Immediate Next Steps

You now have a **complete, working game**! Here's how to get it running:

---

## Option 1: Run Locally (Fastest)

```bash
# 1. Install dependencies
npm run install:all

# 2. Start dev servers (client + server)
npm run dev
```

Open **http://localhost:5173** in your browser.

**That's it!** The game runs with placeholder models (boxes/spheres) and is fully playable.

---

## Option 2: Generate Meshy Assets (Optional)

Your API key is already configured in `.env`. To generate all 6 custom 3D models:

```bash
cd server
npm run generate-assets
```

This will:
- Generate 6 models (15-30 min total)
- Download them to `server/assets/`
- Auto-update the config
- **Cost:** ~6 Meshy credits (check your balance first)

Then refresh the game and the models will load automatically!

---

## Option 3: Deploy to Replit

1. **Create new Repl:**
   - Go to https://replit.com
   - Click "Create Repl"
   - Import from folder or drag entire project

2. **Set Secrets:**
   - Click lock icon (Secrets)
   - Add:
     - `MESHY_API_KEY` = `msy_Czt0XMd4PGeZ066Cn6xnNXs4rH4lK5pV3oQP`
     - `VITE_FAMILY_MODE` = `true`
     - `VITE_NEPHEW_NAME` = `Aidan`

3. **Run:**
   ```bash
   npm run install:all
   npm run dev
   ```

4. **Share:**
   - Click "Share" button
   - Send link to Aidan (works on his phone!)

---

## 📱 Mobile Testing

1. Run the game locally or on Replit
2. Open URL on phone browser
3. Rotate to **landscape mode**
4. Tap screen to unlock audio
5. Use virtual joystick (left) + fire button (right)

---

## 🎮 Controls Reference

**Mobile:**
- Virtual joystick (left side) - Move
- Fire button (right side) - Shoot

**Desktop:**
- WASD - Move
- Mouse - Look
- Left Click - Shoot
- Shift - Sprint

---

## ⚙️ Customization

### Change Rescue Target Name (Public Mode)

1. Set `VITE_FAMILY_MODE=false` in `.env`
2. Rebuild client: `cd client && npm run build`
3. In game, open browser console and type:
   ```javascript
   setTarget("SomeoneElse")
   ```

### Adjust Difficulty

Edit `client/src/config/gameConfig.ts`:
- `playerConfig.maxHealth` - Player HP (default 100)
- `enemyConfigs` - Enemy HP/damage
- `weaponConfig.damage` - Weapon power (default 25)

---

## 🐛 Common Issues

**"Canvas not found" error:**
- Make sure you're running from project root
- Check `index.html` exists in `client/`

**Models not loading:**
- Normal! Placeholder primitives will show
- Generate Meshy assets to replace them

**Audio not playing:**
- Tap screen once (browser requirement)

**Pointer lock not working:**
- Desktop only
- Click canvas area
- Mobile uses touch controls automatically

---

## 📞 Support

If you need help:
1. Check `README.md` for full documentation
2. Check browser console (F12) for errors
3. Verify all dependencies installed: `npm run install:all`

---

## 🎁 Ready to Play!

The game is **complete and playable right now**. You can:
- ✅ Play with placeholder models
- ✅ Generate Meshy assets later
- ✅ Deploy to Replit for mobile
- ✅ Customize names/difficulty

**Give it to Aidan and watch him save you!** 🦸‍♂️

---

**Next:** Run `npm run dev` and open http://localhost:5173
