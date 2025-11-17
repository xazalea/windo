// OS Auto-Detection System
// Automatically detects OS type and optimal settings from ISO filename/URL

export class OSDetector {
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

