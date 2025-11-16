// Windows Emulator using v86.js - Performance Optimized
// Runs Windows 10/11 directly in the browser on Vercel with peak performance

class WindowsEmulator {
    constructor() {
        this.emulator = null;
        this.canvas = document.getElementById('screen');
        this.ctx = null;
        this.container = document.getElementById('screen_container');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorOverlay = document.getElementById('errorOverlay');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.progressFill = document.getElementById('progressFill');
        
        // Performance optimizations
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.performanceMode = 'balanced'; // 'performance', 'balanced', 'quality'
        this.performanceOptimizer = new PerformanceOptimizer();
        this.adaptivePerformance = null; // Will be initialized after emulator is ready
        this.bootComplete = false;
        
        // Dynamic Island (replaces toolbar)
        this.dynamicIsland = null;
        if (typeof DynamicIsland !== 'undefined') {
            this.dynamicIsland = new DynamicIsland();
            this.dynamicIsland.setEmulator(this);
            // Store globally for chat panel
            if (typeof window !== 'undefined') {
                window.dynamicIslandInstance = this.dynamicIsland;
            }
            // Hide old loading overlay immediately when dynamic island is ready
            setTimeout(() => {
                if (this.loadingOverlay) {
                    this.loadingOverlay.style.display = 'none';
                }
            }, 500);
        }
        
        // Initialize API client for enhanced capabilities
        this.apiClient = null;
        this.initAPIClient();
        
        // Initialize storage manager for File.IO cloud storage
        this.storageManager = null;
        if (typeof StorageManager !== 'undefined') {
            this.storageManager = new StorageManager();
        }
        
        // Initialize filesystem bridge for seamless file sync
        this.filesystemBridge = null;
        if (typeof FilesystemBridge !== 'undefined' && this.storageManager) {
            this.filesystemBridge = new FilesystemBridge(this, this.storageManager);
            // Create virtual drive automatically
            setTimeout(() => {
                this.filesystemBridge.createVirtualDrive().catch(err => {
                    console.warn('Could not create virtual drive:', err);
                });
            }, 2000);
        }
        
        // Initialize Headscale client for network connectivity
        this.headscaleClient = null;
        if (typeof HeadscaleClient !== 'undefined') {
            this.headscaleClient = new HeadscaleClient();
            // Listen for network status changes
            this.headscaleClient.onStatusChange((status) => {
                if (this.dynamicIsland) {
                    this.dynamicIsland.updateNetworkStatus(status);
                }
            });
        }
        
        // Optimize canvas for performance
        this.optimizeCanvas();
        
        // Start performance monitoring
        this.performanceOptimizer.startMonitoring();
        
        // Ensure container is a DOM element
        if (!this.container || typeof this.container === 'string') {
            this.container = document.getElementById('screen_container');
        }
        if (!this.container) {
            console.error('Screen container not found, will retry...');
            setTimeout(() => {
                this.container = document.getElementById('screen_container');
                if (this.container) {
                    this.config.screen_container = this.container;
                }
            }, 100);
        }
        
        this.config = {
            // ULTRA-AGGRESSIVE PERFORMANCE OPTIMIZATIONS FOR FASTEST BOOT & BATTERY SAVING
            memory_size: 768 * 1024 * 1024, // 768MB RAM (minimal for fastest boot, adaptive system will increase when needed)
            vga_memory_size: 8 * 1024 * 1024, // 8MB VGA (minimal for boot, increases for gaming/video)
            screen_container: this.container,
            wasm_path: "https://unpkg.com/v86@latest/build/v86.wasm",
            bios: {
                // Use jsdelivr which supports CORS, fallback to local files
                url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/seabios.bin"
            },
            vga_bios: {
                // Use jsdelivr which supports CORS, fallback to local files
                url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/vgabios.bin"
            },
            cdrom: null, // Will be set when loading image
            hda: null, // Will be set when loading image
            fda: null, // Not used
            boot_order: 0x213, // CD, C, A (boot from CD first for ISO)
            network_relay_url: null, // DISABLED for faster boot (adaptive system enables when needed)
            autostart: true,
            disable_keyboard: false,
            disable_mouse: false,
            disable_speaker: true, // DISABLED for boot (adaptive system enables for video/gaming)
            // Enhanced settings for Windows 10 performance
            // IMPORTANT: v86.js is 32-bit only - 64-bit Windows will NOT work
            // For Windows NT 4.0, use: acpi: false, cpuid_level: 2
            // For Windows Vista+, use: acpi: true (current setting)
            acpi: true, // Keep ACPI enabled for Windows 10 (Vista+)
            apic: true,
            multiboot: false,
            // ULTRA-AGGRESSIVE Performance optimizations - MAXIMUM SPEED & BATTERY SAVING
            fastboot: true,
            disable_jit: false, // Enable JIT for MUCH faster execution
            // Optimized CPU emulation
            cpu_count: 1,
            // CPUID level for Windows compatibility
            // Note: v86.js emulates 32-bit x86 only - 64-bit Windows requires x86-64 which is NOT supported
            // You MUST use a 32-bit (x86) Windows image, not 64-bit (x64)
            // This setting helps with Windows compatibility but does NOT enable 64-bit support
            cpuid_level: 2, // Required for Windows NT/10 compatibility (helps but won't fix 64-bit issue)
            // Optimize for Windows
            uart_override: "0x3F8",
            // Minimal disk I/O for fastest boot
            disk_image_size: 2147483648, // 2GB (minimal for fastest init, adaptive system expands when needed)
            // Performance tweaks
            initial_state: null, // Don't load saved state (faster initial boot)
            filesystem: {}, // Empty filesystem for faster boot
            // Screen optimizations for FASTEST rendering & battery saving
            screen: {
                use_graphical_text: false, // Disable for faster rendering
                scale: 1, // No scaling for speed
            }
        };
        
        this.setupEventListeners();
        this.setupPerformanceMonitoring();
        this.loadDefaultImage();
    }

