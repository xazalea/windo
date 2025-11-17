// Easy Emulator Configuration
// Just change the ISO_URL to your 32-bit OS image and everything else is automatic!

const config = {
  // ============================================
  // REQUIRED: Change this to your ISO file URL
  // ============================================
  ISO_URL: 'https://github.com/xazalea/windo/releases/download/v1.1/wind0.iso',
  
  // Optional: Override OS type (auto-detected if not specified)
  // Options: 'windows', 'linux', 'android', 'other'
  OS_TYPE: null, // null = auto-detect
  
  // Optional: Override boot order (auto-detected if not specified)
  // Options: 'cdrom' (boot from CD/ISO) or 'hda' (boot from hard disk)
  BOOT_ORDER: null, // null = auto-detect (usually 'cdrom' for ISO files)
  
  // Optional: Memory size in MB (default: 768MB for fast boot, adaptive system will increase)
  MEMORY_SIZE: 768,
  
  // Optional: VGA memory size in MB (default: 8MB)
  VGA_MEMORY_SIZE: 8,
  
  // Optional: Enable adaptive performance (automatically adjusts based on workload)
  ADAPTIVE_PERFORMANCE: true,
  
  // Optional: Container element ID (default: 'emulator-container')
  CONTAINER_ID: 'emulator-container',
  
  // Optional: Show loading screen with logo
  SHOW_LOADING_SCREEN: true,
  LOADING_BACKGROUND: null, // URL to background image (optional)
  LOADING_LOGO: null, // URL to logo image (optional)
  
  // Optional: Enable network (requires WebSocket relay)
  ENABLE_NETWORK: false,
  NETWORK_RELAY_URL: null,
  
  // Optional: Enable sound
  ENABLE_SOUND: false,
  
  // Optional: Custom CSS for styling
  CUSTOM_CSS: null,
  
  // Optional: Callbacks
  onReady: null, // Called when emulator is ready
  onBootComplete: null, // Called when OS finishes booting
  onError: null, // Called on errors
  onProgress: null // Called with progress updates (percent, message)
};

// OS Auto-Detection System
// Automatically detects OS type and optimal settings from ISO filename/URL

class OSDetector {
  static detectFromURL(url) {
    if (!url) return null;
    
    const urlLower = url.toLowerCase();
    const filename = urlLower.split('/').pop() || '';
    
    // Windows detection
    if (filename.includes('windows') || 
        filename.includes('win') || 
        filename.includes('win10') ||
        filename.includes('win11') ||
        filename.includes('win7') ||
        filename.includes('win8') ||
        filename.includes('nt') ||
        urlLower.includes('windows')) {
      return {
        type: 'windows',
        bootOrder: 'cdrom',
        recommendedMemory: 1024,
        recommendedVGA: 16,
        fastboot: true,
        cpuidLevel: 2
      };
    }
    
    // Linux detection
    if (filename.includes('linux') || 
        filename.includes('ubuntu') ||
        filename.includes('debian') ||
        filename.includes('fedora') ||
        filename.includes('arch') ||
        filename.includes('centos') ||
        filename.includes('alpine') ||
        urlLower.includes('linux')) {
      return {
        type: 'linux',
        bootOrder: 'cdrom',
        recommendedMemory: 512,
        recommendedVGA: 8,
        fastboot: true,
        cpuidLevel: 1
      };
    }
    
    // Android detection
    if (filename.includes('android') || 
        filename.includes('aosp') ||
        urlLower.includes('android')) {
      return {
        type: 'android',
        bootOrder: 'cdrom',
        recommendedMemory: 1024,
        recommendedVGA: 16,
        fastboot: true,
        cpuidLevel: 1
      };
    }
    
    // DOS detection
    if (filename.includes('dos') || 
        filename.includes('msdos') ||
        urlLower.includes('dos')) {
      return {
        type: 'dos',
        bootOrder: 'hda',
        recommendedMemory: 64,
        recommendedVGA: 4,
        fastboot: true,
        cpuidLevel: 0
      };
    }
    
    // Default: Generic OS
    return {
      type: 'other',
      bootOrder: 'cdrom',
      recommendedMemory: 512,
      recommendedVGA: 8,
      fastboot: true,
      cpuidLevel: 1
    };
  }
  
