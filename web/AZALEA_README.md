# Azalea - Windows Running on the Browser

**Azalea** is a fully functional Windows 10 Lite Edition running directly in your web browser on Vercel. No external servers, no Azure VMs needed - just pure browser-based Windows emulation.

## 🎯 What is Azalea?

Azalea uses **v86.js** (x86 emulator) to run Windows 10 Lite Edition entirely in your browser. The Windows OS runs client-side, giving you a complete Windows desktop experience without any backend infrastructure.

## ⚠️ Important Warning

**This will make your device laggy, especially on lower end devices. You may not be able to do anything else while Windows is running.**

### System Requirements

- **Memory**: At least 4GB RAM recommended (2GB minimum)
- **CPU**: Modern multi-core processor
- **Browser**: Latest Chrome, Firefox, Edge, or Safari
- **Internet**: Stable connection for initial image download (1.1GB)
- **Storage**: Sufficient browser storage

## 🚀 Quick Start

### 1. Deploy to Vercel

```bash
cd web
vercel
```

### 2. Accept Terms

When you first visit, you'll see the terms page. You must:
1. **Scroll through all terms** (to the bottom)
2. **Click "I Understand and Accept"**
3. Windows will automatically load!

### 3. Use Windows

- Windows 10 Lite boots automatically
- Full desktop experience
- Mouse, keyboard, and clipboard work
- All standard Windows apps available

## 🎮 Controls

### Keyboard Shortcuts

- **T** - Toggle toolbar visibility
- **S** - Open settings
- **R** - Restart Windows
- **Esc** - Exit Azalea
- **F11** - Toggle fullscreen

### Toolbar Buttons

- **Toggle Toolbar** - Hide/show toolbar for fullscreen
- **Settings** - Configure emulator
- **Restart** - Restart Windows
- **Exit** - Return to home page

## 📋 Terms & Conditions

Before using Azalea, you must accept the terms which include:

- Performance warnings
- System requirements
- Limitations
- Support information

**You must scroll to the bottom of the terms page before the accept button becomes enabled.**

## 🖥️ Features

✅ **Full Windows 10 Desktop** - Complete Windows experience  
✅ **Browser-Based** - Runs entirely in browser, no servers  
✅ **Mouse & Keyboard** - Full input support  
✅ **Clipboard** - Copy/paste works  
✅ **Settings** - Configurable memory, CPU, network  
✅ **Fullscreen** - True fullscreen experience  
✅ **Auto-Load** - Windows 10 Lite loads automatically  

## 🛠️ Technical Details

### Emulator

- **v86.js** - JavaScript x86 CPU emulator
- **Memory**: 1GB default (configurable 512MB-2GB)
- **Graphics**: VGA mode (16MB memory)
- **Boot**: From CD-ROM (ISO format)
- **Network**: Optional WebSocket relay

### Windows Image

- **Source**: Archive.org
- **Image**: Windows 10 Lite Edition 19H2 x64
- **Size**: 1.1GB
- **Format**: ISO (bootable)
- **URL**: Automatically loaded from archive.org

## ⚙️ Configuration

### Memory Settings

- **Minimum**: 512MB (may not work well)
- **Recommended**: 1024MB (1GB)
- **Optimal**: 1536MB-2048MB

### CPU Speed

- **Slow**: Better compatibility, more stable
- **Medium**: Balanced (recommended)
- **Fast**: May cause issues

### Network

- **Enabled**: Internet access via WebSocket relay
- **Disabled**: No network, better performance

## 🐛 Troubleshooting

### Windows Won't Boot

1. Wait longer (30-60 seconds for first boot)
2. Check internet connection
3. Refresh the page
4. Check browser console for errors

### Slow Performance

1. Increase memory to 1536MB or 2048MB
2. Close other browser tabs
3. Use "slow" CPU speed
4. Disable network if not needed

### Terms Button Not Enabling

- You must scroll **all the way to the bottom** of the terms
- The button only enables when you've scrolled 99%+ of the way

### Toolbar Issues

- Press **T** to toggle toolbar
- Toolbar can be hidden for true fullscreen
- Press **Esc** to exit

## 📝 Reporting Issues

**Report any errors on the Github repo, or any suggestions.**

We welcome:
- Bug reports
- Feature suggestions
- Performance improvements
- Documentation updates

## 🔒 Privacy & Security

- Windows runs entirely client-side
- No data sent to external servers (except image download)
- Image loaded from archive.org (public)
- All processing happens in your browser
- No tracking or analytics

## 💡 Tips

1. **First Boot**: Be patient, takes 30-60 seconds
2. **Memory**: Use at least 1GB for Windows 10
3. **Tabs**: Close other tabs for better performance
4. **Fullscreen**: Hide toolbar (T key) for immersive experience
5. **Settings**: Adjust memory/CPU based on your device

## 🎉 Enjoy!

Have fun with Azalea! Windows 10 Lite running directly in your browser on Vercel.

---

**Azalea** - Windows running on the browser. 🪟