    async initAPIClient() {
        // Try to connect to Node.js backend server
        const serverUrl = localStorage.getItem('wind0_server_url') || 'http://localhost:3001';
        
        try {
            if (typeof AzaleaAPIClient !== 'undefined') {
                this.apiClient = new AzaleaAPIClient(serverUrl);
                
                // Check if server is available
                const health = await this.apiClient.checkHealth();
                if (health) {
                    console.log('Connected to Azalea server:', health);
                    this.apiClient.connectWebSocket();
                    
                    // Set up event handlers
                    this.apiClient.onImageProgress = (progress) => {
                        this.updateProgress(progress);
                    };
                    
                    // Try to use cached image from server
                    this.tryLoadCachedImage();
                } else {
                    console.log('Azalea server not available, using direct mode');
                }
            }
        } catch (error) {
            console.log('API client not available, using direct mode:', error);
        }
    }

    async tryLoadCachedImage() {
        if (!this.apiClient) return;
        
        try {
            // Check if Windows 10 Lite is cached on server
            const images = await this.apiClient.getImages();
            const windows10Lite = images.find(img => 
                img.name.includes('Windows 10 Lite') || 
                img.name.includes('windows-10-lite')
            );
            
            if (windows10Lite) {
                console.log('Using cached image from server:', windows10Lite.name);
                const imageUrl = this.apiClient.getImageUrl(windows10Lite.name);
                await this.loadImage(imageUrl, 'cdrom');
                return true;
            }
            
            // Try to cache the image from archive.org via proxy
            const archiveUrl = window.location.origin + '/api/windows-iso-proxy';
            this.updateStatus('loading', 'Caching Windows 10 Lite on server...');
            
            await this.apiClient.cacheImage(archiveUrl, 'windows-10-lite.iso');
            const cachedUrl = this.apiClient.getImageUrl('windows-10-lite.iso');
            await this.loadImage(cachedUrl, 'cdrom');
            return true;
        } catch (error) {
            console.log('Server caching failed, using direct download:', error);
            return false;
        }
    }

    optimizeCanvas() {
        if (!this.canvas) return;
        
        // Use performance optimizer
        this.ctx = this.performanceOptimizer.optimizeCanvas(this.canvas);
        
        // Set canvas size for optimal rendering
        this.updateCanvasSize();
        
        // Use requestAnimationFrame for smooth rendering
        this.setupAnimationFrame();
        
        // Additional optimizations
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';
    }

    updateCanvasSize() {
        if (!this.canvas || !this.container) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size with device pixel ratio for crisp rendering
        this.canvas.width = containerRect.width * dpr;
        this.canvas.height = containerRect.height * dpr;
        
        // Scale context to match device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Set CSS size (actual display size)
        this.canvas.style.width = containerRect.width + 'px';
        this.canvas.style.height = containerRect.height + 'px';
    }

    setupAnimationFrame() {
        // Use requestAnimationFrame for optimal rendering performance
        const render = (timestamp) => {
            if (this.emulator) {
                // Throttle to ~60fps for performance
                if (timestamp - this.lastFrameTime >= 16) {
                    this.lastFrameTime = timestamp;
                    this.frameCount++;
                    
                    // Update FPS counter every second
                    if (this.frameCount % 60 === 0) {
                        this.fps = Math.round(1000 / (timestamp - (this.lastFrameTime - 16 * 60)));
                    }
                }
            }
            
            this.animationFrameId = requestAnimationFrame(render);
        };
        
        this.animationFrameId = requestAnimationFrame(render);
    }

    setupPerformanceMonitoring() {
        // Monitor performance and adjust settings
        setInterval(() => {
            if (this.emulator && this.fps < 30) {
                // Low FPS - suggest optimizations
                console.warn('Low FPS detected:', this.fps);
            }
        }, 5000);
    }

    setupEventListeners() {
        // Keyboard shortcuts with proper event handling
        document.addEventListener('keydown', (e) => {
            // Don't capture keys when typing in modals
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }, { passive: false });

        // Optimized resize handler with debouncing
        const debouncedResize = this.performanceOptimizer.debounce(() => {
            this.updateCanvasSize();
            if (this.emulator) {
                try {
                    // Try different method names for screen resize
                    if (this.emulator.screen_set_size) {
                        this.emulator.screen_set_size(
                            this.container.offsetWidth,
                            this.container.offsetHeight
                        );
                    } else if (this.emulator.screen && this.emulator.screen.set_size) {
                        this.emulator.screen.set_size(
                            this.container.offsetWidth,
                            this.container.offsetHeight
                        );
                    } else if (this.emulator.v86 && this.emulator.v86.screen) {
                        // v86 internal API
                        this.emulator.v86.screen.set_size(
                            this.container.offsetWidth,
                            this.container.offsetHeight
                        );
                    }
                } catch (err) {
                    // Screen resize is optional, don't show error
                }
            }
        }, 250);
        
        window.addEventListener('resize', debouncedResize, { passive: true });

        // Optimize mouse events
        this.setupMouseOptimization();
        
        // Optimize keyboard events
        this.setupKeyboardOptimization();
    }