  static detectFromConfig(config) {
    // If OS_TYPE is explicitly set, use it
    if (config.OS_TYPE) {
      const osInfo = this.getOSInfo(config.OS_TYPE);
      return {
        ...osInfo,
        bootOrder: config.BOOT_ORDER || osInfo.bootOrder
      };
    }
    
    // Otherwise, auto-detect from ISO URL
    return this.detectFromURL(config.ISO_URL);
  }
  
  static getOSInfo(osType) {
    const osTypes = {
      windows: {
        type: 'windows',
        bootOrder: 'cdrom',
        recommendedMemory: 1024,
        recommendedVGA: 16,
        fastboot: true,
        cpuidLevel: 2
      },
      linux: {
        type: 'linux',
        bootOrder: 'cdrom',
        recommendedMemory: 512,
        recommendedVGA: 8,
        fastboot: true,
        cpuidLevel: 1
      },
      android: {
        type: 'android',
        bootOrder: 'cdrom',
        recommendedMemory: 1024,
        recommendedVGA: 16,
        fastboot: true,
        cpuidLevel: 1
      },
      dos: {
        type: 'dos',
        bootOrder: 'hda',
        recommendedMemory: 64,
        recommendedVGA: 4,
        fastboot: true,
        cpuidLevel: 0
      },
      other: {
        type: 'other',
        bootOrder: 'cdrom',
        recommendedMemory: 512,
        recommendedVGA: 8,
        fastboot: true,
        cpuidLevel: 1
      }
    };
    
    return osTypes[osType] || osTypes.other;
  }
}

// Easy Emulator Core - Handles all the complexity automatically

class EasyEmulator {
  constructor(config) {
    this.config = config;
    this.v86Instance = null;
    this.container = null;
    this.isInitialized = false;
    this.bootComplete = false;
  }
  
  async init() {
    try {
      // Wait for v86.js to be available
      await this.waitForV86();
      
      // Create container if it doesn't exist
      this.createContainer();
      
      // Load the ISO
      await this.loadISO();
      
      // Initialize v86 emulator
      this.initV86();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      // Call onReady callback
      if (this.config.onReady) {
        this.config.onReady(this);
      }
      
      return this;
    } catch (error) {
      console.error('Easy Emulator initialization error:', error);
      if (this.config.onError) {
        this.config.onError(error);
      }
      throw error;
    }
  }
  
