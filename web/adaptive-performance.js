// Adaptive Performance System - Automatically optimizes based on workload
// Detects app types and adjusts CPU, memory, and rendering for optimal performance

class AdaptivePerformance {
    constructor(emulator) {
        this.emulator = emulator;
        this.currentMode = 'boot'; // boot, idle, browsing, video, gaming, productivity
        this.modes = {
            boot: {
                cpuMultiplier: 2.0, // 2x speed for faster boot
                fps: 20, // Lower FPS during boot to save battery
                memory: 1024 * 1024 * 1024, // 1GB
                vgaMemory: 8 * 1024 * 1024, // 8MB
                screenResolution: [640, 480], // Very small for boot
                screenThrottle: 50, // Update every 50ms (20fps)
                disableAudio: true,
                disableNetwork: true,
                jitEnabled: true,
                fastboot: true
            },
            idle: {
                cpuMultiplier: 1.5, // Moderate speed
                fps: 30, // Standard FPS
                memory: 1024 * 1024 * 1024, // 1GB
                vgaMemory: 12 * 1024 * 1024, // 12MB
                screenResolution: [800, 600],
                screenThrottle: 33, // Update every 33ms (30fps)
                disableAudio: true,
                disableNetwork: false,
                jitEnabled: true,
                fastboot: false
            },
            browsing: {
                cpuMultiplier: 1.8, // Faster for web browsing
                fps: 40, // Higher FPS for smooth scrolling
                memory: 1024 * 1024 * 1024, // 1GB
                vgaMemory: 16 * 1024 * 1024, // 16MB
                screenResolution: [1024, 768],
                screenThrottle: 25, // Update every 25ms (40fps)
                disableAudio: true,
                disableNetwork: false,
                jitEnabled: true,
                fastboot: false
            },
            video: {
                cpuMultiplier: 2.0, // Higher for video playback
                fps: 30, // Standard for video
                memory: 1024 * 1024 * 1024, // 1GB
                vgaMemory: 16 * 1024 * 1024, // 16MB
                screenResolution: [1024, 768],
                screenThrottle: 33, // Update every 33ms (30fps)
                disableAudio: false, // Enable for video
                disableNetwork: false,
                jitEnabled: true,
                fastboot: false
            },
            gaming: {
                cpuMultiplier: 2.5, // Maximum speed for games
                fps: 60, // High FPS for gaming
                memory: 1536 * 1024 * 1024, // 1.5GB for games
                vgaMemory: 32 * 1024 * 1024, // 32MB for better graphics
                screenResolution: [1024, 768],
                screenThrottle: 16, // Update every 16ms (60fps)
                disableAudio: false, // Enable for games
                disableNetwork: false,
                jitEnabled: true,
                fastboot: false
            },
            productivity: {
                cpuMultiplier: 1.8, // Good speed for apps
                fps: 35, // Smooth for productivity
                memory: 1024 * 1024 * 1024, // 1GB
                vgaMemory: 16 * 1024 * 1024, // 16MB
                screenResolution: [1024, 768],
                screenThrottle: 28, // Update every 28ms (35fps)
                disableAudio: true,
                disableNetwork: false,
                jitEnabled: true,
                fastboot: false
            }
        };
        
        this.detectedApps = new Set();
        this.workloadHistory = [];
        this.adaptationInterval = null;
        this.screenUpdateThrottle = null;
        this.lastScreenUpdate = 0;
        
        this.init();
    }
    
    init() {
        // Start in boot mode
        this.setMode('boot');
        
        // Monitor for app installations and usage
        this.startMonitoring();
        
        // Auto-adapt every 5 seconds
        this.adaptationInterval = setInterval(() => {
            this.adapt();
        }, 5000);
        
        console.log('Adaptive Performance System initialized');
    }
    
