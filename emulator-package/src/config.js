// Easy Emulator Configuration
// Just change the ISO_URL to your 32-bit OS image and everything else is automatic!

export const config = {
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

