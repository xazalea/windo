# Fixing Vercel 404 Errors

If you're getting 404 errors on Vercel, follow these steps:

## Quick Fix

### Option 1: Deploy from `web` directory (Recommended)

```bash
cd web
vercel
```

This ensures Vercel uses the `web` directory as the root.

### Option 2: Configure Root Directory in Vercel Dashboard

If deploying from GitHub:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Under **Root Directory**, click **Edit**
5. Set to: `web`
6. Click **Save**
7. Redeploy

## Verify Configuration

### Check `web/vercel.json` exists

```bash
ls -la web/vercel.json
```

Should show the file exists.

### Check `web/index.html` exists

```bash
ls -la web/index.html
```

Should show the file exists.

### Check file paths in HTML

All paths should be relative (not absolute):

✅ Good: `href="styles.css"`  
✅ Good: `src="./app.js"`  
❌ Bad: `href="/styles.css"` (absolute path)

## Common Issues

### Issue 1: Root Directory Not Set

**Symptom**: 404 on all pages

**Fix**: Set Root Directory to `web` in Vercel settings

### Issue 2: Missing vercel.json

**Symptom**: 404 on routes like `/terms`, `/windows`

**Fix**: Ensure `web/vercel.json` exists with proper rewrites

### Issue 3: CSP Blocking Resources

**Symptom**: Page loads but scripts/styles don't work

**Fix**: Check browser console for CSP errors, adjust `Content-Security-Policy` in `vercel.json`

### Issue 4: Case Sensitivity

**Symptom**: Works locally but not on Vercel

**Fix**: Ensure all file names match exactly (case-sensitive)

## Testing Locally

Before deploying, test locally:

```bash
cd web
npx serve .
```

Visit `http://localhost:3000` and verify:
- ✅ Home page loads (`/`)
- ✅ Terms page loads (`/terms.html`)
- ✅ Windows emulator loads (`/windows-emulator.html`)
- ✅ All CSS/JS files load

## Deployment Checklist

- [ ] `web/vercel.json` exists
- [ ] `web/index.html` exists
- [ ] `web/package.json` exists
- [ ] All file paths are relative
- [ ] Root Directory set to `web` (if deploying from root)
- [ ] No absolute paths in HTML/CSS/JS
- [ ] All required files are in `web/` directory

## Still Not Working?

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all files are committed to git
4. Try redeploying from scratch

## Quick Redeploy

```bash
cd web
vercel --prod --force
```

This forces a fresh deployment.