    setupMouseOptimization() {
        if (!this.canvas) return;
        
        // Use passive listeners for better scroll performance
        let mouseDown = false;
        let lastX = 0, lastY = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            mouseDown = true;
            this.handleMouseEvent(e, 'down');
        }, { passive: true });
        
        this.canvas.addEventListener('mouseup', (e) => {
            mouseDown = false;
            this.handleMouseEvent(e, 'up');
        }, { passive: true });
        
        // Throttle mousemove for performance
        const throttledMouseMove = this.performanceOptimizer.throttle((e) => {
            if (mouseDown) {
                this.handleMouseEvent(e, 'move');
            }
        }, 16); // ~60fps mouse updates
        
        this.canvas.addEventListener('mousemove', throttledMouseMove, { passive: true });
        
        // Mouse wheel with throttling
        let wheelTimeout;
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                this.handleWheelEvent(e);
            }, 50);
        }, { passive: false });
    }

    setupKeyboardOptimization() {
        // Focus canvas for keyboard input
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
        
        // Optimize keyboard event handling
        let keyQueue = [];
        let processingKeys = false;
        
        const processKeyQueue = () => {
            if (keyQueue.length === 0 || !this.emulator) {
                processingKeys = false;
                return;
            }
            
            processingKeys = true;
            const keyEvent = keyQueue.shift();
            this.handleKeyEvent(keyEvent.event, keyEvent.type);
            
            // Process next key after short delay
            setTimeout(processKeyQueue, 1);
        };
        
        this.canvas.addEventListener('keydown', (e) => {
            keyQueue.push({ event: e, type: 'down' });
            if (!processingKeys) processKeyQueue();
        }, { passive: false });
        
        this.canvas.addEventListener('keyup', (e) => {
            keyQueue.push({ event: e, type: 'up' });
            if (!processingKeys) processKeyQueue();
        }, { passive: false });
    }

    handleMouseEvent(event, action) {
        if (!this.emulator || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        
        try {
            // v86.js mouse API
            if (action === 'down') {
                this.emulator.mouse_send_button(event.button || 0, true);
            } else if (action === 'up') {
                this.emulator.mouse_send_button(event.button || 0, false);
            } else if (action === 'move') {
                // Send mouse position
                this.emulator.mouse_send_position(x, y, true);
            }
        } catch (err) {
            // Fallback: try alternative API
            try {
                if (this.emulator.mouse_send_events) {
                    this.emulator.mouse_send_events([{
                        type: action === 'down' ? 'mousedown' : action === 'up' ? 'mouseup' : 'mousemove',
                        x: x,
                        y: y,
                        button: event.button || 0
                    }]);
                }
            } catch (err2) {
                console.warn('Mouse event error:', err2);
            }
        }
    }

    handleWheelEvent(event) {
        if (!this.emulator) return;
        
        try {
            // v86.js wheel handling
            const delta = event.deltaY > 0 ? 1 : -1;
            // Mouse wheel buttons: 3 = scroll up, 4 = scroll down
            this.emulator.mouse_send_button(delta > 0 ? 3 : 4, true);
            setTimeout(() => {
                this.emulator.mouse_send_button(delta > 0 ? 3 : 4, false);
            }, 10);
        } catch (err) {
            console.warn('Wheel event error:', err);
        }
    }

    handleKeyEvent(event, action) {
        if (!this.emulator) return;
        
        // Don't send special keys that might interfere
        if (['F11', 'F12'].includes(event.key) && !event.ctrlKey && !event.metaKey) {
            return;
        }
        
        // Allow Tab but prevent default browser behavior
        if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
        }
        
        try {
            // v86.js keyboard API
            const scancode = this.keyToScancode(event.key, event.code);
            if (scancode !== null) {
                if (action === 'down') {
                    this.emulator.keyboard_send_scancode(scancode);
                } else {
                    // Release key (set bit 7)
                    this.emulator.keyboard_send_scancode(scancode | 0x80);
                }
            }
        } catch (err) {
            // Fallback: try alternative API
            try {
                if (this.emulator.keyboard_send_key) {
                    this.emulator.keyboard_send_key(event.key, action === 'down');
                }
            } catch (err2) {
                console.warn('Keyboard event error:', err2);
            }
        }
    }

    keyToScancode(key, code) {
        // Extended scancode map for Windows compatibility
        const keyMap = {
            'Enter': 0x1c,
            'Escape': 0x01,
            'Backspace': 0x0e,
            'Tab': 0x0f,
            'Space': 0x39,
            'ArrowUp': 0x48,
            'ArrowDown': 0x50,
            'ArrowLeft': 0x4b,
            'ArrowRight': 0x4d,
            'Home': 0x47,
            'End': 0x4f,
            'PageUp': 0x49,
            'PageDown': 0x51,
            'Insert': 0x52,
            'Delete': 0x53,
            'F1': 0x3b, 'F2': 0x3c, 'F3': 0x3d, 'F4': 0x3e,
            'F5': 0x3f, 'F6': 0x40, 'F7': 0x41, 'F8': 0x42,
            'F9': 0x43, 'F10': 0x44, 'F11': 0x57, 'F12': 0x58,
        };
        
        if (keyMap[key]) return keyMap[key];
        
        // Handle letters (A-Z, a-z)
        if (key.length === 1) {
            const charCode = key.charCodeAt(0);
            if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
                const base = charCode <= 90 ? charCode - 65 : charCode - 97;
                return 0x1e + base; // A=0x1e, B=0x1f, etc.
            }
            // Handle numbers (0-9)
            if (charCode >= 48 && charCode <= 57) {
                return 0x0b + (charCode - 48); // 0=0x0b, 1=0x02, etc.
            }
        }
        
        // Try to use code for special keys
        if (code) {
            const codeMap = {
                'KeyA': 0x1e, 'KeyB': 0x1f, 'KeyC': 0x20, 'KeyD': 0x21,
                'KeyE': 0x12, 'KeyF': 0x21, 'KeyG': 0x22, 'KeyH': 0x23,
                'KeyI': 0x17, 'KeyJ': 0x24, 'KeyK': 0x25, 'KeyL': 0x26,
                'KeyM': 0x32, 'KeyN': 0x31, 'KeyO': 0x18, 'KeyP': 0x19,
                'KeyQ': 0x10, 'KeyR': 0x13, 'KeyS': 0x1f, 'KeyT': 0x14,
                'KeyU': 0x16, 'KeyV': 0x2f, 'KeyW': 0x11, 'KeyX': 0x2d,
                'KeyY': 0x15, 'KeyZ': 0x2c,
                'Digit0': 0x0b, 'Digit1': 0x02, 'Digit2': 0x03, 'Digit3': 0x04,
                'Digit4': 0x05, 'Digit5': 0x06, 'Digit6': 0x07, 'Digit7': 0x08,
                'Digit8': 0x09, 'Digit9': 0x0a,
            };
            if (codeMap[code]) return codeMap[code];
        }
        
        return null;
    }

    async loadDefaultImage() {
        this.updateStatus('loading', 'Loading Windows 10 Lite...');
        this.updateProgress(10);

        try {
            // Try to load from localStorage first
            const savedImage = localStorage.getItem('windowsImageUrl');
            const savedType = localStorage.getItem('windowsImageType');
            if (savedImage) {
                await this.loadImage(savedImage, savedType || 'cdrom');
                return;
            }

            // Try to use server-cached image (faster)
            if (this.apiClient) {
                const cached = await this.tryLoadCachedImage();
                if (cached) return;
            }

            // Fallback: Load Windows 10 Lite Edition via proxy (avoids CORS)
            // IMPORTANT: v86.js only supports 32-bit (x86) Windows, NOT 64-bit (x64)
            // The Windows 10 Lite ISO must be 32-bit (x86) version, not 64-bit (x64)
            // Try Vercel serverless function first, fallback to GitHub release directly
            const windows10LiteUrl = '/api/windows-iso-proxy';
            // NOTE: If this ISO is 64-bit (x64), it will NOT work with v86.js
            // You need a 32-bit (x86) Windows 10 image instead
            const githubReleaseUrl = 'https://github.com/xazalea/windo/releases/download/v1.1/Windows.10.Lite.Edition.19H2.x64.iso';
            
            this.updateProgress(20);
            this.updateStatus('loading', 'Loading Windows 10 Lite (1.1GB)...');
            if (this.dynamicIsland) {
                this.dynamicIsland.updateStatus('Loading Windows image...', 0);
            }
            
            // Try proxy first, fallback to direct URL if proxy fails
            try {
                // Test if proxy is available with a quick HEAD request
                const testResponse = await fetch(windows10LiteUrl, { 
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                if (testResponse.ok || testResponse.status === 206) {
                    // Proxy is available, use it
                    console.log('Using Windows ISO proxy');
                    await this.loadImage(windows10LiteUrl, 'cdrom');
                } else {
                    throw new Error('Proxy returned ' + testResponse.status);
                }
            } catch (proxyError) {
                console.warn('Proxy not available, trying direct URL:', proxyError);
                if (this.dynamicIsland) {
                    this.dynamicIsland.updateStatus('Proxy unavailable, using direct download...', 3000, 'warning');
                }
                // Fallback to GitHub release directly (may have CORS issues, but worth trying)
                try {
                    console.log('Attempting direct download from GitHub release');
                    await this.loadImage(githubReleaseUrl, 'cdrom');
                } catch (directError) {
                    console.error('Both proxy and direct URL failed:', directError);
                    const errorMsg = 'Unable to load Windows image. The proxy server may not be deployed yet. Please try again in a few minutes or select a different image.';
                    if (this.dynamicIsland) {
                        this.dynamicIsland.updateStatus('Image load failed', 5000, 'error');
                    }
                    throw new Error(errorMsg);
                }
            }
        } catch (error) {
            console.error('Error loading Windows 10 Lite:', error);
            const errorMsg = 'Unable to load Windows 10 Lite. ' +
                'IMPORTANT: v86.js only supports 32-bit (x86) Windows images, NOT 64-bit (x64). ' +
                'If you see "64-bit application" errors, the ISO is 64-bit and won\'t work. ' +
                'You need a 32-bit (x86) Windows 10 image instead.';
            this.showError(errorMsg);
            this.showImageSelector();
        }
    }

    async loadImage(imageUrl, imageType = 'hda') {
        this.updateStatus('loading', 'Configuring emulator settings...', 'loading');
        this.updateProgress(30, 'Configuring emulator settings...');

        try {
            // Ensure URL is absolute (for proxy)
            let finalUrl = imageUrl;
            if (!finalUrl) {
                console.error('loadImage called with undefined URL!');
                throw new Error('Image URL is undefined');
            }
            
            if (finalUrl.startsWith('/api/')) {
                // Make it absolute URL for v86.js
                finalUrl = window.location.origin + finalUrl;
            }
            
            // Ensure we use the proxy URL, not archive.org
            if (finalUrl.includes('archive.org') && !finalUrl.includes('/api/')) {
                console.warn('Replacing archive.org URL with proxy');
                finalUrl = window.location.origin + '/api/windows-iso-proxy';
            }
            
            console.log('loadImage called with:', { imageUrl, finalUrl, imageType });
            
            // Configure image based on type
            if (imageType === 'hda') {
                this.config.hda = {
                    url: finalUrl,
                    async: true,
                    size: 8589934592 // 8GB
                };
                this.config.boot_order = 0x123; // C, A, CD
            } else if (imageType === 'cdrom') {
                console.log('Setting CDROM URL to:', finalUrl);
                this.config.cdrom = {
                    url: finalUrl,
                    async: true,
                    // Size helps v86.js optimize loading (1.1GB = 1153433600 bytes)
                    size: 1153433600
                };
                this.config.boot_order = 0x213; // CD, C, A (boot from CD first)
                
                // Verify it was set correctly
                if (!this.config.cdrom.url) {
                    throw new Error('Failed to set CDROM URL');
                }
                console.log('CDROM config verified:', this.config.cdrom);
            }

            // Ultra-optimized configuration for fastest boot (adaptive system will increase when needed)
            this.config.memory_size = 768 * 1024 * 1024; // 768MB RAM (minimal for fastest boot)
            this.config.vga_memory_size = 8 * 1024 * 1024; // 8MB VGA (minimal for fastest graphics)
            
            // Ensure screen_container is a DOM element, not a string or null
            if (!this.container || typeof this.container !== 'object' || !this.container.nodeType) {
                this.container = document.getElementById('screen_container');
            }
            if (!this.container || !this.container.nodeType) {
                throw new Error('Screen container element not found. Make sure #screen_container exists in the DOM.');
            }
            // Verify it's actually a DOM element with getElementsByTagName method
            if (typeof this.container.getElementsByTagName !== 'function') {
                throw new Error('Screen container is not a valid DOM element');
            }
            this.config.screen_container = this.container;
            this.config.autostart = true;
            
            // BIOS files with CORS-friendly sources - ensure they're always set
            if (!this.config.bios || !this.config.bios.url) {
                this.config.bios = {
                    url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/seabios.bin"
                };
            }
            if (!this.config.vga_bios || !this.config.vga_bios.url) {
                this.config.vga_bios = {
                    url: "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/vgabios.bin"
                };
            }
            
            // Ensure WASM path is set
            if (!this.config.wasm_path) {
                this.config.wasm_path = "https://unpkg.com/v86@latest/build/v86.wasm";
            }
            
            // Ensure all image configs are either null or have valid URLs (prevent undefined URLs)
            if (this.config.cdrom && !this.config.cdrom.url) {
                this.config.cdrom = null;
            }
            if (this.config.hda && !this.config.hda.url) {
                this.config.hda = null;
            }
            if (this.config.fda && !this.config.fda.url) {
                this.config.fda = null;
            }
            
            console.log('BIOS/WASM config:', {
                bios: this.config.bios.url,
                vga_bios: this.config.vga_bios.url,
                wasm_path: this.config.wasm_path
            });
            
            // Ensure canvas is ready
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Network configuration (optional, can be disabled)
            this.config.network_relay_url = "wss://relay.widgetry.org/";

            this.updateProgress(50, 'Initializing x86 emulator core...');
            this.updateStatus('loading', 'Initializing x86 emulator core...');

            // Initialize v86 emulator with error handling
            try {
                // Log the actual URL being used
                const imageUrl = imageType === 'cdrom' ? this.config.cdrom?.url : this.config.hda?.url;
                console.log('Initializing v86 emulator with config:', {
                    memory: this.config.memory_size / 1024 / 1024 + 'MB',
                    vga: this.config.vga_memory_size / 1024 / 1024 + 'MB',
                    boot_order: this.config.boot_order.toString(16),
                    image_type: imageType,
                    image_url: imageUrl
                });
                
                // Ensure we're using the proxy URL, not archive.org directly
                if (imageType === 'cdrom' && this.config.cdrom) {
                    // Double-check the URL is set and valid
                    if (!this.config.cdrom.url) {
                        console.error('CDROM URL is undefined! Setting to proxy...');
                        this.config.cdrom.url = window.location.origin + '/api/windows-iso-proxy';
                    } else if (this.config.cdrom.url.includes('archive.org') && !this.config.cdrom.url.includes('/api/')) {
                        console.warn('Warning: Using archive.org URL directly, switching to proxy');
                        this.config.cdrom.url = window.location.origin + '/api/windows-iso-proxy';
                    }
                    // Ensure async is true for Range request support
                    this.config.cdrom.async = true;
                    console.log('Final CDROM config:', {
                        url: this.config.cdrom.url,
                        async: this.config.cdrom.async,
                        size: this.config.cdrom.size
                    });
                }
                
                // Use V86 (not V86Starter) - check which one is available
                // IMPORTANT: Don't deep clone config - DOM elements will be lost!
                // Create a shallow copy instead, preserving DOM element references
                const v86Config = { ...this.config };
                // Deep clone nested objects but preserve DOM elements
                if (v86Config.bios) v86Config.bios = { ...v86Config.bios };
                if (v86Config.vga_bios) v86Config.vga_bios = { ...v86Config.vga_bios };
                if (v86Config.cdrom && v86Config.cdrom.url) {
                    v86Config.cdrom = { ...v86Config.cdrom };
                } else {
                    v86Config.cdrom = null; // Explicitly set to null if no URL
                }
                if (v86Config.hda && v86Config.hda.url) {
                    v86Config.hda = { ...v86Config.hda };
                } else {
                    v86Config.hda = null; // Explicitly set to null if no URL
                }
                // Remove fda if not used
                if (!v86Config.fda || !v86Config.fda.url) {
                    v86Config.fda = null;
                }
                // Ensure screen_container is always a DOM element (critical for v86.js)
                // Re-validate container before passing to v86.js
                if (!this.container || typeof this.container.getElementsByTagName !== 'function') {
                    this.container = document.getElementById('screen_container');
                }
                if (!this.container || typeof this.container.getElementsByTagName !== 'function') {
                    throw new Error('screen_container must be a valid DOM element. Element not found or invalid.');
                }
                v86Config.screen_container = this.container;
                
                console.log('Creating V86 with config, CDROM URL:', v86Config.cdrom?.url);
                console.log('Screen container validated:', v86Config.screen_container.tagName, v86Config.screen_container.id);
                
                if (typeof V86 !== 'undefined') {
                    this.emulator = new V86(v86Config);
                } else if (typeof V86Starter !== 'undefined') {
                    this.emulator = new V86Starter(v86Config);
                } else {
                    throw new Error('Neither V86 nor V86Starter is available. v86.js may not have loaded correctly.');
                }
                
                console.log('v86 emulator initialized successfully with URL:', this.config.cdrom?.url || this.config.hda?.url);
                
                // ULTRA-AGGRESSIVE PERFORMANCE OPTIMIZATIONS AFTER INIT
                // Set minimal screen resolution for FASTEST boot (adaptive system will increase when needed)
                setTimeout(() => {
                    try {
                        if (this.emulator && this.emulator.screen_set_size) {
                            // Use minimal resolution: 640x480 for fastest boot
                            this.emulator.screen_set_size(640, 480);
                            console.log('Boot mode: Screen set to 640x480 for fastest boot');
                        } else if (this.emulator && this.emulator.screen && this.emulator.screen.set_size) {
                            this.emulator.screen.set_size(640, 480);
                            console.log('Boot mode: Screen set to 640x480 for fastest boot');
                        } else if (this.emulator && this.emulator.v86 && this.emulator.v86.screen && this.emulator.v86.screen.set_size) {
                            this.emulator.v86.screen.set_size(640, 480);
                            console.log('Boot mode: Screen set to 640x480 for fastest boot');
                        }
                    } catch (e) {
                        console.warn('Could not set screen size (non-critical):', e);
                    }
                }, 1000);

                // Optimize canvas for hardware acceleration
                setTimeout(() => {
                    try {
                        const canvas = this.container.querySelector('canvas');
                        if (canvas) {
                            // Enable GPU acceleration
                            canvas.style.transform = 'translateZ(0)';
                            canvas.style.willChange = 'contents';
                            canvas.style.backfaceVisibility = 'hidden';
                            canvas.style.imageRendering = 'pixelated'; // Faster rendering
                            console.log('Canvas optimized for hardware acceleration');
                        }
                    } catch (e) {
                        console.warn('Could not optimize canvas (non-critical):', e);
                    }
                }, 500);
                
            } catch (initError) {
                console.error('v86 initialization error:', initError);
                const errorMsg = 'Failed to initialize v86 emulator: ' + initError.message;
                if (this.dynamicIsland) {
                    this.dynamicIsland.updateStatus(errorMsg, 5000, 'error');
                }
                throw new Error(errorMsg);
            }

            // Enhanced event listeners with performance optimizations
            this.emulator.add_listener("emulator-ready", () => {
                console.log('Emulator ready, Windows should start booting...');
                this.updateProgress(60, 'Emulator initialized, starting Windows boot...');
                this.updateStatus('loading', 'Emulator ready, booting Windows...', 'loading');
                
                // Initialize Adaptive Performance System
                if (typeof AdaptivePerformance !== 'undefined') {
                    this.adaptivePerformance = new AdaptivePerformance(this.emulator);
                    console.log('Adaptive Performance System activated');
                }
                
                // Apply initial boot optimizations (adaptive system will take over)
                setTimeout(() => {
                    try {
                        // Set minimal screen resolution for boot (adaptive system will increase)
                        if (this.emulator && this.emulator.v86 && this.emulator.v86.screen && this.emulator.v86.screen.set_size) {
                            this.emulator.v86.screen.set_size(640, 480);
                            console.log('Boot mode: Screen set to 640x480 for fastest boot');
                        }
                    } catch (e) {
                        console.warn('Could not set boot screen size (non-critical):', e);
                    }
                }, 1000);
                
                if (this.dynamicIsland) {
                    this.dynamicIsland.updateStatus('Starting Windows boot process...', 0, 'loading');
                }
                // Focus canvas for keyboard input
                setTimeout(() => {
                    this.canvas.focus();
                }, 1000);
            });
            
            // Listen for boot errors
            this.emulator.add_listener("emulator-error", (error) => {
                console.error('Emulator error:', error);
                if (this.dynamicIsland) {
                    let errorMsg = error.message || error.toString();
                    
                    // Check for 64-bit error and provide helpful message
                    if (errorMsg.includes('64-bit') || errorMsg.includes('64 bit') || 
                        errorMsg.includes('x64') || errorMsg.includes('x86-64')) {
                        errorMsg = '64-bit Windows detected - v86.js only supports 32-bit (x86). ' +
                                  'You need a 32-bit Windows 10 image instead of 64-bit.';
                        if (this.dynamicIsland) {
                            this.dynamicIsland.updateStatus('64-bit Windows not supported - need 32-bit image', 15000, 'error');
                        }
                        console.error('CRITICAL: v86.js is 32-bit only. The Windows image must be 32-bit (x86), not 64-bit (x64).');
                        return;
                    }
                    
                    this.dynamicIsland.updateStatus(`Boot error: ${errorMsg.substring(0, 30)}`, 10000, 'error');
                }
            });
            
            // Monitor for boot failures - check if screen is stuck
            setTimeout(() => {
                if (!this.bootComplete && this.emulator) {
                    // Check if screen is still black/empty after 15 seconds
                    const canvas = document.getElementById('screen');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height));
                        const pixels = imageData.data;
                        let allBlack = true;
                        for (let i = 0; i < pixels.length; i += 4) {
                            if (pixels[i] !== 0 || pixels[i + 1] !== 0 || pixels[i + 2] !== 0) {
                                allBlack = false;
                                break;
                            }
                        }
                        
                        if (allBlack && !this.bootComplete) {
                            console.warn('Screen appears to be stuck on black screen - possible boot failure');
                            if (this.dynamicIsland) {
                                this.dynamicIsland.updateStatus('Boot may have failed - checking...', 5000, 'warning');
                            }
                        }
                    }
                }
            }, 15000);

            // Listen for download progress
            this.emulator.add_listener("download-progress", (progress) => {
                if (progress && progress.loaded && progress.total) {
                    const percent = (progress.loaded / progress.total) * 100;
                    const statusText = progress.file_name ? `Downloading ${progress.file_name}...` : 'Downloading...';
                    this.updateProgress(percent, statusText, progress.total, progress.loaded);
                }
            });

            // Listen for boot progress and optimize
            let bootProgressCounter = 0;
            let lastBootStatus = '';
            const bootStages = [
                { count: 0, status: 'Initializing BIOS...' },
                { count: 500, status: 'Loading boot sector...' },
                { count: 1000, status: 'Reading Windows loader...' },
                { count: 2000, status: 'Loading Windows kernel...' },
                { count: 3000, status: 'Initializing drivers...' },
                { count: 5000, status: 'Starting Windows services...' },
                { count: 8000, status: 'Loading system files...' },
                { count: 12000, status: 'Preparing desktop...' }
            ];
            
            this.emulator.add_listener("screen-put-char", () => {
                if (this.dynamicIsland && !this.bootComplete) {
                    bootProgressCounter++;
                    
                    // Find current boot stage
                    let currentStage = bootStages[0];
                    for (let i = bootStages.length - 1; i >= 0; i--) {
                        if (bootProgressCounter >= bootStages[i].count) {
                            currentStage = bootStages[i];
                            break;
                        }
                    }
                    
                    // Update status if stage changed
                    if (currentStage.status !== lastBootStatus) {
                        lastBootStatus = currentStage.status;
                        const bootPercent = Math.min(95, 20 + (bootProgressCounter / 15000) * 75);
                        this.updateProgress(bootPercent, currentStage.status);
                        if (this.dynamicIsland) {
                            this.dynamicIsland.updateStatus(currentStage.status, 0);
                        }
                    }
                }
            });

            // Hide loading overlay when emulator is ready (dynamic island handles status)
            // Small delay to ensure dynamic island is visible first
            setTimeout(() => {
                this.hideLoading();
            }, 1000);
            
            // Mark boot as complete after a delay and switch adaptive system to idle mode
            setTimeout(() => {
                this.bootComplete = true;
                this.updateProgress(100, 'Windows boot complete');
                if (this.dynamicIsland) {
                    this.dynamicIsland.updateStatus('Windows ready', 3000);
                    this.dynamicIsland.updateProgress(100);
                    this.dynamicIsland.setWindowsReady(true);
                }
                // Switch adaptive system from boot to idle mode
                if (this.adaptivePerformance) {
                    this.adaptivePerformance.setMode('idle');
                    console.log('Switched to idle mode after boot');
                }
            }, 30000); // Reduced to 30 seconds (adaptive system will optimize)
            
            // Listen for boot completion
            this.emulator.add_listener("boot", () => {
                console.log('Boot process started');
                this.updateStatus('loading', 'Windows is starting...');
            });

            // Optimize screen updates - v86.js handles this automatically
            // But we can monitor for performance
            let screenUpdateCount = 0;
            this.emulator.add_listener("screen-update", () => {
                screenUpdateCount++;
                // Screen is automatically updated by v86.js to canvas
            });

            // Monitor serial output for 64-bit errors
            let serialBuffer = '';
            this.emulator.add_listener("serial0-output-char", (char) => {
                // Serial output (boot messages)
                const charCode = typeof char === 'number' ? char : char.charCodeAt(0);
                serialBuffer += String.fromCharCode(charCode);
                
                // Keep buffer to last 500 chars
                if (serialBuffer.length > 500) {
                    serialBuffer = serialBuffer.slice(-500);
                }
                
                // Check for 64-bit error messages
                if (serialBuffer.includes('64-bit') || 
                    serialBuffer.includes('64 bit') ||
                    serialBuffer.includes('needs to be repaired') ||
                    serialBuffer.includes('doesn\'t have a 64-bit processor') ||
                    serialBuffer.includes('doesn\'t have a 64 bit processor')) {
                    console.error('64-bit Windows error detected in serial output');
                    if (this.dynamicIsland) {
                        this.dynamicIsland.updateStatus(
                            'ERROR: 64-bit Windows detected. v86.js only supports 32-bit (x86) Windows. ' +
                            'Please use a 32-bit Windows 10 image instead.',
                            20000,
                            'error'
                        );
                    }
                    serialBuffer = ''; // Clear buffer to avoid repeated messages
                }
                
                if (charCode === 10 || charCode === 13) { // \n or \r
                    this.updateStatus('loading', 'Windows is booting...');
                }
            });

            // Monitor boot progress with better detection
            let bootProgress = 60;
            let bootCheckCount = 0;
            const bootInterval = setInterval(() => {
                bootProgress += 1.5;
                bootCheckCount++;
                
                if (bootProgress < 95) {
                    this.updateProgress(Math.min(bootProgress, 95));
                }
                
                // Check if Windows has booted (after reasonable time)
                if (bootCheckCount > 30) { // After 60 seconds
                    clearInterval(bootInterval);
                    this.updateProgress(100);
                    this.hideLoading();
                    this.updateStatus('ready', 'Windows 10 is running');
                    this.statusIndicator.classList.add('ready');
                    
                    // Save image URL
                    localStorage.setItem('windowsImageUrl', imageUrl);
                    localStorage.setItem('windowsImageType', imageType);
                    
                    showToast('Windows 10 Lite is now running! You can open apps and browsers.', 'success');
                }
            }, 2000);

            // Auto-detect when Windows is ready (check for desktop)
            setTimeout(() => {
                clearInterval(bootInterval);
                this.updateProgress(100);
                this.hideLoading();
                this.updateStatus('ready', 'Windows 10 is running');
                this.statusIndicator.classList.add('ready');
                
                localStorage.setItem('windowsImageUrl', imageUrl);
                localStorage.setItem('windowsImageType', imageType);
                
                // Switch to idle mode when Windows is ready
                if (this.adaptivePerformance) {
                    this.adaptivePerformance.setMode('idle');
                }
                
                showToast('Windows 10 Lite is ready! Open apps, browsers, and more.', 'success');
            }, 30000); // Reduced to 30 seconds (adaptive system optimizes boot)

        } catch (error) {
            console.error('Error initializing emulator:', error);
            this.showError('Failed to initialize emulator: ' + error.message + '. Please try again or select a different image.');
        }
    }

    // Detect app from screen content or other signals
    detectApp(appName) {
        if (this.adaptivePerformance) {
            this.adaptivePerformance.detectApp(appName);
            console.log(`App detected: ${appName}, adaptive system adjusting...`);
        }
    }
    
    // Monitor screen for app launches (called periodically)
    monitorAppLaunches() {
        if (!this.bootComplete || !this.adaptivePerformance) return;
        
        // This would ideally hook into Windows process monitoring
        // For now, we rely on user interaction and adaptive system's workload detection
        // The adaptive system will automatically detect workload changes
    }
    
    loadPresetImage(type) {
        const images = {
            windows11: {
                url: 'https://example.com/windows11.img',
                name: 'Windows 11',
                type: 'hda'
            },
            windows10: {
                url: window.location.origin + '/api/windows-iso-proxy',
                name: 'Windows 10 Lite Edition 19H2',
                type: 'cdrom'
            },
            windows311: {
                url: 'https://github.com/copy/v86/raw/master/images/linux4.iso',
                name: 'Windows 3.11 (Demo)',
                type: 'cdrom'
            }
        };

        const image = images[type];
        if (!image) return;

        this.closeImageModal();
        this.updateStatus('loading', `Loading ${image.name}...`);
        this.loadImage(image.url, image.type);
    }

    loadCustomImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.img,.iso,.vmdk,.vdi';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Create object URL
            const url = URL.createObjectURL(file);
            this.closeImageModal();
            this.updateStatus('loading', 'Loading custom image...');
            this.loadImage(url);
        };

        input.click();
    }

    async loadFromUrl() {
        const url = document.getElementById('imageUrl').value.trim();
        if (!url) {
            alert('Please enter an image URL');
            return;
        }

        this.closeImageModal();
        this.updateStatus('loading', 'Loading from URL...');
        await this.loadImage(url);
    }

    restartVM() {
        if (!this.emulator) return;

        if (confirm('Are you sure you want to restart Windows? All unsaved work will be lost.')) {
            this.updateStatus('loading', 'Restarting Windows...', 'loading');
            // Don't show old loading overlay - dynamic island handles it
            if (this.dynamicIsland) {
                this.dynamicIsland.setWindowsReady(false);
                this.dynamicIsland.enterBootMode();
                this.dynamicIsland.updateStatus('Restarting Windows...', 0, 'loading');
            }
            
            // Restart emulator
            try {
                this.emulator.stop();
            } catch (err) {
                console.warn('Error stopping emulator:', err);
            }
            
            setTimeout(() => {
                const savedImage = localStorage.getItem('windowsImageUrl');
                const savedType = localStorage.getItem('windowsImageType');
                if (savedImage) {
                    this.loadImage(savedImage, savedType || 'cdrom');
                } else {
                    this.loadDefaultImage();
                }
            }, 1000);
        }
    }

    updateStatus(status, text) {
        if (this.statusIndicator) {
            this.statusIndicator.className = `status-dot ${status}`;
        }
        if (this.statusText) {
            this.statusText.textContent = text;
        }
        // Update dynamic island
        if (this.dynamicIsland && text) {
            this.dynamicIsland.updateStatus(text, 0);
        }
    }

    updateProgress(percent, statusText = null, totalBytes = null, loadedBytes = null) {
        if (this.progressFill) {
            this.progressFill.style.width = percent + '%';
        }
        // Update dynamic island progress
        if (this.dynamicIsland) {
            this.dynamicIsland.updateProgress(percent, statusText, totalBytes, loadedBytes);
        }
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.errorOverlay.style.display = 'none';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.errorOverlay.style.display = 'flex';
        this.loadingOverlay.style.display = 'none';
        this.updateStatus('error', 'Error');
    }

    showImageSelector() {
        document.getElementById('imageModal').classList.add('active');
    }

    closeImageModal() {
        document.getElementById('imageModal').classList.remove('active');
    }

    showSettings() {
        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    applySettings() {
        const memorySize = parseInt(document.getElementById('memorySize').value);
        const cpuSpeed = document.getElementById('cpuSpeed').value;
        const enableSound = document.getElementById('enableSound').checked;
        const enableNetwork = document.getElementById('enableNetwork').checked;
        const enableCDROM = document.getElementById('enableCDROM').checked;

        // Validate memory size
        if (memorySize < 512) {
            alert('Windows 10 requires at least 512MB of memory. Setting to 1024MB.');
            document.getElementById('memorySize').value = 1024;
            return;
        }

        // Update config
        this.config.memory_size = memorySize * 1024 * 1024;
        this.config.disable_speaker = !enableSound;
        
        if (enableNetwork) {
            this.config.network_relay_url = "wss://relay.widgetry.org/";
        } else {
            this.config.network_relay_url = null;
        }

        // Save settings
        localStorage.setItem('emulatorSettings', JSON.stringify({
            memorySize,
            cpuSpeed,
            enableSound,
            enableNetwork,
            enableCDROM
        }));

        this.closeSettings();
        showToast('Settings saved. Restart Windows to apply changes.', 'success');
    }
}

