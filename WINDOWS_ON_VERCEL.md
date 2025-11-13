# Running Windows 10/11 on Vercel

This project enables Windows 10/11 to **actually run on Vercel** using browser-based x86 emulation. No external servers required!

## How It Works

### Browser-Based Emulation

Windows runs entirely in your browser using:

1. **v86.js** - JavaScript x86 CPU emulator
2. **Windows Disk Image** - Loaded from URL or uploaded
3. **HTML5 Canvas** - Renders Windows desktop
4. **Vercel Static Hosting** - Serves the emulator (no server needed!)

### Architecture

```
┌─────────────────────────┐
│   Vercel (Static Site)  │
│                         │
│  ┌───────────────────┐  │
│  │  v86.js Emulator  │  │ ← x86 CPU emulation
│  │  + Windows Image │  │ ← Windows 10/11 disk
│  │  + Canvas Render │  │ ← HTML5 Canvas display
│  └───────────────────┘  │
│                         │
│  All runs in browser!   │
└─────────────────────────┘
```

## Features

✅ **Windows on Vercel** - Runs entirely in browser, no backend needed
✅ **Full Desktop** - Complete Windows 10/11 experience
✅ **Mouse & Keyboard** - Full input support
✅ **Image Upload** - Upload your own Windows images
✅ **URL Loading** - Load images from CDN/storage
✅ **Settings** - Configure memory, CPU speed, etc.
✅ **BrowserPod Integration** - Run dev scripts to create VMs

## Getting Started

### 1. Deploy to Vercel

```bash
cd web
vercel
```

### 2. Get Windows Image

You need a Windows disk image. Options:

**Option A: Use Demo Image**
- Windows 3.11 demo (lightweight, fast)
- Good for testing

**Option B: Host Your Own**
- Upload Windows 10/11 image to:
  - Azure Blob Storage
  - AWS S3
  - Google Cloud Storage
  - Any CDN with CORS enabled

**Option C: Use BrowserPod**
- BrowserPod can download images
- Avoids CORS issues
- Runs in browser

### 3. Run Windows

1. Open your Vercel deployment
2. Click "Run Windows on Vercel"
3. Select/upload Windows image
4. Windows boots in your browser!

## Windows Images

### Image Requirements

- **Format**: `.img`, `.iso`, `.vmdk`, `.vdi`
- **Size**: Typically 2-20GB (compressed)
- **CORS**: Must allow browser access
- **HTTPS**: Required for secure sites

### Recommended Sources

1. **Azure Blob Storage** - Public container with CORS
2. **AWS S3** - Public bucket with CORS
3. **GitHub Releases** - For smaller images
4. **CDN** - Fast global distribution

### Creating Images

To create a Windows image for browser emulation:

```bash
# Using QEMU
qemu-img convert -f vmdk -O raw windows.vmdk windows.img

# Compress for faster download
gzip windows.img
```

## BrowserPod Integration

BrowserPod allows running dev scripts in the browser to:

1. **Download Images** - Fetch Windows images
2. **Run Terraform** - Create Azure VMs from browser
3. **Execute Scripts** - Run setup scripts
4. **Manage VMs** - Control VM lifecycle

### Using BrowserPod

```javascript
import { BrowserPodManager } from './browserpod-integration.js';

const manager = new BrowserPodManager();
await manager.initialize();

// Download Windows image
await manager.downloadWindowsImage();

// Create VM from browser
await manager.createVMFromScript({
    vmName: 'my-windows-vm',
    location: 'eastus',
    // ... config
});
```

## Performance

### Expected Performance

- **CPU**: ~10-50% of native speed (emulated)
- **Memory**: Limited by browser (typically 2-4GB)
- **Graphics**: VGA mode (640x480 or 800x600)
- **Boot Time**: 30-120 seconds (depends on image size)

### Optimization Tips

1. **Use Smaller Images**: Windows 3.11 boots in ~10 seconds
2. **Reduce Memory**: Lower memory = faster emulation
3. **Disable Network**: If not needed
4. **Close Tabs**: Free up browser memory
5. **Use SSD**: Faster image loading

## Limitations

⚠️ **Current Limitations:**

1. **Performance**: Emulated CPU is slower
2. **Memory**: Browser memory limits (2-4GB)
3. **Graphics**: VGA mode only (no modern GPU)
4. **Network**: Requires WebSocket relay
5. **Image Size**: Large images take time to download
6. **Compatibility**: Some Windows features may not work

## Comparison: Browser vs Azure VM

| Feature | Browser (Vercel) | Azure VM |
|---------|------------------|----------|
| **Cost** | Free | ~$70-150/month |
| **Performance** | Slow (emulated) | Fast (native) |
| **Setup** | Instant | 10-15 minutes |
| **Scalability** | Limited | Unlimited |
| **Graphics** | VGA only | Full GPU support |
| **Network** | WebSocket relay | Direct internet |
| **Storage** | Browser limits | Unlimited |

**Use Browser for**: Demos, testing, lightweight use
**Use Azure VM for**: Production, performance, full features

## Troubleshooting

### "v86.js not loaded"

**Solution**: Check internet connection, v86.js loads from CDN

### "Unable to load image"

**Solutions**:
1. Check image URL is accessible
2. Verify CORS headers
3. Try different image format
4. Use BrowserPod to download

### Slow Performance

**Solutions**:
1. Reduce memory allocation
2. Use smaller image
3. Close other tabs
4. Use "slow" CPU speed

### Image Too Large

**Solutions**:
1. Compress image (gzip)
2. Use CDN for faster download
3. Use BrowserPod
4. Consider Windows 3.11 for testing

## Security

⚠️ **Security Considerations:**

1. **Image Sources**: Only use trusted images
2. **CORS**: Configure properly on storage
3. **HTTPS**: Always use HTTPS
4. **Network**: Disable if not needed
5. **Storage**: Images in localStorage (limited)

## Examples

### Windows 3.11 (Demo)

Fast, lightweight, good for testing:

```javascript
emulator.loadImage('https://example.com/windows311.img');
```

### Windows 10/11

Full desktop experience:

```javascript
emulator.loadImage('https://your-cdn.com/windows11.img');
```

### Custom Image

Upload from browser:

```javascript
emulator.loadCustomImage(); // Opens file picker
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Get Windows image URL
3. ✅ Load Windows in browser
4. ✅ Configure settings
5. ✅ Enjoy Windows on Vercel!

## References

- [v86.js](https://github.com/copy/v86) - x86 emulator
- [BrowserPod](https://github.com/leaningtech/browserpod-meta) - Browser containers
- [Windows on Web](https://github.com/luybe21br/windows-on-web) - WebGL Windows
- [QEMU.js](https://github.com/leaningtech/webvm) - QEMU in browser

---

**Note**: This runs Windows entirely in the browser on Vercel. No backend servers, no Azure VMs (unless you want them). Pure browser-based emulation!

