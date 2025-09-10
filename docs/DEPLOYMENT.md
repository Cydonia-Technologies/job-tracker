# Production Deployment Guide - Week 1

## 🚀 Backend Deployment (Heroku)

### 1. Heroku Setup
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create your-jobtracker-api

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs -a your-jobtracker-api
```

### 2. Prepare for Heroku Deployment
Create/update these files in your backend directory:

**package.json** (ensure these sections exist):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

**Procfile** (create this file in backend root):
```
web: node server.js
```

### 3. Environment Variables in Heroku
```bash
# Set environment variables via CLI or Heroku dashboard
heroku config:set NODE_ENV=production -a your-jobtracker-api

# Supabase
heroku config:set SUPABASE_URL=https://your-project.supabase.co -a your-jobtracker-api
heroku config:set SUPABASE_ANON_KEY=your-anon-key -a your-jobtracker-api
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key -a your-jobtracker-api

# AI
heroku config:set GEMINI_API_KEY=your-gemini-api-key -a your-jobtracker-api

# CORS
heroku config:set FRONTEND_URL=https://your-app.vercel.app -a your-jobtracker-api
heroku config:set EXTENSION_ID=your-chrome-extension-id -a your-jobtracker-api

# Security
heroku config:set JWT_SECRET=your-production-jwt-secret -a your-jobtracker-api
heroku config:set BCRYPT_ROUNDS=12 -a your-jobtracker-api

# Rate Limiting
heroku config:set RATE_LIMIT_WINDOW_MS=900000 -a your-jobtracker-api
heroku config:set RATE_LIMIT_MAX_REQUESTS=100 -a your-jobtracker-api

# Verify all config vars
heroku config -a your-jobtracker-api
```

### 4. Deploy Backend
```bash
# From your backend directory
git init
git add .
git commit -m "Initial Heroku deployment"

# Connect to Heroku remote
heroku git:remote -a your-jobtracker-api

# Deploy
git push heroku main

# View logs
heroku logs --tail -a your-jobtracker-api

# Test your deployment
heroku open -a your-jobtracker-api/health
```

## 🌐 Frontend Deployment (Vercel)

### 1. Vercel Account Setup
1. **Create account** at [vercel.com](https://vercel.com)
2. **Connect GitHub** for automatic deployments
3. **Install Vercel CLI** for manual deployments

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

### 2. Project Preparation

#### A. Frontend Build Configuration
Ensure your `package.json` has the correct build script:
```json
{
  "name": "jobtracker-frontend",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### B. Create Vercel Configuration
Create `vercel.json` in your **frontend root directory**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "build/static/**": {
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  }
}
```

### 3. Environment Variables Setup

#### A. Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-jobtracker-api.herokuapp.com` | Production |
| `REACT_APP_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `REACT_APP_SUPABASE_ANON_KEY` | `your-anon-key` | Production |
| `REACT_APP_ENVIRONMENT` | `production` | Production |

#### B. Via Vercel CLI
```bash
# Set environment variables via CLI
vercel env add REACT_APP_API_URL production
# Enter: https://your-jobtracker-api.herokuapp.com

vercel env add REACT_APP_SUPABASE_URL production
# Enter: https://your-project.supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Enter: your-anon-key

# List all environment variables
vercel env ls
```

#### C. Local Environment File (.env.production)
Create `.env.production` in your frontend root:
```env
REACT_APP_API_URL=https://your-jobtracker-api.herokuapp.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENVIRONMENT=production
```

### 4. Deployment Methods

#### Method A: GitHub Integration (Recommended)
1. **Connect GitHub repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select your frontend directory if it's in a monorepo

2. **Configure build settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
   - **Root Directory**: `frontend` (if in monorepo)

3. **Deploy automatically**
   - Every push to `main` branch triggers deployment
   - Pull requests get preview deployments

#### Method B: Manual CLI Deployment
```bash
# Navigate to your frontend directory
cd frontend

# First deployment (creates project)
vercel

# Production deployment
vercel --prod

# Deploy with specific project name
vercel --prod --name jobtracker-frontend
```

### 5. Build Optimization

#### A. React Build Optimization
Update your `package.json` build script for production:
```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx serve -s build"
  }
}
```

#### B. Vercel Build Configuration
Create `vercel.json` with optimized settings:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/js/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/js/$1"
    },
    {
      "src": "/static/css/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/css/$1"
    },
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "headers": {
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "x-xss-protection": "1; mode=block"
      },
      "dest": "/index.html"
    }
  ]
}
```

### 6. Domain Configuration

#### A. Custom Domain Setup
1. **Add domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain: `jobtracker.com`
   - Vercel provides DNS instructions

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

#### B. SSL Certificate
- Vercel automatically provisions SSL certificates
- HTTPS is enabled by default
- Custom domains get SSL within minutes

### 7. Performance Monitoring

