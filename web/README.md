# Windows VM Web Portal

A modern, responsive web interface for running Windows 10/11 **directly in your browser** on Vercel using x86 emulation.

## Features

- 🚀 **Windows on Vercel**: Actually run Windows 10/11 in browser using v86.js x86 emulator
- 🖥️ **Browser-Based VM**: Full Windows desktop experience without external servers
- 📊 **VM Management**: Deploy and manage VMs via Terraform
- ⚙️ **BrowserPod Integration**: Run dev scripts in browser to create VMs
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- ⌨️ **Keyboard Shortcuts**: Quick actions with keyboard (Ctrl/Cmd + K)

## How It Works

### Windows Running on Vercel

The project uses **v86.js** (x86 emulator) to run Windows directly in the browser:

1. **v86.js Emulator**: JavaScript-based x86 CPU emulator
2. **Windows Image**: Loads Windows 10/11 disk image
3. **Browser Rendering**: Displays Windows desktop on HTML5 Canvas
4. **Input Handling**: Mouse, keyboard, and clipboard support

### Architecture

```
┌─────────────────┐
│  Vercel (Web)   │  ← Static site hosting
│                 │
│  v86.js         │  ← x86 emulator (JavaScript)
│  Windows Image  │  ← Windows 10/11 disk image
│  Canvas Render  │  ← HTML5 Canvas display
└─────────────────┘
```

### BrowserPod Integration

For creating VMs from browser:

1. **BrowserPod Environment**: Runs dev containers in browser
2. **Terraform Scripts**: Execute Terraform from browser
3. **VM Creation**: Create Azure VMs directly from web interface
4. **Image Download**: Download Windows images via BrowserPod

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd web
vercel
```

3. Follow the prompts to link your project or create a new one.

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `web`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.` (current directory)
4. Click Deploy

## Windows Images

### Getting Windows Images

Windows images are large files (several GB). Options:

1. **Host on CDN**: Upload to Azure Blob Storage, S3, or similar
2. **Use BrowserPod**: Download images via BrowserPod to avoid CORS
3. **Local Storage**: Users can upload their own images
4. **Demo Images**: Use lightweight Windows 3.11 for testing

### Image Formats Supported

- `.img` - Raw disk image
- `.iso` - CD/DVD image
- `.vmdk` - VMware disk
- `.vdi` - VirtualBox disk

## Usage

### Running Windows in Browser

1. Open your Vercel deployment
2. Click "Run Windows"
3. Select a Windows image:
   - Upload your own image
   - Use a hosted image URL
   - Use demo Windows 3.11
4. Windows boots in your browser!

### Creating VMs from Browser

1. Click "Deploy VM"
2. Fill in VM configuration
3. BrowserPod runs Terraform scripts
4. VM is created on Azure
5. Connect via RDP or use browser emulator

## Technical Details

### v86.js Emulator

- **CPU**: x86 emulation (Pentium-class)
- **Memory**: Configurable (128MB - 2GB)
- **Graphics**: VGA emulation
- **Network**: Optional WebSocket relay
- **Storage**: Disk image support

### Performance

- **CPU**: Emulated, slower than native
- **Memory**: Limited by browser (typically 2-4GB)
- **Graphics**: VGA mode, pixelated rendering
- **Network**: Optional, via WebSocket relay

### Limitations

⚠️ **Current Limitations:**

1. **Performance**: Emulated CPU is slower than native
2. **Memory**: Limited by browser memory limits
3. **Graphics**: VGA mode only (no modern GPU)
4. **Network**: Requires WebSocket relay for internet
5. **Image Size**: Large images take time to download

## Configuration

### Emulator Settings

Edit settings in the emulator interface:
- Memory size (128MB - 2GB)
- CPU speed (slow/medium/fast)
- Sound enable/disable
- Network enable/disable
- CD-ROM enable/disable

### Custom Images

To use custom Windows images:

1. Prepare Windows disk image
2. Host on CDN or storage
3. Enter URL in image selector
4. Or upload directly from browser

## BrowserPod Setup

BrowserPod integration requires:

1. BrowserPod library loaded
2. WebAssembly support
3. Container runtime in browser

See [BrowserPod documentation](https://github.com/leaningtech/browserpod-meta) for details.

## Security Considerations

⚠️ **Important Security Notes:**

1. **Image Sources**: Only use trusted Windows images
2. **Network**: Disable network if not needed
3. **Storage**: Images stored in browser localStorage (limited)
4. **CORS**: Image URLs must allow CORS
5. **HTTPS**: Always use HTTPS for image downloads

## Troubleshooting

### "v86.js not loaded" Error

**Solution**: Check CDN connection, v86.js should load from CDN

### "Unable to load Windows image"

**Solutions**:
1. Check image URL is accessible
2. Verify CORS headers allow browser access
3. Try a different image format
4. Use BrowserPod to download image

### Slow Performance

**Solutions**:
1. Reduce memory allocation
2. Use smaller Windows image
3. Close other browser tabs
4. Use faster CPU speed setting

### Image Too Large

**Solutions**:
1. Use compressed image format
2. Host on fast CDN
3. Use BrowserPod to download
4. Consider using Windows 3.11 for testing

## Performance Tips

1. **Use Smaller Images**: Windows 3.11 boots faster than Windows 11
2. **Reduce Memory**: Lower memory = faster emulation
3. **Disable Network**: If not needed, disable for better performance
4. **Close Tabs**: Free up browser memory
5. **Use CDN**: Host images on fast CDN

## Cost

- **Vercel**: Free (Hobby plan) or $20/month (Pro)
- **Image Hosting**: Depends on storage/CDN provider
- **BrowserPod**: Free (runs in browser)
- **Total**: ~$0-20/month (excluding image storage)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Get Windows image URL
3. ✅ Load Windows in browser
4. ✅ Configure emulator settings
5. ✅ Enjoy Windows on Vercel!

## References

- [v86.js Documentation](https://github.com/copy/v86)
- [BrowserPod Meta](https://github.com/leaningtech/browserpod-meta)
- [Windows on Web](https://github.com/luybe21br/windows-on-web)
- [QEMU.js](https://github.com/leaningtech/webvm)

## License

MIT