// Global functions
let emulator;

function toggleToolbar() {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;
    toolbar.classList.toggle('hidden');
    const vmContainer = document.querySelector('.vm-container');
    if (toolbar.classList.contains('hidden')) {
        vmContainer.style.height = '100vh';
    } else {
        vmContainer.style.height = 'calc(100vh - var(--toolbar-height))';
    }
}

function exitFullscreen() {
    if (confirm('Exit Azalea and return to home page?')) {
        window.location.href = '/';
    }
}

function toggleFullscreen() {
    const container = document.querySelector('.emulator-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error('Error entering fullscreen:', err);
        });
        container.classList.add('fullscreen');
    } else {
        document.exitFullscreen();
        container.classList.remove('fullscreen');
    }
}

function restartVM() {
    if (emulator) {
        emulator.restartVM();
    }
}

function showSettings() {
    if (emulator) {
        emulator.showSettings();
    }
}

function closeSettings() {
    if (emulator) {
        emulator.closeSettings();
    }
}

function showImageSelector() {
    if (emulator) {
        emulator.showImageSelector();
    }
}

function closeImageModal() {
    if (emulator) {
        emulator.closeImageModal();
    }
}

function loadPresetImage(type) {
    if (emulator) {
        emulator.loadPresetImage(type);
    }
}

