# Save Ismael — Upgrade & Deployment Proposal

This document reviews the shipped "Save Ismael" build and outlines prioritized upgrades focused on graphics, user experience, and hosting.

## Snapshot of the Current Experience
- Babylon.js-based 3D FPS with mobile-aware performance toggles and two audience modes (Family/Public).
- GUI overlays drive menus, prologue/level intros, and settings (including the family-mode toggle and rescue target selector).
- Meshy.ai hooks are already present for swapping placeholder meshes with generated GLB assets.

## Visual Upgrade Roadmap
1. **Replace placeholder meshes with stylized Meshy assets**
   - Generate/upload creature, hive, anchor, and collectible GLBs, then wire the IDs into `assetConfig` so the game loads the new geometry.
   - Add simple PBR material setup (albedo, normal, emission) when loading these GLBs to push the crimson/void aesthetic.
2. **Lighting and post-processing pass**
   - Introduce soft shadows and a light rig per level (key + rim + low red fill) while keeping `performanceConfig.shadowsEnabled` aware of mobile limits.
   - Layer lightweight post-processes (bloom for portals, chromatic aberration on interference events, subtle vignette) with quality toggles tied to render scale.
3. **Atmospherics and particles**
   - Add fog gradients per level and particle systems for spores/embers near hives, respecting `particleLimit` so mobile stays performant.
   - Use instanced decals for ground cracks and corruption to avoid heavy meshes while enriching surfaces.
4. **Environmental storytelling props**
   - Scatter modular Dubai cues (pillar fragments, metro signage, tower silhouettes) using instancing; cluster vine/spore meshes from `assetConfig` to frame objectives.
5. **UI visual identity**
   - Update overlay styles with a consistent font pair, animated button hover states, and diegetic frames (glitch edges, scanlines) to match the Upside-Down tone.
   - Add a brief camera dolly or parallax background on the main menu to set mood before gameplay starts.

## User-Experience Enhancements
1. **Menu & onboarding polish**
   - Convert console-based rescue-target input into an inline text field with validation and presets ("Ismael", "Friend") so players never need the console.
   - Add a short "How to Play" panel (movement, shooting, sprint, fragment collection) before Level 1 loads.
2. **HUD clarity & feedback**
   - Introduce hit markers and weak flash when hitting enemies; add a subtle radial damage indicator pointing to the attacker.
   - Animate the health bar color/width changes and add a low-health heartbeat audio/flash cue to increase urgency without overwhelming the player.
3. **Mobile ergonomics**
   - Offer adjustable joystick size/opacity plus a left-handed layout toggle; surface a low/medium/high quality preset that maps to render scale, shadows, and particle caps.
   - Reduce UI text margins and increase tap targets on overlays to improve readability on small screens.
4. **Progress & retention**
   - Surface collectible progress (e.g., "Fragments 2/3") in the HUD and add a small end-of-level recap card (accuracy, damage taken, fragments found) to encourage replay.

## Deployment Recommendation
- **Primary:** Deploy the Vite client to Vercel (static hosting + edge CDN) for fast mobile loads; use a small Node/Express worker only if Meshy asset generation needs to run server-side.
- **Family sharing:** Keep a Replit deployment for frictionless access and quick edits with secrets for Meshy keys; disable analytics and keep Family mode default there.
- **Production hardening:** Add `npm run build` to CI, run a preview deploy per branch, and set up a password-gated preview URL for the Private family build while leaving a public-friendly theme available.

## Next Steps
- Prioritize Meshy asset swaps and lighting pass for the largest visual lift with minimal gameplay risk.
- Ship the menu UX improvements (text input + how-to panel) alongside a Vercel deployment to deliver a clearly polished experience to players.
