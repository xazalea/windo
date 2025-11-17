// Easy Emulator - Main Entry Point
// Just import and call init() with your config!

import { config } from './config.js';
import { OSDetector } from './os-detector.js';
import { EasyEmulator } from './emulator-core.js';

let emulatorInstance = null;

/**
 * Initialize the emulator with your configuration
 * @param {Object} userConfig - Your configuration (just ISO_URL is required)
 * @returns {Promise<EasyEmulator>} The emulator instance
 */
export async function init(userConfig = {}) {
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
export function getInstance() {
  return emulatorInstance;
}

/**
 * Destroy the emulator instance
 */
export function destroy() {
  if (emulatorInstance) {
    emulatorInstance.destroy();
    emulatorInstance = null;
  }
}

// Export for advanced usage
export { EasyEmulator } from './emulator-core.js';
export { OSDetector } from './os-detector.js';
export { config } from './config.js';

// Default export
export default {
  init,
  getInstance,
  destroy
};