#### A. Enable Vercel Analytics
```bash
# Install Vercel analytics
npm install @vercel/analytics

# Add to your main component
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### B. Web Vitals Monitoring
```javascript
// Add to pages/_app.js or index.js
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}
```

### 8. Preview Deployments

#### A. Branch Previews
- Every branch gets a unique URL
- Pull requests automatically get preview deployments
- Perfect for testing before production

#### B. Preview URLs
```
Production: https://jobtracker.vercel.app
Preview: https://jobtracker-git-feature-branch.vercel.app
```

### 9. Vercel CLI Commands

```bash
# Development
vercel dev                 # Run local development server

# Deployment
vercel                     # Deploy to preview
vercel --prod             # Deploy to production
vercel --name my-app      # Deploy with specific name

# Project Management
vercel ls                 # List deployments
vercel inspect URL        # Get deployment details
vercel logs URL           # View deployment logs
vercel domains ls         # List domains
vercel env ls             # List environment variables

# Cleanup
vercel rm deployment-url  # Remove deployment
```

### 10. Troubleshooting Vercel Issues

#### Build Failures
```bash
# Check build logs
vercel logs --follow

# Common issues:
# 1. Environment variables not set
vercel env ls

# 2. Build command wrong
# Check package.json "build" script

# 3. Output directory wrong
# Ensure vercel.json has correct "distDir"
```

#### Runtime Errors
```bash
# Check function logs
vercel logs https://your-app.vercel.app

# Common issues:
# 1. API URL incorrect
# 2. CORS issues from backend
# 3. Environment variables missing
```

#### Performance Issues
```javascript
// Bundle analysis
npm install --save-dev webpack-bundle-analyzer

// Add script to package.json
"analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
```

### 11. Vercel Project Settings

#### A. Build & Development Settings
```
Build Command: npm run build
Output Directory: build
Install Command: npm install
Development Command: npm start
```

#### B. Environment Variables
```
REACT_APP_API_URL (Production): https://jobtracker-api.herokuapp.com
REACT_APP_API_URL (Preview): https://jobtracker-api-staging.herokuapp.com
REACT_APP_API_URL (Development): http://localhost:3001
```

### 12. Integration with Backend

#### Update CORS in Backend
After deploying frontend, update your backend CORS configuration:
```javascript
// backend/src/server.js
app.use(cors({
  origin: [
    'https://jobtracker.vercel.app',        // Your Vercel production URL
    'https://jobtracker-git-*.vercel.app',  // Preview deployments
    'http://localhost:3000',                 // Local development
    process.env.FRONTEND_URL,               // Environment variable
    `chrome-extension://${process.env.EXTENSION_ID}`
  ],
  credentials: true
}));
```

### 13. Vercel Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Hobby** | Free | Personal projects, 100GB bandwidth |
| **Pro** | $20/month | Commercial use, 1TB bandwidth, analytics |
| **Enterprise** | Custom | Advanced features, SLA, support |

**Recommendation**: Start with **Hobby (Free)** for MVP, upgrade to **Pro** when you get serious traffic.

### 14. Quick Deployment Checklist

- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] Environment variables configured in Vercel
- [ ] `vercel.json` created with correct configuration
- [ ] Backend CORS updated with Vercel URLs
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] SSL certificate active

### 15. Post-Deployment Verification

```bash
# Test your deployed frontend
curl -I https://jobtracker.vercel.app
# Should return 200 OK

# Test API connectivity from frontend
curl https://jobtracker.vercel.app
# Should load your React app

# Test backend connection
# Open browser dev tools, check Network tab for API calls
```

Your final Vercel URLs will be:
- **Production**: `https://jobtracker.vercel.app`
- **Custom Domain**: `https://your-domain.com`
- **Preview**: `https://jobtracker-git-branch.vercel.app`

## 🔧 Chrome Extension Production Update

### 1. Update Extension Manifest
```json
{
  "manifest_version": 3,
  "name": "JobTracker - Resume & Job Assistant",
  "version": "1.0.0",
  "description": "AI-powered job application tracking and resume optimization",
  "permissions": [
    "activeTab",
    "storage",
    "https://your-jobtracker-api.herokuapp.com/*"
  ],
  "host_permissions": [
    "https://*.indeed.com/*",
    "https://*.linkedin.com/*",
    "https://nitpenn.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://*.indeed.com/*",
        "https://*.linkedin.com/*",
        "https://nitpenn.com/*"
      ],
      "js": ["content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "JobTracker"
  }
}
```

### 2. Update API Endpoints in Extension
```javascript
// extension/config.js
const CONFIG = {
  API_URL: 'https://your-jobtracker-api.herokuapp.com',
  APP_URL: 'https://your-app.vercel.app',
  isDevelopment: false
};

// extension/background.js
const API_BASE = CONFIG.API_URL;

// Update all fetch calls to use production URL
const saveJob = async (jobData) => {
  const response = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  return response.json();
};
```