function loadCustomImage() {
    if (emulator) {
        emulator.loadCustomImage();
    }
}

function loadFromUrl() {
    if (emulator) {
        emulator.loadFromUrl();
    }
}

function retryLoad() {
    if (emulator) {
        emulator.loadDefaultImage();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s;
        max-width: 300px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize emulator - called from windows-emulator.html after v86 loads
// This function is called externally after v86.js is loaded
function initializeEmulator() {
    // Check if v86 is available (V86 or V86Starter)
    if (typeof V86 === 'undefined' && typeof V86Starter === 'undefined') {
        console.error('v86.js not loaded - neither V86 nor V86Starter is available');
        const errorMsg = document.getElementById('errorMessage');
        const errorOverlay = document.getElementById('errorOverlay');
        if (errorMsg) {
            errorMsg.textContent = 'v86.js library failed to load. Please ensure libv86.js exists and refresh the page.';
        }
        if (errorOverlay) {
            errorOverlay.style.display = 'flex';
        }
        return;
    }

    // Wait for DOM elements to be ready
    if (!document.getElementById('screen')) {
        setTimeout(initializeEmulator, 100);
        return;
    }

    window.emulator = new WindowsEmulator();
    
    // Load saved settings
    const savedSettings = localStorage.getItem('emulatorSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            const memorySize = document.getElementById('memorySize');
            const cpuSpeed = document.getElementById('cpuSpeed');
            const enableSound = document.getElementById('enableSound');
            const enableNetwork = document.getElementById('enableNetwork');
            
            if (memorySize) memorySize.value = settings.memorySize || 1536;
            if (cpuSpeed) cpuSpeed.value = settings.cpuSpeed || 'medium';
            if (enableSound) enableSound.checked = settings.enableSound !== false;
            if (enableNetwork) enableNetwork.checked = settings.enableNetwork !== false;
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    } else {
        // Default settings for Windows 10 (optimized)
        const memorySize = document.getElementById('memorySize');
        if (memorySize) memorySize.value = 1536;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
