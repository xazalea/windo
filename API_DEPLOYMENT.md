# API Functions Deployment Guide

The API serverless functions (`/api/windows-iso-proxy`, `/api/fileio-proxy`, `/api/v86-proxy`) need to be properly deployed on Vercel.

## Current Configuration

The functions are located at:
- `web/api/windows-iso-proxy.js`
- `web/api/fileio-proxy.js`
- `web/api/v86-proxy.js`

## Deployment Steps

### Option 1: Deploy from Root (Recommended)

1. Ensure `vercel.json` in the root has:
   ```json
   {
     "outputDirectory": "web",
     "functions": {
       "api/v86-proxy.js": { "maxDuration": 30 },
       "api/windows-iso-proxy.js": { "maxDuration": 300 },
       "api/fileio-proxy.js": { "maxDuration": 60 }
     }
   }
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy from Web Directory

1. Navigate to web directory:
   ```bash
   cd web
   ```

2. Ensure `web/vercel.json` has the functions config

3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 3: Configure in Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Settings
2. Set **Root Directory** to `web`
3. Go to **Functions** tab
4. Verify functions are detected (should show `api/*.js`)
5. Redeploy

## Verifying Deployment

After deployment, test the endpoints:
- `https://your-project.vercel.app/api/windows-iso-proxy` (should return ISO data or 206 for range requests)
- `https://your-project.vercel.app/api/fileio-proxy` (should handle CORS preflight)

## Troubleshooting

### Functions still return 404

1. **Check deployment logs**: Vercel Dashboard → Deployments → Latest → Functions tab
2. **Verify file structure**: Functions must be in `web/api/` directory
3. **Check function format**: Functions must export default async handler
4. **Redeploy**: Sometimes a fresh deployment is needed

### Functions timeout

- Increase `maxDuration` in `vercel.json` (Hobby plan max is 10s, Pro is 60s, Enterprise is 300s)

### CORS errors

- The functions include CORS headers, but if you see CORS errors, check the function logs

## Expected Behavior

- **Proxy available**: Functions work, no CORS issues
- **Proxy unavailable (404)**: Code falls back to direct URLs (may have CORS limitations)
- **Backend unavailable**: Code degrades gracefully to localStorage-only mode