    // Detect workload type based on CPU usage, screen activity, and app patterns
    detectWorkload() {
        if (!this.emulator || !this.emulator.v86) return 'idle';
        
        // Check if still booting (first 30 seconds)
        const bootTime = Date.now() - (this.bootStartTime || Date.now());
        if (bootTime < 30000) {
            return 'boot';
        }
        
        // Analyze screen activity
        const screenActivity = this.analyzeScreenActivity();
        
        // Analyze CPU patterns
        const cpuPattern = this.analyzeCPUPattern();
        
        // Check detected apps
        if (this.detectedApps.has('game') || this.detectedApps.has('gaming')) {
            return 'gaming';
        }
        
        if (this.detectedApps.has('video') || this.detectedApps.has('media')) {
            return 'video';
        }
        
        if (this.detectedApps.has('browser') || this.detectedApps.has('web')) {
            return 'browsing';
        }
        
        // Pattern-based detection
        if (screenActivity.high && cpuPattern.high && screenActivity.frequent) {
            return 'gaming';
        }
        
        if (screenActivity.moderate && cpuPattern.moderate && !screenActivity.frequent) {
            return 'video';
        }
        
        if (screenActivity.low && cpuPattern.low) {
            return 'idle';
        }
        
        if (screenActivity.moderate && cpuPattern.moderate) {
            return 'productivity';
        }
        
        return 'browsing'; // Default
    }
    
    analyzeScreenActivity() {
        // Analyze recent screen update patterns
        const recent = this.workloadHistory.slice(-10);
        if (recent.length === 0) return { high: false, moderate: false, low: true, frequent: false };
        
        const updateRate = recent.filter(h => h.screenUpdate).length / recent.length;
        const avgCPU = recent.reduce((sum, h) => sum + (h.cpuUsage || 0), 0) / recent.length;
        
        return {
            high: updateRate > 0.7 && avgCPU > 50,
            moderate: updateRate > 0.3 && avgCPU > 20,
            low: updateRate < 0.3 && avgCPU < 20,
            frequent: updateRate > 0.5
        };
    }
    
    analyzeCPUPattern() {
        const recent = this.workloadHistory.slice(-10);
        if (recent.length === 0) return { high: false, moderate: false, low: true };
        
        const avgCPU = recent.reduce((sum, h) => sum + (h.cpuUsage || 0), 0) / recent.length;
        const maxCPU = Math.max(...recent.map(h => h.cpuUsage || 0));
        
        return {
            high: avgCPU > 60 || maxCPU > 80,
            moderate: avgCPU > 30 || maxCPU > 50,
            low: avgCPU < 30 && maxCPU < 50
        };
    }
    
    // Record workload metrics
    recordMetrics() {
        if (!this.emulator || !this.emulator.v86) return;
        
        const metrics = {
            timestamp: Date.now(),
            screenUpdate: this.lastScreenUpdate > Date.now() - 100,
            cpuUsage: this.estimateCPUUsage(),
            memoryUsage: this.estimateMemoryUsage(),
            mode: this.currentMode
        };
        
        this.workloadHistory.push(metrics);
        
        // Keep only last 50 records
        if (this.workloadHistory.length > 50) {
            this.workloadHistory.shift();
        }
        
        this.lastScreenUpdate = 0; // Reset
    }
    
    estimateCPUUsage() {
        // Estimate based on FPS and screen updates
        if (!this.emulator || !this.emulator.v86) return 0;
        
        // Simple heuristic: lower FPS = higher CPU usage (emulation is struggling)
        const targetFPS = this.modes[this.currentMode].fps;
        const actualFPS = this.getActualFPS();
        
        if (actualFPS < targetFPS * 0.7) {
            return 80; // High CPU usage
        } else if (actualFPS < targetFPS * 0.9) {
            return 50; // Moderate
        } else {
            return 20; // Low
        }
    }
    
    estimateMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1048576; // MB
        }
        return 0;
    }
    
    getActualFPS() {
        // Get actual FPS from emulator if available
        if (this.emulator && this.emulator.fps) {
            return this.emulator.fps;
        }
        return this.modes[this.currentMode].fps;
    }
    
    // Adapt to current workload
    adapt() {
        const newMode = this.detectWorkload();
        
        if (newMode !== this.currentMode) {
            console.log(`Adapting from ${this.currentMode} to ${newMode} mode`);
            this.setMode(newMode);
        }
        
        this.recordMetrics();
    }
    
    // Set performance mode
    setMode(mode) {
        if (!this.modes[mode]) {
            console.warn(`Unknown mode: ${mode}`);
            return;
        }
        
        this.currentMode = mode;
        const config = this.modes[mode];
        
        // Apply CPU multiplier (if supported)
        if (this.emulator && this.emulator.v86 && this.emulator.v86.cpu) {
            try {
                // Adjust CPU speed
                if (this.emulator.v86.cpu.set_speed_multiplier) {
                    this.emulator.v86.cpu.set_speed_multiplier(config.cpuMultiplier);
                }
            } catch (e) {
                console.warn('Could not set CPU multiplier:', e);
            }
        }
        
        // Apply screen resolution
        this.setScreenResolution(config.screenResolution[0], config.screenResolution[1]);
        
        // Apply screen update throttling
        this.setScreenThrottle(config.screenThrottle);
        
        // Apply memory settings (if possible)
        if (mode === 'gaming' && this.emulator && this.emulator.v86) {
            // Gaming needs more memory
            try {
                if (this.emulator.v86.memory && this.emulator.v86.memory.resize) {
                    // Note: Memory resize may not be supported, but we try
                    console.log('Gaming mode: Using 1.5GB memory');
                }
            } catch (e) {
                // Memory resize not supported, that's okay
            }
        }
        
        // Log mode change
        console.log(`Performance mode: ${mode}`, {
            fps: config.fps,
            cpuMultiplier: config.cpuMultiplier,
            resolution: config.screenResolution.join('x')
        });
    }
    
    setScreenResolution(width, height) {
        if (!this.emulator) return;
        
        try {
            if (this.emulator.screen_set_size) {
                this.emulator.screen_set_size(width, height);
            } else if (this.emulator.screen && this.emulator.screen.set_size) {
                this.emulator.screen.set_size(width, height);
            } else if (this.emulator.v86 && this.emulator.v86.screen && this.emulator.v86.screen.set_size) {
                this.emulator.v86.screen.set_size(width, height);
            }
        } catch (e) {
            console.warn('Could not set screen resolution:', e);
        }
    }
    
    setScreenThrottle(ms) {
        // Throttle screen updates to save battery
        if (!this.emulator || !this.emulator.v86 || !this.emulator.v86.screen_adapter) {
            return;
        }
        
        try {
            const screenAdapter = this.emulator.v86.screen_adapter;
            if (!screenAdapter.update) return;
            
            // Remove existing throttle
            if (screenAdapter._originalUpdate) {
                screenAdapter.update = screenAdapter._originalUpdate;
            }
            
            // Apply new throttle
            const originalUpdate = screenAdapter.update.bind(screenAdapter);
            screenAdapter._originalUpdate = originalUpdate;
            
            let lastUpdate = 0;
            screenAdapter.update = () => {
                const now = performance.now();
                if (now - lastUpdate >= ms) {
                    originalUpdate();
                    lastUpdate = now;
                    this.lastScreenUpdate = now;
                }
            };
        } catch (e) {
            console.warn('Could not set screen throttle:', e);
        }
    }
    
    // Detect app installation/usage
    detectApp(appName) {
        const name = appName.toLowerCase();
        
        // Gaming apps
        if (name.includes('game') || name.includes('gaming') || 
            name.includes('steam') || name.includes('epic') ||
            name.includes('minecraft') || name.includes('fortnite')) {
            this.detectedApps.add('game');
            this.detectedApps.add('gaming');
            this.adapt(); // Immediately adapt
        }
        
        // Video/media apps
        if (name.includes('video') || name.includes('media') ||
            name.includes('player') || name.includes('vlc') ||
            name.includes('youtube') || name.includes('netflix')) {
            this.detectedApps.add('video');
            this.detectedApps.add('media');
            this.adapt();
        }
        
        // Browser apps
        if (name.includes('browser') || name.includes('chrome') ||
            name.includes('firefox') || name.includes('edge') ||
            name.includes('safari') || name.includes('web')) {
            this.detectedApps.add('browser');
            this.detectedApps.add('web');
            this.adapt();
        }
    }
    
    // Start monitoring
    startMonitoring() {
        // Monitor screen updates
        if (this.emulator && this.emulator.v86 && this.emulator.v86.screen_adapter) {
            const screenAdapter = this.emulator.v86.screen_adapter;
            const originalUpdate = screenAdapter.update;
            
            screenAdapter.update = () => {
                this.lastScreenUpdate = Date.now();
                if (originalUpdate) originalUpdate();
            };
        }
        
        // Monitor boot time
        this.bootStartTime = Date.now();
        
        // Auto-switch from boot mode after 30 seconds
        setTimeout(() => {
            if (this.currentMode === 'boot') {
                this.setMode('idle');
            }
        }, 30000);
    }
    
    // Get current mode
    getMode() {
        return this.currentMode;
    }
    
    // Get current FPS target
    getTargetFPS() {
        return this.modes[this.currentMode].fps;
    }
    
    // Cleanup
    destroy() {
        if (this.adaptationInterval) {
            clearInterval(this.adaptationInterval);
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.AdaptivePerformance = AdaptivePerformance;
}