## 📋 Pre-Deployment Checklist

### Backend Verification
- [ ] All environment variables set in Heroku
- [ ] Procfile created in backend root
- [ ] package.json has correct start script and Node version
- [ ] Database connection working with production Supabase
- [ ] CORS configured for production frontend URL
- [ ] Rate limiting configured appropriately
- [ ] AI service working with production API keys
- [ ] Health endpoint responding: `/health`

### Frontend Verification
- [ ] API calls pointing to production backend (Heroku URL)
- [ ] Supabase connection working
- [ ] Resume grader upload working
- [ ] Authentication flows working
- [ ] Build command successful: `npm run build`

### Extension Verification
- [ ] Manifest updated with production permissions (Heroku URL)
- [ ] API endpoints updated to production URLs
- [ ] Extension builds without errors
- [ ] Job extraction working on target sites
- [ ] Background sync working with production API

## 🔍 Post-Deployment Testing

### 1. Test Resume Grader
```bash
# Test public resume grader endpoint
curl -X POST https://your-jobtracker-api.herokuapp.com/api/ai/resume-grade \
  -F "resume=@sample-resume.pdf"

# Should return JSON with scores and analysis
```

### 2. Test Authentication
```bash
# Test user registration
curl -X POST https://your-jobtracker-api.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### 3. Test Extension
- Install unpacked extension in Chrome
- Visit Indeed job page
- Verify job extraction overlay appears
- Test saving job to dashboard
- Verify sync between extension and web app

## 🚨 Common Issues & Solutions

### CORS Issues
```javascript
// backend/server.js - Make sure production URLs are included
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://your-app.vercel.app',
    `chrome-extension://${process.env.EXTENSION_ID}`
  ],
  credentials: true
}));
```

### Environment Variable Issues
```bash
# Verify all env vars are set in Heroku
heroku config -a your-jobtracker-api

# Test environment variables
heroku run bash -a your-jobtracker-api
echo $SUPABASE_URL
```

### Database Connection Issues
```javascript
// Test Supabase connection in Heroku shell
heroku run node -a your-jobtracker-api
// Then in Node REPL:
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Supabase connected:', !!supabase);
```

### Build Issues
```bash
# Check build logs
heroku logs -a your-jobtracker-api

# Common fixes:
# 1. Ensure package.json has correct Node version
# 2. Check all dependencies are in dependencies, not devDependencies
# 3. Verify start script points to correct file
```

## 📊 Monitoring Setup

### 1. Heroku Metrics
```bash
# View real-time logs
heroku logs --tail -a your-jobtracker-api

# Monitor dyno usage
heroku ps -a your-jobtracker-api

# Set up log drains for monitoring (optional)
heroku drains:add https://your-logging-service.com -a your-jobtracker-api
```

### 2. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor page load times
- Track conversion rates

### 3. Application Monitoring
```javascript
// Add to backend/server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});
```

## 🎯 Week 1 Success Metrics

### Technical KPIs
- [ ] Backend uptime > 99%
- [ ] Resume grader response time < 10s
- [ ] Frontend load time < 3s
- [ ] Extension job extraction success rate > 95%

### Business KPIs
- [ ] 100+ resume analyses within first week
- [ ] 10+ user registrations from resume grader
- [ ] Extension working on Indeed + Nittany Careers
- [ ] Zero critical bugs in production

## 💰 Heroku Pricing Options

### Dyno Types:
- **Eco Dyno**: $5/month (sleeps after 30 mins of inactivity)
- **Basic Dyno**: $7/month (never sleeps, better for production)
- **Standard-1X**: $25/month (auto-scaling, metrics dashboard)

### Recommendation:
For your MVP launch, **Basic Dyno ($7/month)** is recommended to ensure your resume grader is always available for user acquisition.

## 🚀 Quick Deploy Commands

```bash
# Backend (from backend directory)
git add .
git commit -m "Deploy to production"
git push heroku main

# Frontend (from frontend directory)
vercel --prod

# Extension (zip and upload to Chrome Web Store)
zip -r jobtracker-extension.zip extension/
```

## 📍 Your Production URLs

After deployment, your URLs will be:
- **Backend**: `https://your-jobtracker-api.herokuapp.com`
- **Frontend**: `https://your-app-name.vercel.app`
- **Extension**: Chrome Web Store listing

## ⚡ Quick Start Deployment

1. **Backend**: Create Heroku app, set env vars, push code (15 mins)
2. **Frontend**: Deploy to Vercel with updated API URL (10 mins)
3. **Extension**: Update manifest and config files (5 mins)
4. **Testing**: Verify all endpoints work (10 mins)

**Total deployment time: ~40 minutes**

This deployment strategy gets you live with a proven, battle-tested platform that scales with your growth.