  async waitForV86() {
    return new Promise((resolve, reject) => {
      // Check if V86 is already available
      if (typeof V86 !== 'undefined' || typeof V86Starter !== 'undefined') {
        resolve();
        return;
      }
      
      // Wait for it to load
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds
      const checkInterval = setInterval(() => {
        if (typeof V86 !== 'undefined' || typeof V86Starter !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts++ >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('v86.js library not found. Please include v86.js in your page.'));
        }
      }, 100);
    });
  }
  
  createContainer() {
    let container = document.getElementById(this.config.CONTAINER_ID);
    
    if (!container) {
      // Create container automatically
      container = document.createElement('div');
      container.id = this.config.CONTAINER_ID;
      container.style.cssText = `
        width: 100%;
        height: 100vh;
        position: relative;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      document.body.appendChild(container);
    }
    
    this.container = container;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'emulator-screen';
    canvas.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      image-rendering: pixelated;
      cursor: none;
    `;
    container.appendChild(canvas);
    
    // Create loading overlay if enabled
    if (this.config.SHOW_LOADING_SCREEN) {
      this.createLoadingScreen();
    }
  }
  
  createLoadingScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'easy-emulator-loading';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      flex-direction: column;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Add background image if provided
    if (this.config.LOADING_BACKGROUND) {
      overlay.style.backgroundImage = `url('${this.config.LOADING_BACKGROUND}')`;
      overlay.style.backgroundSize = 'cover';
      overlay.style.backgroundPosition = 'center';
      overlay.style.backgroundRepeat = 'no-repeat';
      const darkOverlay = document.createElement('div');
      darkOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.5);
      `;
      overlay.appendChild(darkOverlay);
    }
    
    // Add logo if provided
    if (this.config.LOADING_LOGO) {
      const logo = document.createElement('img');
      logo.src = this.config.LOADING_LOGO;
      logo.style.cssText = `
        width: 120px;
        height: 120px;
        margin-bottom: 2rem;
        opacity: 0.9;
      `;
      overlay.appendChild(logo);
    }
    
    // Add spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 2rem;
    `;
    overlay.appendChild(spinner);
    
    // Add CSS for spinner animation
    if (!document.getElementById('easy-emulator-styles')) {
      const style = document.createElement('style');
      style.id = 'easy-emulator-styles';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add loading text
    const text = document.createElement('div');
    text.id = 'easy-emulator-loading-text';
    text.textContent = 'Loading...';
    text.style.cssText = `
      font-size: 1.2rem;
      margin-top: 1rem;
    `;
    overlay.appendChild(text);
    
    // Add progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 300px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      margin-top: 1rem;
      overflow: hidden;
    `;
    const progressBar = document.createElement('div');
    progressBar.id = 'easy-emulator-progress';
    progressBar.style.cssText = `
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width 0.3s ease;
    `;
    progressContainer.appendChild(progressBar);
    overlay.appendChild(progressContainer);
    
    this.container.appendChild(overlay);
    this.loadingOverlay = overlay;
    this.progressBar = progressBar;
    this.loadingText = text;
  }
  
  updateLoadingProgress(percent, message) {
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.loadingText && message) {
      this.loadingText.textContent = message;
    }
    if (this.config.onProgress) {
      this.config.onProgress(percent, message);
    }
  }
  
  hideLoadingScreen() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.opacity = '0';
      this.loadingOverlay.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (this.loadingOverlay && this.loadingOverlay.parentNode) {
          this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
        }
      }, 500);
    }
  }
  
  async loadISO() {
    this.updateLoadingProgress(10, 'Preparing ISO...');
    
    // The ISO URL is already in config.ISO_URL
    // We'll configure it when initializing v86
  }
  
  initV86() {
    this.updateLoadingProgress(30, 'Initializing emulator...');
    
    const canvas = document.getElementById('emulator-screen');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Build v86 configuration
    const v86Config = {
      memory_size: this.config.MEMORY_SIZE * 1024 * 1024,
      vga_memory_size: this.config.VGA_MEMORY_SIZE * 1024 * 1024,
      screen_container: this.container,
      wasm_path: "https://unpkg.com/v86@latest/build/v86.wasm",
      bios: {
        url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/seabios.bin"
      },
      vga_bios: {
        url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/vgabios.bin"
      },
      autostart: true,
      disable_keyboard: false,
      disable_mouse: false,
      disable_speaker: !this.config.ENABLE_SOUND,
      acpi: true,
      apic: true,
      fastboot: this.config.fastboot !== false,
      disable_jit: false,
      cpu_count: 1,
      cpuid_level: this.config.cpuidLevel || 1,
      network_relay_url: this.config.ENABLE_NETWORK ? this.config.NETWORK_RELAY_URL : null,
      screen: {
        use_graphical_text: false,
        scale: 1
      }
    };
    
    // Configure boot device
    if (this.config.BOOT_ORDER === 'cdrom' || !this.config.BOOT_ORDER) {
      v86Config.cdrom = {
        url: this.config.ISO_URL,
        async: true
      };
      v86Config.boot_order = 0x213; // CD, C, A
    } else {
      v86Config.hda = {
        url: this.config.ISO_URL,
        async: true
      };
      v86Config.boot_order = 0x123; // C, A, CD
    }
    
    this.updateLoadingProgress(50, 'Starting emulator...');
    
    // Create v86 instance
    if (typeof V86 !== 'undefined') {
      this.v86Instance = new V86(v86Config);
    } else if (typeof V86Starter !== 'undefined') {
      this.v86Instance = new V86Starter(v86Config);
    } else {
      throw new Error('V86 or V86Starter not found');
    }
  }
  
  setupEventListeners() {
    if (!this.v86Instance) return;
    
    // Listen for emulator ready
    this.v86Instance.add_listener("emulator-ready", () => {
      this.updateLoadingProgress(70, 'Emulator ready, booting OS...');
    });
    
    // Listen for screen updates to detect boot
    let screenUpdateCount = 0;
    this.v86Instance.add_listener("screen-update", () => {
      screenUpdateCount++;
      
      // Hide loading after we see activity
      if (screenUpdateCount > 100 && !this.bootComplete) {
        setTimeout(() => {
          this.hideLoadingScreen();
          this.bootComplete = true;
          if (this.config.onBootComplete) {
            this.config.onBootComplete(this);
          }
        }, 2000);
      }
    });
    
    // Listen for errors
    this.v86Instance.add_listener("emulator-error", (error) => {
      console.error('Emulator error:', error);
      if (this.config.onError) {
        this.config.onError(error);
      }
    });
    
    // Listen for download progress
    this.v86Instance.add_listener("download-progress", (progress) => {
      if (progress && progress.loaded && progress.total) {
        const percent = Math.min(90, 30 + (progress.loaded / progress.total) * 40);
        this.updateLoadingProgress(percent, `Downloading ${progress.file_name || 'files'}...`);
      }
    });
  }
  
  destroy() {
    if (this.v86Instance && this.v86Instance.destroy) {
      this.v86Instance.destroy();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isInitialized = false;
  }
  
  // Public API methods
  getInstance() {
    return this.v86Instance;
  }
  
  sendKeyboard(text) {
    if (this.v86Instance && this.v86Instance.keyboard_send_text) {
      this.v86Instance.keyboard_send_text(text);
    }
  }
  
  sendKey(key) {
    if (this.v86Instance && this.v86Instance.keyboard_send_key) {
      this.v86Instance.keyboard_send_key(key);
    }
  }
}

// Easy Emulator - Main Entry Point
// Just import and call init() with your config!


let emulatorInstance = null;

/**
 * Initialize the emulator with your configuration
 * @param {Object} userConfig - Your configuration (just ISO_URL is required)
 * @returns {Promise<EasyEmulator>} The emulator instance
 */
async function init(userConfig = {}) {
  // Merge user config with defaults
  const finalConfig = {
    ...config,
    ...userConfig
  };
  
  // Validate required config
  if (!finalConfig.ISO_URL) {
    throw new Error('ISO_URL is required in config. Please set it in config.js or pass it to init().');
  }
  
  // Auto-detect OS settings
  const osInfo = OSDetector.detectFromConfig(finalConfig);
  console.log(`🔍 Auto-detected OS: ${osInfo.type}`, osInfo);
  
  // Merge OS-specific settings
  const emulatorConfig = {
    ...finalConfig,
    OS_TYPE: finalConfig.OS_TYPE || osInfo.type,
    BOOT_ORDER: finalConfig.BOOT_ORDER || osInfo.bootOrder,
    MEMORY_SIZE: finalConfig.MEMORY_SIZE || osInfo.recommendedMemory,
    VGA_MEMORY_SIZE: finalConfig.VGA_MEMORY_SIZE || osInfo.recommendedVGA,
    fastboot: osInfo.fastboot,
    cpuidLevel: osInfo.cpuidLevel
  };
  
  // Create emulator instance
  emulatorInstance = new EasyEmulator(emulatorConfig);
  
  // Initialize and return
  await emulatorInstance.init();
  
  return emulatorInstance;
}

/**
 * Get the current emulator instance
 * @returns {EasyEmulator|null}
 */
function getInstance() {
  return emulatorInstance;
}

/**
 * Destroy the emulator instance
 */
function destroy() {
  if (emulatorInstance) {
    emulatorInstance.destroy();
    emulatorInstance = null;
  }
}

// Default export
var index = {
  init,
  getInstance,
  destroy
};

export { EasyEmulator, OSDetector, config, index as default, destroy, getInstance, init };
