# Deployment Guide - SAVE ISMAEL

This guide outlines the best deployment options for the SAVE ISMAEL game, a React/Babylon.js frontend with an Express.js backend.

## Quick Recommendation

| Use Case | Recommended Platform | Why |
|----------|---------------------|-----|
| **Best Overall** | **Railway** | Easiest full-stack deployment with free tier, handles both frontend and backend |
| **Free Hosting** | **Render** | Generous free tier for both static sites and web services |
| **Quick Prototyping** | **Replit** | Browser-based IDE + hosting, great for sharing and collaboration |
| **Maximum Performance** | **Vercel + Railway** | Vercel's Edge Network for frontend + Railway for backend |
| **Enterprise/Scale** | **AWS/Google Cloud** | Full control, auto-scaling, but more complex setup |

---

## Deployment Options

### 1. Railway (Recommended) ⭐

**Best for:** Full-stack deployment with minimal configuration

Railway provides an excellent platform for deploying both the frontend and backend together. It supports Node.js applications out of the box and automatically detects your build configuration.

**Pros:**
- Simple deployment from GitHub
- Automatic HTTPS
- Free tier available ($5/month free credits)
- Environment variables management
- Auto-deploys on push
- Built-in monitoring

**Deployment Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy the Application**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli
   railway login
   
   # Or deploy directly from GitHub
   # 1. Create new project in Railway dashboard
   # 2. Select "Deploy from GitHub repo"
   # 3. Choose the terror-in-dubai repository
   ```

3. **Configure Environment Variables**
   - In Railway dashboard, add:
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-app.railway.app
   ```

4. **Configure Build Commands**
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `npm start`

**Railway Configuration File (optional):**
Create `railway.toml` in root:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

---

### 2. Render

**Best for:** Free hosting with good performance

Render offers a generous free tier and straightforward deployment for Node.js applications.

**Pros:**
- Free tier for static sites and web services
- Automatic HTTPS
- Easy GitHub integration
- Good documentation

**Cons:**
- Free tier services spin down after inactivity (cold starts)

**Deployment Steps:**

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect your GitHub account

2. **Create a Web Service**
   - New > Web Service
   - Connect your repository
   - Configure:
     - **Name:** save-ismael
     - **Environment:** Node
     - **Build Command:** `npm run install:all && npm run build`
     - **Start Command:** `npm start`

3. **Add Environment Variables**
   - `NODE_ENV=production`
   - `PORT=10000`
   - `CORS_ORIGIN=https://save-ismael.onrender.com`

4. **Configure render.yaml (optional):**
```yaml
services:
  - type: web
    name: save-ismael
    env: node
    buildCommand: npm run install:all && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
```

---

### 3. Replit

**Best for:** Quick prototyping, sharing, and browser-based development

Replit is an excellent choice for quickly deploying and sharing your game. It provides a browser-based IDE with built-in hosting, making it easy to develop, deploy, and share in one place.

**Pros:**
- Browser-based IDE - no local setup required
- Free tier with always-on Repls (with Replit Core)
- Easy sharing via URL
- Built-in secrets management
- Great for collaboration
- Automatic HTTPS

**Cons:**
- Free tier has limited resources
- May have cold starts on free tier

**Deployment Steps:**

