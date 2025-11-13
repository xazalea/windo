# Deploying to Vercel - Step by Step Guide

This guide walks you through deploying the Windows VM Web Portal to Vercel.

## Prerequisites

- A Vercel account ([Sign up free](https://vercel.com/signup))
- Git repository (GitHub, GitLab, or Bitbucket) - optional but recommended
- Node.js installed (for local testing)

## Method 1: Deploy via Vercel CLI (Quickest)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Navigate to Web Directory

```bash
cd web
```

### Step 3: Deploy

```bash
vercel
```

### Step 4: Follow Prompts

1. **Set up and deploy?** → Yes
2. **Which scope?** → Your account or team
3. **Link to existing project?** → No (for first time)
4. **Project name?** → `windows-vm-portal` (or your choice)
5. **Directory?** → `./` (current directory)
6. **Override settings?** → No

### Step 5: Access Your Deployment

After deployment, Vercel will provide you with:
- **Production URL**: `https://windows-vm-portal.vercel.app`
- **Preview URLs**: For each commit/branch

## Method 2: Deploy via GitHub (Recommended for Production)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/windows-vm.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `web` (click "Edit" and set to `web`)
   - **Build Command**: (leave empty - it's a static site)
   - **Output Directory**: `.` (current directory)
6. Click **"Deploy"**

### Step 3: Automatic Deployments

Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Provide HTTPS and CDN automatically

## Method 3: Deploy via Vercel Dashboard (No CLI)

### Step 1: Prepare Files

Make sure your `web` directory contains:
- `index.html`
- `styles.css`
- `app.js`
- `package.json`
- `vercel.json`

### Step 2: Upload to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Upload"**
4. Drag and drop your `web` folder
5. Click **"Deploy"**

## Configuration

### Custom Domain

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment Variables

If you need to connect to a backend API:

1. Go to **Settings** → **Environment Variables**
2. Add variables:
   - `API_URL`: Your backend API endpoint
   - `AZURE_SUBSCRIPTION_ID`: (if needed)

### Build Settings

The project is configured as a static site, so no build is needed. If you want to customize:

1. Go to **Settings** → **General**
2. **Build & Development Settings**:
   - Framework Preset: Other
   - Build Command: (empty)
   - Output Directory: `.`
   - Install Command: (empty)

## Updating Your Deployment

### Via CLI

```bash
cd web
vercel --prod
```

### Via Git

Just push to your connected repository:

```bash
git add .
git commit -m "Update web interface"
git push
```

Vercel will automatically deploy!

## Troubleshooting

### Build Fails

- Check that `vercel.json` is in the `web` directory
- Ensure `package.json` exists
- Verify all files are in the correct location

### 404 Errors

**If deploying from root directory:**
- Make sure `vercel.json` in root specifies `"outputDirectory": "web"`
- Or deploy from the `web` directory directly

**If deploying from `web` directory:**
- Ensure `vercel.json` is in the `web` directory
- Check that `index.html` exists in the `web` directory
- Verify all file paths are relative (e.g., `./styles.css` not `/styles.css`)
- Make sure `package.json` exists in the `web` directory

**Common fixes:**
1. Delete root `vercel.json` if deploying from `web` directory
2. Set Root Directory to `web` in Vercel project settings
3. Ensure all HTML files reference assets with relative paths

### Styling Issues

- Clear browser cache
- Check that `styles.css` is properly linked in `index.html`
- Verify CSS file paths are correct

### JavaScript Not Working

- Open browser console to check for errors
- Verify `app.js` is properly linked in `index.html`
- Check that all functions are defined

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ HTTPS/SSL
- ✅ Automatic compression
- ✅ Edge caching

### Additional Optimizations

1. **Image Optimization**: Use Vercel's Image Optimization API
2. **Font Optimization**: Preload fonts in `index.html`
3. **Code Splitting**: If you add more features, consider splitting JS

## Monitoring

Vercel provides:
- **Analytics**: View traffic and performance
- **Logs**: Check deployment and runtime logs
- **Speed Insights**: Monitor Core Web Vitals

Access these in your project dashboard.

## Cost

Vercel's **Hobby Plan** (free) includes:
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains
- Automatic HTTPS

Perfect for this project! Upgrade to Pro ($20/month) for:
- More bandwidth
- Team collaboration
- Advanced analytics

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain (optional)
3. ✅ Set up environment variables (if needed)
4. ✅ Connect to your Terraform-deployed VMs
5. ✅ Share your portal URL!

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Project Issues](https://github.com/yourusername/windows-vm/issues)

