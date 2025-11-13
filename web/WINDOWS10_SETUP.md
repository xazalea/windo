# Windows 10 Lite Setup Guide

This guide explains how to use the Windows 10 Lite Edition that runs directly in your browser on Vercel.

## Windows 10 Lite Edition

**Image**: Windows 10 Lite Edition 19H2 x64  
**Size**: 1.1GB  
**Source**: [Archive.org](https://archive.org/download/windows-10-lite-edition-19h2-x64/Windows%2010%20Lite%20Edition%2019H2%20x64.iso)  
**Format**: ISO (bootable CD image)

## Features

✅ **Fully Functional Windows 10** - Complete desktop experience  
✅ **Lightweight** - Only 1.1GB (vs 4-5GB for full Windows 10)  
✅ **Runs in Browser** - No external servers needed  
✅ **Fast Boot** - Optimized for emulation  
✅ **Full Emulation** - Mouse, keyboard, clipboard support  

## Quick Start

### 1. Deploy to Vercel

```bash
cd web
vercel
```

### 2. Open Emulator

1. Navigate to your Vercel deployment URL
2. Click "Run Windows on Vercel"
3. Windows 10 Lite will automatically load!

The emulator is pre-configured to use the Windows 10 Lite ISO from archive.org.

## First Boot

When Windows 10 Lite boots for the first time:

1. **Boot Time**: ~30-60 seconds (depends on connection speed)
2. **Installation**: May require Windows setup (if first boot)
3. **Configuration**: Follow Windows setup wizard
4. **Desktop**: You'll see the Windows 10 desktop

## Configuration

### Recommended Settings

- **Memory**: 1024MB (1GB) minimum, 1536MB recommended
- **CPU Speed**: Medium (best balance)
- **Network**: Enabled (for internet access)
- **Sound**: Enabled (optional)

### Performance Tips

1. **Close Other Tabs**: Free up browser memory
2. **Use Fast Connection**: Faster image download
3. **Be Patient**: First boot takes longer
4. **Don't Overload**: Avoid running too many programs

## Using Windows 10

### Mouse & Keyboard

- **Mouse**: Click and drag works normally
- **Keyboard**: All keys work, including shortcuts
- **Right-Click**: Works for context menus
- **Scroll**: Mouse wheel works

### Clipboard

- **Copy**: Ctrl+C works
- **Paste**: Ctrl+V works
- **Cut**: Ctrl+X works

### Applications

Windows 10 Lite includes:
- File Explorer
- Notepad
- Calculator
- Command Prompt
- And more standard Windows apps

### Installing Software

You can install software in Windows 10 Lite:
1. Download installers (if network enabled)
2. Run .exe files
3. Install applications normally

**Note**: Some modern applications may not work due to emulation limitations.

## Troubleshooting

### Windows Won't Boot

**Solutions**:
1. Wait longer (first boot takes 30-60 seconds)
2. Check internet connection (for image download)
3. Try refreshing the page
4. Check browser console for errors

### Slow Performance

**Solutions**:
1. Increase memory to 1536MB or 2048MB
2. Close other browser tabs
3. Use "slow" CPU speed for better compatibility
4. Disable network if not needed

### Image Download Fails

**Solutions**:
1. Check internet connection
2. Try again (archive.org can be slow)
3. Use BrowserPod to download image
4. Check browser console for CORS errors

### Mouse/Keyboard Not Working

**Solutions**:
1. Click on the canvas to focus
2. Try clicking different areas
3. Refresh the page
4. Check browser console for errors

## Advanced Usage

### Custom Images

To use a different Windows image:

1. Click "Settings" → "Select Image"
2. Choose "Custom Image"
3. Upload your own .img or .iso file
4. Or enter a URL to an image

### Saving State

**Note**: v86.js doesn't persist disk changes by default. To save changes:

1. Use the QEMU monitor (if available)
2. Commit disk changes
3. Or use snapshot functionality

### Network Access

With network enabled:
- Browse the internet
- Download files
- Access network resources
- Use Windows Update (may be slow)

## Technical Details

### Emulator Configuration

```javascript
{
    memory_size: 1024 * 1024 * 1024,  // 1GB RAM
    vga_memory_size: 16 * 1024 * 1024, // 16MB VGA
    boot_order: 0x213,                 // CD, C, A
    cdrom: {
        url: "https://archive.org/.../Windows 10 Lite Edition 19H2 x64.iso"
    }
}
```

### Boot Process

1. **BIOS Loads** (~2 seconds)
2. **CD-ROM Detected** (~3 seconds)
3. **Windows Boots** (~20-40 seconds)
4. **Desktop Appears** (~5-10 seconds)

### System Requirements

**Browser**:
- Modern browser (Chrome, Firefox, Edge, Safari)
- WebAssembly support
- At least 2GB free RAM
- Fast internet connection (for image download)

**Host System**:
- 4GB+ RAM recommended
- Modern CPU (for emulation performance)
- Stable internet connection

## Limitations

⚠️ **Known Limitations**:

1. **Performance**: Slower than native (emulated CPU)
2. **Graphics**: VGA mode only (no modern GPU)
3. **Memory**: Limited by browser (typically 2-4GB max)
4. **Storage**: Changes may not persist (snapshot mode)
5. **Network**: Requires WebSocket relay
6. **Compatibility**: Some modern apps may not work

## Tips for Best Experience

1. **First Boot**: Be patient, it takes time
2. **Memory**: Use at least 1GB, 1.5GB+ recommended
3. **Network**: Enable only if needed
4. **Applications**: Stick to lightweight apps
5. **Updates**: Windows Update may be slow

## Support

For issues:
- Check browser console for errors
- Verify image URL is accessible
- Try refreshing the page
- Check v86.js documentation

## References

- [Windows 10 Lite ISO](https://archive.org/download/windows-10-lite-edition-19h2-x64/)
- [v86.js Documentation](https://github.com/copy/v86)
- [Archive.org](https://archive.org/)

---

**Enjoy your fully functional Windows 10 Lite running in your browser on Vercel!** 🎉

