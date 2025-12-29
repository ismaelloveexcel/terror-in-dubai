# 🧪 TESTING GUIDE

## Quick Test Checklist

Before giving to Aidan, verify these work:

### ✅ Basic Functionality

**Desktop:**
```bash
npm run dev
# Open http://localhost:5173
```

- [ ] Menu appears
- [ ] "Save Ismael" title shows (Family Mode)
- [ ] Settings menu opens
- [ ] Prologue text displays
- [ ] Level 1 intro shows
- [ ] Player can move with WASD
- [ ] Mouse look works (click to lock pointer)
- [ ] Left click fires weapon
- [ ] Crosshair visible
- [ ] Health bar shows 100/100

**Mobile Test (Use phone or browser dev tools):**
- [ ] Landscape warning appears in portrait
- [ ] Virtual joystick appears (left side)
- [ ] Fire button appears (right side)
- [ ] Joystick controls movement
- [ ] Fire button shoots

### ✅ Level 1: The Beginning

- [ ] 5 hives spawn
- [ ] Enemies spawn from hives
- [ ] Shooting enemies damages them
- [ ] Enemy health decreases
- [ ] Enemies die with animation
- [ ] Shooting hives damages them
- [ ] Elite enemy spawns after 2 hives destroyed
- [ ] Level completes when all hives destroyed
- [ ] "Level Cleared" overlay appears

### ✅ Level 2: Illusion

- [ ] 3 anchors spawn
- [ ] Interference pulse occurs
- [ ] "SAVE ME" lights wall message appears
- [ ] Shadow enemies spawn (dissolve in 1 hit)
- [ ] Movement drag effect applies periodically
- [ ] Anchors can be destroyed
- [ ] Level completes when all anchors destroyed

### ✅ Level 3: The Climax

- [ ] Boss spawns
- [ ] Boss has visible health
- [ ] Boss attacks player
- [ ] Boss takes damage from shots
- [ ] Phase 1: Rune pillars glow during stun
- [ ] Phase 2: Boss teleports at 70% HP
- [ ] Phase 3: Hazard zones appear at 35% HP
- [ ] Boss dies at 0% HP
- [ ] Finale sequence plays
- [ ] Credits show

### ✅ Story & UI

- [ ] Prologue mentions Dubai + rift
- [ ] Each level intro has unique text
- [ ] Ismael's messages appear between actions
- [ ] Memory fragments glow and float
- [ ] Collecting memory logs message
- [ ] Health bar updates when taking damage
- [ ] Damage flash (red screen) on hit
- [ ] Game over screen on death
- [ ] Restart works after death

### ✅ Settings & Modes

**Family Mode (default):**
- [ ] Title: "SAVE ISMAEL"
- [ ] Subtitle: "Private family build"
- [ ] Enemy name: "Demodog" (in console/debug)
- [ ] Rescue target: "Ismael"

**Public Mode:**
- [ ] Toggle to Public in Settings
- [ ] Title: "SAVE [THEM]"
- [ ] No subtitle
- [ ] Can set custom rescue name via console

### ✅ Performance

**Desktop:**
- [ ] 60 FPS on modern PC
- [ ] No stuttering during combat
- [ ] Scene loads quickly

**Mobile (if testing on phone):**
- [ ] 30+ FPS on mid-range phone
- [ ] Controls responsive
- [ ] No crashes during gameplay

---

## 🐛 Known Limitations (Expected)

These are **normal** and not bugs:

✅ **Placeholder models show** - Normal until Meshy assets generated
✅ **No sounds** - Audio files not included (placeholders only)
✅ **Simple graphics** - Optimized for mobile performance
✅ **Enemies can stack** - Basic separation only
✅ **No jump** - Intentional (FPS shooter focus)

---

## 🔧 Debug Tools

### Browser Console

Open console (F12) to see:
- Enemy spawn logs
- Level state changes
- Damage events
- Memory collection

### Test Commands

In browser console:

```javascript
// Change rescue target (Public Mode only)
setTarget("TestName")

// Check current game config
console.log(gameConfig)

// Force toggle family mode
toggleFamilyMode()
```

---

## 📱 Mobile Testing (Chrome DevTools)

1. Open game in Chrome
2. Press F12 → Toggle Device Toolbar
3. Select device (iPhone 12, Samsung Galaxy, etc.)
4. Rotate to landscape
5. Test touch controls

---

## 🎮 Gameplay Test Script

### Level 1 Test (5 min)
1. Start game
2. Skip prologue → Level 1
3. Shoot 1 hive until destroyed (20-30 shots)
4. Kill 2-3 enemies
5. Destroy 2nd hive → Elite spawns
6. Destroy all 5 hives
7. Verify "Level Cleared" appears

### Level 2 Test (3 min)
1. Continue from Level 1
2. Destroy 1 anchor
3. Wait for interference pulse
4. Verify "SAVE ME" lights wall appears
5. Kill 1 shadow enemy (1 hit)
6. Destroy all 3 anchors
7. Verify level complete

### Level 3 Test (5 min)
1. Continue from Level 2
2. Shoot boss until 70% HP (Phase 2)
3. Shoot boss until 35% HP (Phase 3)
4. Avoid red hazard zones
5. Shoot boss until 0% HP
6. Watch finale sequence
7. Verify credits show "For Aidan" + "Uncle Ismael"

**Total test time:** ~15 minutes for full playthrough

---

## ✅ Pre-Deployment Checklist

Before giving to Aidan:

**Code:**
- [ ] No console errors on game load
- [ ] All 3 levels load without crash
- [ ] No TypeScript errors (`npm run build` succeeds)

**Content:**
- [ ] Nephew name is "Aidan" (check `.env`)
- [ ] Rescue target is "Ismael" (check `.env`)
- [ ] Family Mode enabled by default
- [ ] Personal messages show in finale

**Performance:**
- [ ] Game runs on mobile device
- [ ] Virtual controls work
- [ ] No major lag

**Optional (if generating Meshy assets):**
- [ ] All 6 assets downloaded to `server/assets/`
- [ ] Asset IDs updated in `assetConfig.ts`
- [ ] Models load in game (not primitives)

---

## 🚨 Troubleshooting Tests

### Test 1: Canvas Not Found
```bash
# In browser console, should see:
"🎮 Save Ismael - Game Loaded"
# If not, check index.html loads correctly
```

### Test 2: Pointer Lock
```bash
# Click canvas
# Should see: cursor disappears, can look with mouse
# Mobile: should auto-skip (uses touch)
```

### Test 3: Enemy Spawning
```bash
# Wait 5-10 seconds near hive
# Should see: enemies spawn from hive
# Console: "Enemy spawned" (if logging enabled)
```

### Test 4: Asset Loading
```bash
# If Meshy assets configured:
# Should see: custom models (not boxes)
# If empty assetConfig: primitives show (correct!)
```

---

## ✅ All Tests Pass?

**You're ready to deploy!** 🚀

Give the game to Aidan and watch him save you!

---

## 📞 Debug Info to Collect (If Issues)

If something doesn't work:
1. Browser + version
2. Device (desktop/mobile, OS)
3. Console errors (F12 → Console tab)
4. Which level/action failed
5. Screenshot if visual issue
