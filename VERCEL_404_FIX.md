# Fix Vercel 404 Error - Step by Step

If you're seeing `404` errors, follow these steps:

## Method 1: Configure Root Directory in Vercel Dashboard (RECOMMENDED)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **General**
4. Scroll to **Root Directory**
5. Click **Edit**
6. Enter: `web`
7. Click **Save**
8. Go to **Deployments** tab
9. Click **Redeploy** on the latest deployment
10. Select **Use existing Build Cache** → **Redeploy**

This tells Vercel to use the `web` directory as the root.

## Method 2: Deploy from `web` Directory (Alternative)

If Method 1 doesn't work, deploy directly from the `web` directory:

```bash
cd web
vercel --prod
```

This ensures Vercel uses `web` as the root.

## Method 3: Delete and Re-import Project

1. In Vercel Dashboard, delete the current project
2. Click **Add New Project**
3. Import your GitHub repository
4. **IMPORTANT**: When configuring:
   - **Framework Preset**: Other
   - **Root Directory**: Click **Edit** → Set to `web`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.` (current directory)
   - **Install Command**: (leave empty)
5. Click **Deploy**

## Verify Configuration

After deployment, check:

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Should see the Windows VM Portal homepage
3. Check browser console (F12) for any errors
4. Try `/terms` - should load terms page
5. Try `/windows` - should load Windows emulator

## Common Issues

### Issue: Still getting 404

**Solution**: 
- Double-check Root Directory is set to `web` (not `./web` or `/web`)
- Make sure `web/index.html` exists
- Redeploy after changing settings

### Issue: Page loads but assets (CSS/JS) 404

**Solution**:
- Check that all file paths in HTML are relative (e.g., `styles.css` not `/styles.css`)
- Verify files exist in `web/` directory
- Check browser console for specific 404 errors

### Issue: Routes like `/terms` don't work

**Solution**:
- Verify `web/vercel.json` exists with rewrites
- Check that `terms.html` exists in `web/` directory
- Clear browser cache and try again

### Issue: API functions return 404 (`/api/windows-iso-proxy`, `/api/fileio-proxy`)

**Solution**:
- Verify `web/api/` directory contains the function files:
  - `web/api/windows-iso-proxy.js`
  - `web/api/fileio-proxy.js`
  - `web/api/v86-proxy.js`
- Check that root `vercel.json` has functions configuration
- Ensure Root Directory is set to `web` in Vercel Dashboard
- Redeploy after making changes
- Check deployment logs for function build errors
- Test endpoints directly: `https://your-project.vercel.app/api/windows-iso-proxy`

## Quick Test

Test locally first:

```bash
cd web
npx serve .
```

Visit `http://localhost:3000` - should work perfectly. If it works locally but not on Vercel, it's a configuration issue.

## Still Not Working?

1. Check Vercel deployment logs (in Dashboard → Deployments → Click deployment → Logs)
2. Verify all files are committed to git
3. Try deploying from CLI: `cd web && vercel --prod --force`
4. Check that `web/vercel.json` and root `vercel.json` both exist

## Expected File Structure

```
windows/
├── vercel.json          ← Root config (points to web/, includes API functions)
├── web/
│   ├── vercel.json      ← Web config (routing, API functions)
│   ├── api/             ← Serverless functions directory
│   │   ├── windows-iso-proxy.js
│   │   ├── fileio-proxy.js
│   │   └── v86-proxy.js
│   ├── index.html       ← Main page
│   ├── terms.html
│   ├── windows-emulator.html
│   ├── styles.css
│   ├── app.js
│   └── ... (other files)
```

Both `vercel.json` files should exist, and API functions should be in `web/api/`!

