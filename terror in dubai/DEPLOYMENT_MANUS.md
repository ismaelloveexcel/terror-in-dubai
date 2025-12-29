# Deploying Save Ismael to Manus

These steps package the mobile-first build for Manus (Node-friendly hosting). Manus can serve the static Vite build directly or run the lightweight Node server included in this repo.

## Prerequisites
- Node.js 18+
- npm 9+
- Manus project with a build step and start command

## Build steps
1. **Install all dependencies**
   ```bash
   npm run install:all
   ```
2. **Create a production build (mobile-first UI)**
   ```bash
   npm run build
   ```
   This outputs the optimized client bundle to `client/dist/`.
3. **(Optional) Run a sanity check locally**
   ```bash
   npm start
   ```
   The server serves the built client and API helpers on port `3000` by default.

## Environment variables
Manus should expose these as project secrets:
- `PORT` – default `3000`
- `VITE_FAMILY_MODE` – `true`/`false` (toggles family-friendly text)
- `VITE_NEPHEW_NAME` – defaults to `Aidan`
- `VITE_RESCUE_TARGET` – defaults to `Ismael`

## Manus configuration
- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Publish directory (static mode):** `client/dist`
- **Node runtime:** 18 or later

If Manus is configured for static hosting, point it at `client/dist`. If it expects a Node process, keep the start command above so the server proxies the built client.

## Mobile-first checklist for Manus
- The app ships responsive HUD and touch controls that scale based on device width.
- Orientation warning is non-blocking; portrait still renders with touch controls.
- Canvas uses `100dvh` height to avoid browser chrome jumps on iOS/Android.

After deployment, open the Manus preview URL on a phone to verify the joystick and fire button scale comfortably and the overlays fit within the viewport.
