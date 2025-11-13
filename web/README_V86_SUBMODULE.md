# v86.js Git Submodule Setup

v86 is now included as a git submodule to avoid CORS issues and ensure we always have the latest version.

## Initial Setup

After cloning the repository, initialize the submodule:

```bash
git submodule update --init --recursive
```

## Building libv86.js

### Option 1: Build from Source (Recommended)

```bash
cd web
./build-v86.sh
```

This will:
1. Build `libv86.js` from the submodule source
2. Copy it to `web/libv86.js`
3. Ready to use!

**Requirements:**
- `make`
- `rustc` (Rust compiler) - install from https://rustup.rs/
- `nodejs` (v16+)
- `clang` (compatible with Rust)
- `java` (for Closure Compiler)

### Option 2: Download Pre-built (Quick)

If you can't build from source, download from a working CDN:

```bash
cd web
curl -L "https://copy.sh/v86/build/libv86.js" -o libv86.js
```

Or use the Vercel proxy:
```bash
curl "https://your-vercel-app.vercel.app/api/v86-proxy" -o libv86.js
```

## Updating the Submodule

To update to the latest v86 version:

```bash
cd web/v86
git pull origin master
cd ..
./build-v86.sh  # Rebuild
```

## How It Works

1. **Submodule**: `web/v86/` contains the full v86 source code
2. **Built File**: `web/libv86.js` is the compiled JavaScript file
3. **Loading**: The code automatically uses `./libv86.js` first (no CORS!)

## Benefits

- ✅ **No CORS Issues**: File is served from same origin
- ✅ **Always Available**: No dependency on external CDNs
- ✅ **Version Control**: Submodule tracks specific v86 version
- ✅ **Fast Loading**: Local file loads instantly
- ✅ **Offline Support**: Works without internet

## Troubleshooting

### Submodule Not Initialized

```bash
git submodule update --init --recursive
```

### Build Fails

1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Install Node.js: https://nodejs.org/
3. Install make and clang
4. Try again: `./build-v86.sh`

### File Not Found

Make sure `libv86.js` exists:
```bash
ls -lh web/libv86.js
```

If missing, build it or download it (see above).

## For Vercel Deployment

Vercel will automatically:
1. Initialize the submodule during build
2. Serve `libv86.js` from the same origin
3. No CORS issues!

Make sure `.gitmodules` is committed so Vercel can initialize the submodule.

