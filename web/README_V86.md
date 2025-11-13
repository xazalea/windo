# v86.js Local Hosting

To avoid CORS issues, v86.js should be hosted locally.

## Quick Setup

### Option 1: Download Script (Recommended)

```bash
cd web
./download-v86.sh
```

This will download `libv86.js` to the `web/` directory.

### Option 2: Manual Download

1. Download from: https://github.com/copy/v86/releases/download/v0.9.0/libv86.js
2. Save as `web/libv86.js`

### Option 3: Use npm (if you have Node.js)

```bash
cd web
npm install v86
cp node_modules/v86/build/libv86.js ./libv86.js
```

## Verification

After downloading, verify the file exists:

```bash
ls -lh web/libv86.js
```

The file should be around 2-3MB.

## Git

Add `libv86.js` to `.gitignore` if it's too large, or commit it if under 10MB.

## Why Local?

- ✅ No CORS issues
- ✅ Faster loading (same origin)
- ✅ More reliable (no CDN dependencies)
- ✅ Works offline

