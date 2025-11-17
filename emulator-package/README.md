# windo

**Super easy browser-based x86 emulator** - Just provide an ISO and it handles everything automatically!

## 🚀 Quick Start

### 1. Install

```bash
npm install windo
```

### 2. Include v86.js in your HTML

```html
<script src="https://unpkg.com/v86@latest/build/libv86.js"></script>
```

### 3. Use it!

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Emulator</title>
</head>
<body>
  <div id="emulator-container"></div>
  
  <script src="https://unpkg.com/v86@latest/build/libv86.js"></script>
  <script type="module">
    import { init } from 'windo';
    
    // That's it! Just change the ISO_URL
    init({
      ISO_URL: 'https://example.com/my-os.iso'
    });
  </script>
</body>
</html>
```

## 📝 Configuration

Just edit `config.js` or pass options to `init()`:

```javascript
import { init } from 'windo';

init({
  // REQUIRED: Your ISO file URL
  ISO_URL: 'https://example.com/windows-10-32bit.iso',
  
  // Optional: Everything else is auto-detected!
  // OS_TYPE: 'windows', // Auto-detected from filename
  // BOOT_ORDER: 'cdrom', // Auto-detected
  // MEMORY_SIZE: 1024, // Auto-detected based on OS
});
```

### All Configuration Options

```javascript
{
  // REQUIRED
  ISO_URL: 'https://example.com/os.iso',
  
  // Optional - Auto-detected if not specified
  OS_TYPE: 'windows' | 'linux' | 'android' | 'dos' | 'other' | null,
  BOOT_ORDER: 'cdrom' | 'hda' | null,
  
  // Optional - Performance
  MEMORY_SIZE: 768, // MB (auto-detected based on OS)
  VGA_MEMORY_SIZE: 8, // MB (auto-detected)
  ADAPTIVE_PERFORMANCE: true,
  
  // Optional - UI
  CONTAINER_ID: 'emulator-container',
  SHOW_LOADING_SCREEN: true,
  LOADING_BACKGROUND: 'https://example.com/bg.png',
  LOADING_LOGO: 'https://example.com/logo.png',
  
  // Optional - Features
  ENABLE_NETWORK: false,
  NETWORK_RELAY_URL: null,
  ENABLE_SOUND: false,
  
  // Optional - Callbacks
  onReady: (emulator) => console.log('Ready!', emulator),
  onBootComplete: (emulator) => console.log('Booted!', emulator),
  onError: (error) => console.error('Error:', error),
  onProgress: (percent, message) => console.log(`${percent}%: ${message}`)
}
```

## 🎯 Supported Operating Systems

Works with **any 32-bit (x86) OS** that has an ISO file:

- ✅ **Windows** (10, 7, XP, etc.) - 32-bit only
- ✅ **Linux** (Ubuntu, Debian, Arch, etc.) - 32-bit
- ✅ **Android** - 32-bit x86 builds
- ✅ **DOS** (MS-DOS, FreeDOS, etc.)
- ✅ **Any other 32-bit OS**

**Note:** v86.js only supports 32-bit (x86) architectures. 64-bit (x64) ISOs will not work.

## 🔍 Auto-Detection

The package automatically detects:

- **OS Type** - From ISO filename/URL (windows, linux, android, etc.)
- **Boot Order** - CD-ROM for ISOs, HDA for disk images
- **Memory Settings** - Optimal memory based on OS type
- **VGA Settings** - Optimal graphics memory
- **CPU Settings** - Compatible CPUID level

## 📦 Examples

### Windows 10

```javascript
import { init } from 'windo';

init({
  ISO_URL: 'https://github.com/xazalea/windo/releases/download/v1.1/wind0.iso'
});
```

### Linux (Ubuntu)

```javascript
import { init } from 'windo';

init({
  ISO_URL: 'https://example.com/ubuntu-32bit.iso'
});
```

### Android

```javascript
import { init } from 'windo';

init({
  ISO_URL: 'https://example.com/android-x86.iso'
});
```

### With Custom Loading Screen

```javascript
import { init } from 'windo';

init({
  ISO_URL: 'https://example.com/os.iso',
  LOADING_BACKGROUND: 'https://example.com/loading-bg.png',
  LOADING_LOGO: 'https://example.com/logo.png',
  onBootComplete: (emulator) => {
    console.log('OS is ready!');
  }
});
```

## 🎮 API

### `init(config)`

Initialize the emulator with your configuration.

```javascript
const emulator = await init({ ISO_URL: '...' });
```

### `getInstance()`

Get the current emulator instance.

```javascript
import { getInstance } from 'windo';
const emulator = getInstance();
```

### `destroy()`

Destroy the emulator instance.

```javascript
import { destroy } from 'windo';
destroy();
```

### Emulator Methods

```javascript
const emulator = await init({ ISO_URL: '...' });

// Send keyboard input
emulator.sendKeyboard('Hello World\n');

// Send a key
emulator.sendKey(13); // Enter key

// Get v86 instance for advanced usage
const v86 = emulator.getInstance();
```

## 🛠️ Advanced Usage

### Custom Container

```javascript
init({
  ISO_URL: '...',
  CONTAINER_ID: 'my-custom-container'
});
```

### With Network

```javascript
init({
  ISO_URL: '...',
  ENABLE_NETWORK: true,
  NETWORK_RELAY_URL: 'wss://example.com/relay'
});
```

### With Sound

```javascript
init({
  ISO_URL: '...',
  ENABLE_SOUND: true
});
```

## 📋 Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- v86.js library (included via CDN or npm)
- 32-bit (x86) ISO file
- Stable internet connection (for downloading ISO)

## 🐛 Troubleshooting

### "v86.js library not found"

Make sure you include v86.js before using the package:

```html
<script src="https://unpkg.com/v86@latest/build/libv86.js"></script>
```

### "64-bit application couldn't load"

v86.js only supports 32-bit (x86) operating systems. You need a 32-bit ISO file, not 64-bit.

### ISO not loading

- Check that the ISO URL is accessible (no CORS issues)
- Verify the ISO is 32-bit (x86), not 64-bit (x64)
- Check browser console for errors

## 📄 License

MIT

## 🙏 Credits

Built on top of [v86.js](https://github.com/copy/v86) by Fabian Hemmer.