1. **Create Replit Account**
   - Go to [replit.com](https://replit.com)
   - Sign up (can use GitHub)

2. **Import from GitHub**
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste the repository URL: `https://github.com/ismaelloveexcel/terror-in-dubai`
   - Replit will auto-detect Node.js

3. **Configure .replit File**
   Create or update `.replit` in root:
   ```toml
   run = "npm run install:all && npm run build && npm start"
   
   [nix]
   channel = "stable-24_05"
   
   [env]
   NODE_ENV = "production"
   
   [[ports]]
   localPort = 3001
   externalPort = 80
   ```

4. **Configure replit.nix (optional):**
   ```nix
   { pkgs }: {
     deps = [
       pkgs.nodejs_20
     ];
   }
   ```

5. **Set Secrets (Environment Variables)**
   - Go to "Secrets" tab in Replit
   - Add: `CORS_ORIGIN` = your Replit URL (e.g., `https://save-ismael.username.repl.co`)

6. **Deploy**
   - Click the "Run" button
   - Your app will be live at `https://your-repl-name.username.repl.co`

**Tips for Replit:**
- Use "Always On" (Replit Core) to prevent cold starts
- The `.replit` file controls how your app runs
- Replit automatically provisions HTTPS
- Great for sharing with friends - just send the URL!

---

### 4. Vercel + Railway (Best Performance)

**Best for:** Maximum performance with separate frontend/backend

Split deployment gives you the best of both worlds: Vercel's Edge Network for static files and Railway for the API server.

**Frontend on Vercel:**

1. **Deploy Client to Vercel**
   ```bash
   cd client
   npx vercel
   ```

2. **Configure vercel.json:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Configure Environment Variables in Vercel:**
   - `VITE_API_URL=https://your-railway-backend.railway.app`

**Backend on Railway:**
- Follow Railway steps above for the `server` directory only

**Client Updates Required:**
Update API calls to use environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || '';
fetch(`${API_URL}/api/health`);
```

---

### 5. Heroku

**Best for:** Teams familiar with Heroku

**Deployment Steps:**

1. **Create Procfile:**
   ```
   web: npm start
   ```

2. **Deploy:**
   ```bash
   heroku create save-ismael
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

**Note:** Heroku no longer offers a free tier. Plans start at $7/month.

---

### 6. DigitalOcean App Platform

**Best for:** Simple cloud deployment with predictable pricing

**Pros:**
- $5/month starter tier
- Auto-scaling available
- Managed database options
- Good for production workloads

**Deployment Steps:**

1. Create App in DigitalOcean dashboard
2. Connect GitHub repository
3. Configure build and run commands
4. Set environment variables

---

### 7. AWS (Elastic Beanstalk or ECS)

**Best for:** Enterprise deployments requiring full control

**AWS Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init save-ismael --platform node.js

# Create environment
eb create production

# Deploy
eb deploy
```

**AWS with Docker (ECS/Fargate):**

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source
COPY . .

# Build client
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
```

---

### 8. Google Cloud Run

**Best for:** Serverless container deployment with auto-scaling

```bash
# Build and push container
gcloud builds submit --tag gcr.io/PROJECT_ID/save-ismael

# Deploy
gcloud run deploy save-ismael \
  --image gcr.io/PROJECT_ID/save-ismael \
  --platform managed \
  --allow-unauthenticated
```

---

## Asset Considerations

### GLB 3D Models
The game uses GLB (3D model) files that can be large. Consider:

1. **CDN for Assets:** Use Cloudflare, CloudFront, or similar for caching
2. **Compression:** GLB files are already compressed, but enable gzip/brotli on server
3. **Cache Headers:** Already configured in Express server (1 day cache)

### Recommended CDN Setup (Optional):
```javascript
// In Express server, for CDN origin
app.use('/assets', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  next();
});
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (default: 3001) | No |
| `CORS_ORIGIN` | Allowed CORS origins | Yes (production) |
| `MESHY_API_KEY` | Meshy.ai API key (for asset generation) | No |

---

## Post-Deployment Checklist

- [ ] Verify `/api/health` endpoint returns 200
- [ ] Test game loads and renders correctly
- [ ] Verify GLB assets load (check Network tab)
- [ ] Test on mobile devices
- [ ] Verify HTTPS is working
- [ ] Test PWA installation on mobile
- [ ] Check Console for errors
- [ ] Monitor performance with platform tools

---

## Troubleshooting

### Common Issues

**1. Assets Not Loading (CORS errors)**
- Ensure `CORS_ORIGIN` is set correctly
- Check that asset paths are correct

**2. Build Fails**
- Ensure Node.js version is 18+
- Run `npm run install:all` before building

**3. Application Crashes on Start**
- Check logs for specific error
- Ensure all environment variables are set
- Verify `PORT` matches platform expectations

**4. Slow Loading**
- Enable CDN for static assets
- Check if Babylon.js chunks are cached
- Consider lazy loading levels

---

## Cost Comparison

| Platform | Free Tier | Paid Starting |
|----------|-----------|---------------|
| Railway | $5/month credits | $5/month |
| Render | Yes (with limitations) | $7/month |
| Replit | Yes (with limitations) | $25/month (Core) |
| Vercel | Yes (frontend only) | $20/month |
| Heroku | No | $7/month |
| DigitalOcean | No | $5/month |
| AWS | 12-month free tier | Variable |
| Google Cloud Run | 2 million requests free | Variable |

---

## Summary

For **SAVE ISMAEL**, we recommend:

1. **For Getting Started:** Use **Railway** - it's the simplest option that handles both frontend and backend with minimal configuration.

2. **For Production:** Consider **Vercel + Railway** split deployment for optimal performance, with the static frontend on Vercel's Edge Network and the API on Railway.

3. **For Enterprise:** Use **AWS** or **Google Cloud** with Docker containers for full control and auto-scaling capabilities.

The application is already production-ready with:
- Security headers (Helmet)
- Rate limiting
- PWA support for mobile
- Optimized Babylon.js bundle splitting
- Asset caching

Happy deploying! 🎮
