// Advanced Dynamic Island Component - Enhanced with AI Chat and Boot Mode
class DynamicIsland {
    constructor() {
        this.container = null;
        this.statusText = '';
        this.isExpanded = false;
        this.isVisible = true;
        this.aiEnabled = true;
        this.aiHistory = [];
        this.emulator = null;
        this.state = 'compact'; // 'compact', 'expanded', 'boot-mode', 'chat-mode'
        this.progress = 0;
        this.progressStartTime = null;
        this.progressLastUpdate = null;
        this.progressLastValue = 0;
        this.autoHideTimeout = null;
        this.windowsReady = false;
        this.selectedModel = localStorage.getItem('wind0_ai_model') || 'gpt-4.1-2025-04-14';
        this.statusColor = 'default'; // 'default', 'loading', 'success', 'error', 'warning'
        this.statusAnimation = null;
        this.errorQueue = [];
        this.availableModels = [
            {id: "gpt-4.1-nano-2025-04-14", name: "GPT-4.1 Nano", context: "5K chars"},
            {id: "gpt-4.1-2025-04-14", name: "GPT-4.1", context: "10K chars"},
            {id: "gpt-5-mini", name: "GPT-5 Mini", context: "7K chars"},
            {id: "gpt-o4-mini-2025-04-16", name: "GPT-O4 Mini", context: "Unknown"},
            {id: "deepseek-v3.1", name: "DeepSeek v3.1", context: "10K chars"},
            {id: "mistral-small-3.1-24b-instruct-2503", name: "Mistral Small 3.1", context: "Unknown"},
            {id: "codestral-2405", name: "Codestral 2405", context: "32K tokens"},
            {id: "codestral-2501", name: "Codestral 2501", context: "32K tokens"},
            {id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", context: "Unknown"},
            {id: "gemini-search", name: "Gemini Search", context: "Unknown"},
            {id: "llama-3.1-8B-instruct", name: "Llama 3.1 8B", context: "Unknown"},
            {id: "bidara", name: "Bidara", context: "Unknown"},
            {id: "glm-4.5-flash", name: "GLM 4.5 Flash", context: "Unknown"},
            {id: "rtist", name: "Rtist", context: "Unknown"}
        ];
        this.init();
    }

    init() {
        // Create dynamic island container
        this.container = document.createElement('div');
        this.container.id = 'dynamic-island';
        this.container.className = 'dynamic-island';
        
        // Main content area
        const mainContent = document.createElement('div');
        mainContent.className = 'island-main';
        
        // Status text with optional logo
        const statusEl = document.createElement('div');
        statusEl.className = 'island-status';
        statusEl.id = 'island-status';
        
        // Logo icon removed - using text only for cleaner look
        const statusText = document.createElement('span');
        statusText.textContent = 'wind0';
        statusEl.appendChild(statusText);
        
        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'island-progress-container';
        progressContainer.id = 'island-progress-container';
        progressContainer.style.display = 'none';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'island-progress-bar';
        progressBar.id = 'island-progress-bar';
        
        const progressText = document.createElement('div');
        progressText.className = 'island-progress-text';
        progressText.id = 'island-progress-text';
        
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        
        // AI indicator
        const aiIndicator = document.createElement('div');
        aiIndicator.className = 'ai-indicator';
        aiIndicator.id = 'ai-indicator';
        aiIndicator.title = 'AI Assistant Active';
        
        // Network indicator
        const networkIndicator = document.createElement('div');
        networkIndicator.className = 'network-indicator';
        networkIndicator.id = 'network-indicator';
        networkIndicator.title = 'Network Status';
        
        mainContent.appendChild(statusEl);
        mainContent.appendChild(progressContainer);
        mainContent.appendChild(networkIndicator);
        mainContent.appendChild(aiIndicator);
        
        // Expanded controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'island-controls';
        controlsEl.id = 'island-controls';
        
        // Control buttons
        const controls = [
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`, 
                action: 'settings', 
                title: 'Settings (S)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>`, 
                action: 'restart', 
                title: 'Restart VM (R)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`, 
                action: 'fullscreen', 
                title: 'Fullscreen (F11)' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`, 
                action: 'chat', 
                title: 'AI Chat' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`, 
                action: 'storage', 
                title: 'Cloud Storage' 
            },
            { 
                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`, 
                action: 'minimize', 
                title: 'Minimize' 
            }
        ];
        
        controls.forEach(ctrl => {
            const btn = document.createElement('button');
            btn.className = 'island-btn';
            btn.innerHTML = ctrl.icon;
            btn.title = ctrl.title;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.handleAction(ctrl.action);
            };
            controlsEl.appendChild(btn);
        });
        
        this.container.appendChild(mainContent);
        this.container.appendChild(controlsEl);
        
        // Boot mode panel (shown when Windows is not ready)
        this.createBootModePanel();
        
        // Storage panel
        this.createStoragePanel();
        
        // Network panel
        this.createNetworkPanel();
        
        // Chat panel
        this.createChatPanel();
        
        // Event listeners
        let hoverTimeout = null;
        this.container.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            if (!this.isExpanded && this.windowsReady) {
                this.expand();
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (!this.isExpanded && this.windowsReady) {
                    this.collapse();
                }
            }, 300);
        });
        
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.closest('.island-main')) {
                e.stopPropagation();
                if (this.windowsReady) {
                    this.toggleExpanded();
                }
            }
        });
        
        this.container.addEventListener('mousedown', (e) => e.stopPropagation());
        this.container.addEventListener('mouseup', (e) => e.stopPropagation());
        
        document.body.appendChild(this.container);
        this.initAI();
        this.positionTopCenter();
        
        // Force visibility immediately
        setTimeout(() => {
            this.positionTopCenter();
            this.container.style.display = 'flex';
            this.container.style.opacity = '1';
            this.container.style.visibility = 'visible';
        }, 100);
        
        this.startAutoHide();
        
        // Setup error monitoring
        this.setupErrorMonitoring();
        
        // Show boot mode initially
        this.enterBootMode();
    }
    
    setupErrorMonitoring() {
        // Monitor console errors - only show critical errors, not expected fallbacks
        const originalError = console.error;
        const self = this;
        
        // List of expected/ignored error patterns
        const ignoredPatterns = [
            'ERR_CONNECTION_REFUSED', // Expected when backend isn't running
            'CORS policy', // Expected when proxy isn't available
            'File.IO proxy not available', // Expected fallback
            'Azalea server not available', // Expected fallback
            'localStorage only', // Expected fallback message
            'Proxy returned 404', // Expected when proxy isn't deployed yet
            'Proxy not available', // Expected fallback message
            'Loading the image', // v86 library errors when image fails to load (expected with 404)
            'failed (status 404)', // v86 library 404 errors
            'status 404', // General 404 errors (expected until functions are deployed)
            '/api/windows-iso-proxy', // Specific proxy endpoint (404 expected until deployed)
            '/api/fileio-proxy', // Specific proxy endpoint (404 expected until deployed)
        ];
        
        console.error = function(...args) {
            originalError.apply(console, args);
            
            // Check if it's a relevant error (not just warnings or expected fallbacks)
            const errorMsg = args.join(' ');
            const isIgnored = ignoredPatterns.some(pattern => errorMsg.includes(pattern));
            
            // Only show critical errors that aren't in our ignored list
            // Don't show 404s for API endpoints (expected until deployed)
            // Don't show image loading failures from v86 (expected when proxy unavailable)
            if (!isIgnored && (
                (errorMsg.includes('Failed to load') && !errorMsg.includes('404') && !errorMsg.includes('image')) ||
                (errorMsg.includes('boot') && !errorMsg.includes('404')) ||
                (errorMsg.includes('disk') && !errorMsg.includes('404')) ||
                (errorMsg.includes('error') && !errorMsg.includes('404') && !errorMsg.includes('proxy'))
            )) {
                // Only show critical errors, and only briefly
                self.setStatusColor('error');
                const statusEl = document.getElementById('island-status');
                if (statusEl) {
                    const shortMsg = errorMsg.length > 30 ? errorMsg.substring(0, 27) + '...' : errorMsg;
                    statusEl.textContent = shortMsg;
                    self.statusText = shortMsg;
                }
                
                // Auto-clear after 3 seconds (shorter)
                setTimeout(() => {
                    if (self.statusText === errorMsg.substring(0, 30)) {
                        self.setStatusColor('default');
                        const statusEl = document.getElementById('island-status');
                        if (statusEl) {
                            statusEl.textContent = 'wind0';
                            self.statusText = 'wind0';
                        }
                    }
                }, 3000);
            }
        };
        
        // Monitor window errors - only show critical ones
        window.addEventListener('error', (event) => {
            if (event.error) {
                const errorMsg = event.error.message || event.error.toString() || 'Error occurred';
                const isIgnored = ignoredPatterns.some(pattern => errorMsg.includes(pattern));
                
                // Also check the error source/filename for API endpoints
                const errorSource = event.filename || event.target?.src || '';
                const isApiError = errorSource.includes('/api/') && (errorMsg.includes('404') || errorMsg.includes('Failed'));
                
                if (!isIgnored && !isApiError) {
                    self.setStatusColor('error');
                    const statusEl = document.getElementById('island-status');
                    const shortMsg = errorMsg.length > 30 ? errorMsg.substring(0, 27) + '...' : errorMsg;
                    
                    if (statusEl) {
                        statusEl.textContent = shortMsg;
                        self.statusText = shortMsg;
                    }
                    
                    setTimeout(() => {
                        if (self.statusText === shortMsg) {
                            self.setStatusColor('default');
                            const statusEl = document.getElementById('island-status');
                            if (statusEl) {
                                statusEl.textContent = 'wind0';
                                self.statusText = 'wind0';
                            }
                        }
                    }, 3000);
                }
            }
        });
        
        // Monitor unhandled promise rejections - only show critical ones
        window.addEventListener('unhandledrejection', (event) => {
            const errorMsg = String(event.reason?.message || event.reason || 'Promise rejected');
            const isIgnored = ignoredPatterns.some(pattern => errorMsg.includes(pattern));
            
            // Check if it's a fetch error to API endpoints (expected 404s)
            const isApiFetchError = errorMsg.includes('Failed to fetch') && 
                                   (errorMsg.includes('/api/') || errorMsg.includes('404'));
            
            if (!isIgnored && !isApiFetchError) {
                self.setStatusColor('error');
                const statusEl = document.getElementById('island-status');
                if (statusEl) {
                    const shortMsg = errorMsg.length > 30 ? errorMsg.substring(0, 27) + '...' : errorMsg;
                    statusEl.textContent = shortMsg;
                    self.statusText = shortMsg;
                }
                
                setTimeout(() => {
                    if (self.statusText === shortMsg) {
                        self.setStatusColor('default');
                        const statusEl = document.getElementById('island-status');
                        if (statusEl) {
                            statusEl.textContent = 'wind0';
                            self.statusText = 'wind0';
                        }
                    }
                }, 3000);
            }
        });
    }

    createBootModePanel() {
        const bootPanel = document.createElement('div');
        bootPanel.className = 'island-boot-panel';
        bootPanel.id = 'island-boot-panel';
        bootPanel.style.display = 'none';
        
        bootPanel.innerHTML = `
            <div class="boot-panel-header">
                <h3>Windows Setup</h3>
                <p>Windows is starting up. This may take 30-60 seconds.</p>
            </div>
            <div class="boot-panel-content">
                <div class="boot-info">
                    <div class="boot-status-item">
                        <span class="boot-label">Status:</span>
                        <span class="boot-value" id="boot-status-value">Initializing...</span>
                    </div>
                    <div class="boot-status-item">
                        <span class="boot-label">Progress:</span>
                        <span class="boot-value" id="boot-progress-value">0%</span>
                    </div>
                    <div class="boot-status-item">
                        <span class="boot-label">Time Remaining:</span>
                        <span class="boot-value" id="boot-time-value">Calculating...</span>
                    </div>
                </div>
                <div class="boot-tips">
                    <h4>Tips:</h4>
                    <ul>
                        <li>Keep this tab open during boot</li>
                        <li>Don't close or refresh the page</li>
                        <li>Windows will be ready shortly</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.container.appendChild(bootPanel);
    }

    createStoragePanel() {
        const storagePanel = document.createElement('div');
        storagePanel.className = 'island-storage-panel';
        storagePanel.id = 'island-storage-panel';
        storagePanel.style.display = 'none';
        
        storagePanel.innerHTML = `
            <div class="storage-panel-header">
                <div class="storage-header-left">
                    <h3>Cloud Storage</h3>
                    <span class="storage-badge" id="storage-badge">Unlimited</span>
                </div>
                <button class="storage-close-btn" onclick="window.dynamicIslandInstance?.exitStorageMode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="storage-panel-content">
                <div class="storage-stats" id="storage-stats">
                    <div class="stat-item">
                        <span class="stat-label">Files:</span>
                        <span class="stat-value" id="stat-files">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Size:</span>
                        <span class="stat-value" id="stat-size">0 GB</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Cache:</span>
                        <span class="stat-value" id="stat-cache">0 MB</span>
                    </div>
                </div>
                <div class="storage-actions">
                    <button class="storage-action-btn" id="upload-file-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload File
                    </button>
                    <button class="storage-action-btn" id="create-disk-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        Create Virtual Disk
                    </button>
                    <button class="storage-action-btn" id="toggle-sync-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"></path>
                        </svg>
                        <span id="sync-status-text">Auto-Sync: ON</span>
                    </button>
                    <button class="storage-action-btn" id="refresh-storage-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
                <div class="storage-files" id="storage-files">
                    <div class="storage-empty">No files stored yet</div>
                </div>
            </div>
        `;
        
        this.container.appendChild(storagePanel);
        
        // Setup event listeners
        setTimeout(() => {
            const uploadBtn = document.getElementById('upload-file-btn');
            const createDiskBtn = document.getElementById('create-disk-btn');
            const refreshBtn = document.getElementById('refresh-storage-btn');
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            if (uploadBtn) {
                uploadBtn.onclick = () => {
                    fileInput.click();
                };
            }
            
            fileInput.onchange = async (e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                    await this.uploadFileToStorage(file);
                }
                this.refreshStorageDisplay();
            };
            
            if (createDiskBtn) {
                createDiskBtn.onclick = async () => {
                    const sizeMB = prompt('Enter disk size in MB (default: 1000):', '1000');
                    if (sizeMB) {
                        await this.createVirtualDisk(parseInt(sizeMB));
                    }
                };
            }
            
            if (refreshBtn) {
                refreshBtn.onclick = () => {
                    this.refreshStorageDisplay();
                };
            }
            
            const toggleSyncBtn = document.getElementById('toggle-sync-btn');
            const syncStatusText = document.getElementById('sync-status-text');
            if (toggleSyncBtn && this.emulator && this.emulator.filesystemBridge) {
                // Update sync status
                const updateSyncStatus = () => {
                    const status = this.emulator.filesystemBridge.getSyncStatus();
                    if (syncStatusText) {
                        syncStatusText.textContent = `Auto-Sync: ${status.enabled ? 'ON' : 'OFF'}`;
                    }
                    toggleSyncBtn.style.opacity = status.enabled ? '1' : '0.6';
                };
                
                updateSyncStatus();
                
                toggleSyncBtn.onclick = () => {
                    const status = this.emulator.filesystemBridge.getSyncStatus();
                    this.emulator.filesystemBridge.setAutoSync(!status.enabled);
                    updateSyncStatus();
                    this.updateStatus(`Auto-sync ${!status.enabled ? 'enabled' : 'disabled'}`, 2000);
                };
            }
        }, 100);
    }

    async uploadFileToStorage(file) {
        if (!this.emulator || !this.emulator.storageManager) {
            alert('Storage manager not available');
            return;
        }
        
        this.updateStatus(`Uploading ${file.name}...`, 0);
        
        try {
            // Use filesystem bridge for automatic sync
            const targetPath = `/cloud/Downloads/${file.name}`;
            const result = await this.emulator.storageManager.storeFile(targetPath, file);
            
            // If filesystem bridge exists, trigger auto-install for executables
            if (this.emulator.filesystemBridge && (file.name.endsWith('.exe') || file.name.endsWith('.msi'))) {
                this.updateStatus(`Installing ${file.name}...`, 0);
                try {
                    await this.emulator.filesystemBridge.installToWindows(targetPath);
                    this.updateStatus(`Installed ${file.name}`, 3000);
                } catch (installErr) {
                    console.warn('Auto-install failed:', installErr);
                    this.updateStatus(`Uploaded ${file.name}`, 2000);
                }
            } else {
                this.updateStatus(`Uploaded ${file.name}`, 2000);
            }
            
            this.refreshStorageDisplay();
        } catch (error) {
            console.error('Upload error:', error);
            this.updateStatus(`Upload failed: ${error.message}`, 3000);
        }
    }

    async createVirtualDisk(sizeMB) {
        if (!this.emulator || !this.emulator.storageManager) {
            alert('Storage manager not available');
            return;
        }
        
        this.updateStatus(`Creating ${sizeMB}MB virtual disk...`, 0);
        
        try {
            const disk = await this.emulator.storageManager.createVirtualDisk(sizeMB);
            this.updateStatus(`Virtual disk created: ${disk.id}`, 3000);
            this.refreshStorageDisplay();
        } catch (error) {
            console.error('Create disk error:', error);
            this.updateStatus(`Failed to create disk: ${error.message}`, 3000);
        }
    }

    refreshStorageDisplay() {
        if (!this.emulator || !this.emulator.storageManager) return;
        
        const stats = this.emulator.storageManager.getStats();
        const files = this.emulator.storageManager.listFiles('/cloud');
        
        // Update stats
        const filesEl = document.getElementById('stat-files');
        const sizeEl = document.getElementById('stat-size');
        const cacheEl = document.getElementById('stat-cache');
        
        if (filesEl) filesEl.textContent = stats.fileCount;
        if (sizeEl) sizeEl.textContent = (stats.totalSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        if (cacheEl) cacheEl.textContent = (stats.cacheSize / (1024 * 1024)).toFixed(1) + ' MB';
        
        // Update sync status if available
        if (this.emulator.filesystemBridge) {
            const syncStatus = this.emulator.filesystemBridge.getSyncStatus();
            const syncStatusText = document.getElementById('sync-status-text');
            if (syncStatusText) {
                syncStatusText.textContent = `Auto-Sync: ${syncStatus.enabled ? 'ON' : 'OFF'}`;
                if (syncStatus.pendingFiles > 0) {
                    syncStatusText.textContent += ` (${syncStatus.pendingFiles} pending)`;
                }
            }
        }
        
        // Update files list
        const filesContainer = document.getElementById('storage-files');
        if (filesContainer) {
            if (files.length === 0) {
                filesContainer.innerHTML = '<div class="storage-empty">No files stored yet. Files will automatically sync when saved in Windows.</div>';
            } else {
                filesContainer.innerHTML = files.map(file => {
                    const fileName = file.path.split('/').pop() || file.name || 'Unknown';
                    const relativePath = file.path.replace(/^\//, '');
                    const fileInfo = this.emulator.storageManager.storageIndex.files[relativePath];
                    const shareLink = fileInfo?.link || file.link;
                    const isInstalled = fileInfo?.installed || file.path.includes('Program Files');
                    
                    return `
                    <div class="storage-file-item">
                        <div class="file-info">
                            <span class="file-name">${this.escapeHtml(fileName)} ${isInstalled ? '📦' : ''}</span>
                            <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div class="file-actions">
                            ${shareLink ? `<button class="file-share-btn" onclick="navigator.clipboard.writeText('${shareLink}').then(() => { if(window.dynamicIslandInstance) window.dynamicIslandInstance.updateStatus('Link copied!', 2000); })" title="Copy share link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </button>` : ''}
                            <button class="file-delete-btn" onclick="if(window.dynamicIslandInstance) window.dynamicIslandInstance.deleteStorageFile('${file.path}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                }).join('');
            }
        }
    }

    async deleteStorageFile(filePath) {
        if (!this.emulator || !this.emulator.storageManager) return;
        
        if (!confirm(`Delete ${filePath}?`)) return;
        
        try {
            await this.emulator.storageManager.deleteFile(filePath);
            this.updateStatus('File deleted', 2000);
            this.refreshStorageDisplay();
        } catch (error) {
            console.error('Delete error:', error);
            this.updateStatus(`Delete failed: ${error.message}`, 3000);
        }
    }

    enterStorageMode() {
        this.state = 'storage-mode';
        this.isExpanded = true;
        this.container.classList.add('storage-mode');
        const storagePanel = document.getElementById('island-storage-panel');
        if (storagePanel) {
            storagePanel.style.display = 'block';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '500px';
        this.container.style.maxWidth = '700px';
        this.container.style.height = 'auto';
        this.container.style.maxHeight = '80vh';
        
        this.refreshStorageDisplay();
    }

    exitStorageMode() {
        this.state = this.windowsReady ? 'compact' : 'boot-mode';
        this.isExpanded = false;
        this.container.classList.remove('storage-mode');
        const storagePanel = document.getElementById('island-storage-panel');
        if (storagePanel) {
            storagePanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.height = '40px';
        this.container.style.maxHeight = 'none';
        
        if (!this.windowsReady) {
            this.enterBootMode();
        } else {
            this.collapse();
        }
    }

    createChatPanel() {
        const chatPanel = document.createElement('div');
        chatPanel.className = 'island-chat-panel';
        chatPanel.id = 'island-chat-panel';
        chatPanel.style.display = 'none';
        
        chatPanel.innerHTML = `
            <div class="chat-panel-header">
                <div class="chat-header-left">
                    <h3>AI Assistant</h3>
                    <select id="ai-model-select" class="model-select">
                        ${this.availableModels.map(m => 
                            `<option value="${m.id}" ${m.id === this.selectedModel ? 'selected' : ''}>${m.name} (${m.context})</option>`
                        ).join('')}
                    </select>
                </div>
                <button class="chat-close-btn" onclick="window.dynamicIslandInstance?.exitChatMode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-message ai-message">
                    <div class="message-content">Hello! I'm your AI assistant. How can I help you with Windows?</div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" class="chat-input" placeholder="Ask me anything..." autocomplete="off">
                <button id="chat-send-btn" class="chat-send-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        this.container.appendChild(chatPanel);
        
        // Setup chat event listeners
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            const chatSendBtn = document.getElementById('chat-send-btn');
            const modelSelect = document.getElementById('ai-model-select');
            
            if (chatInput && chatSendBtn) {
                const sendMessage = () => {
                    const message = chatInput.value.trim();
                    if (message) {
                        this.sendChatMessage(message);
                        chatInput.value = '';
                    }
                };
                
                chatSendBtn.onclick = sendMessage;
                chatInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                };
            }
            
            if (modelSelect) {
                modelSelect.onchange = (e) => {
                    this.selectedModel = e.target.value;
                    localStorage.setItem('wind0_ai_model', this.selectedModel);
                    this.addChatMessage('AI', `Switched to ${modelSelect.options[modelSelect.selectedIndex].text}`);
                };
            }
        }, 100);
    }

    enterBootMode() {
        if (!this.windowsReady) {
            this.state = 'boot-mode';
            this.isExpanded = true;
            this.container.classList.add('boot-mode');
            const bootPanel = document.getElementById('island-boot-panel');
            if (bootPanel) {
                bootPanel.style.display = 'block';
            }
            this.container.style.width = 'auto';
            this.container.style.minWidth = '400px';
            this.container.style.maxWidth = '600px';
            this.container.style.height = 'auto';
            this.container.style.maxHeight = '70vh';
            // Ensure visibility
            this.container.style.display = 'flex';
            this.container.style.opacity = '1';
            this.container.style.visibility = 'visible';
        }
    }

    exitBootMode() {
        this.windowsReady = true;
        this.state = 'compact';
        this.container.classList.remove('boot-mode');
        const bootPanel = document.getElementById('island-boot-panel');
        if (bootPanel) {
            bootPanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '100px';
        this.container.style.maxWidth = '500px';
    }

    enterChatMode() {
        this.state = 'chat-mode';
        this.isExpanded = true;
        this.container.classList.add('chat-mode');
        const chatPanel = document.getElementById('island-chat-panel');
        if (chatPanel) {
            chatPanel.style.display = 'block';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '400px';
        this.container.style.maxWidth = '600px';
        this.container.style.height = 'auto';
        this.container.style.maxHeight = '70vh';
        
        // Focus input
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }

    exitChatMode() {
        this.state = this.windowsReady ? 'compact' : 'boot-mode';
        this.isExpanded = false;
        this.container.classList.remove('chat-mode');
        const chatPanel = document.getElementById('island-chat-panel');
        if (chatPanel) {
            chatPanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.height = '40px';
        this.container.style.maxHeight = 'none';
        
        if (!this.windowsReady) {
            this.enterBootMode();
        } else {
            this.collapse();
        }
    }

    addChatMessage(role, content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(content)}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async sendChatMessage(message) {
        this.addChatMessage('user', message);
        
        this.updateStatus('AI thinking...', 0);
        
        const response = await this.queryAI(message);
        
        if (response) {
            this.addChatMessage('AI', response);
            const executed = await this.executeAICommand(response, this.emulator);
            if (executed) {
                this.updateStatus('Command executed', 2000);
            }
        } else {
            this.addChatMessage('AI', 'Sorry, I encountered an error. Please try again.');
            this.updateStatus('AI unavailable', 2000);
        }
    }

    positionTopCenter() {
        this.container.style.top = '16px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.right = 'auto';
        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        this.container.style.visibility = 'visible';
        this.container.style.pointerEvents = 'auto';
        // Ensure it's above loading overlay (9998) and all other elements
        this.container.style.zIndex = '10001';
        // Force visibility
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    expand() {
        if (this.state === 'compact' && this.windowsReady) {
            this.state = 'expanded';
            this.container.classList.add('expanded');
            clearTimeout(this.autoHideTimeout);
            
            setTimeout(() => {
                const controls = document.getElementById('island-controls');
                if (controls) {
                    controls.style.display = 'flex';
                }
            }, 150);
        }
    }

    collapse() {
        if (this.state === 'expanded' && !this.isExpanded && this.windowsReady) {
            this.state = 'compact';
            this.container.classList.remove('expanded');
            const controls = document.getElementById('island-controls');
            if (controls) {
                controls.style.display = 'none';
            }
            this.startAutoHide();
        }
    }

    toggleExpanded() {
        if (this.windowsReady) {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    startAutoHide() {
        clearTimeout(this.autoHideTimeout);
        if (this.windowsReady) {
            this.autoHideTimeout = setTimeout(() => {
                if (!this.isExpanded && this.progress === 0 && !this.container.matches(':hover')) {
                    this.container.style.opacity = '0.6';
                }
            }, 5000);
        }
    }

    handleAction(action) {
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        switch(action) {
            case 'settings':
                if (typeof showSettings === 'function') {
                    showSettings();
                    this.updateStatus('Settings', 2000);
                }
                break;
            case 'restart':
                if (typeof restartVM === 'function') {
                    if (confirm('Restart Windows VM? This will reset the current session.')) {
                        restartVM();
                        this.updateStatus('Restarting...', 0);
                        this.exitBootMode();
                        this.enterBootMode();
                    }
                }
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'chat':
                this.enterChatMode();
                break;
            case 'storage':
                this.enterStorageMode();
                break;
            case 'network':
                this.enterNetworkMode();
                break;
            case 'minimize':
                this.toggle();
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not available:', err);
            });
            this.updateStatus('Fullscreen', 2000);
        } else {
            document.exitFullscreen();
            this.updateStatus('Windowed', 2000);
        }
    }

    async initAI() {
        this.setAIEnabled(true);
    }

    async queryAI(prompt) {
        if (!this.aiEnabled) return null;
        
        try {
            const response = await fetch('https://api.llm7.io/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.selectedModel,
                    messages: [
                        ...this.aiHistory.slice(-5),
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            this.aiHistory.push(
                { role: 'user', content: prompt },
                { role: 'assistant', content: reply }
            );
            
            if (this.aiHistory.length > 20) {
                this.aiHistory = this.aiHistory.slice(-20);
            }
            
            return reply;
        } catch (error) {
            console.warn('AI query failed:', error);
            return null;
        }
    }

    async executeAICommand(command, emulator) {
        const lowerCmd = command.toLowerCase();
        
        if (lowerCmd.includes('open') || lowerCmd.includes('launch')) {
            const appMatch = command.match(/(?:open|launch)\s+(\w+)/i);
            if (appMatch && emulator) {
                const app = appMatch[1];
                this.updateStatus(`Opening ${app}...`, 2000);
                if (emulator.sendKeyboard) {
                    emulator.sendKeyboard('Meta', 'down');
                    await new Promise(r => setTimeout(r, 100));
                    emulator.sendKeyboard('Meta', 'up');
                    await new Promise(r => setTimeout(r, 200));
                    for (const char of app) {
                        emulator.sendKeyboard(char, 'down');
                        await new Promise(r => setTimeout(r, 50));
                        emulator.sendKeyboard(char, 'up');
                    }
                    await new Promise(r => setTimeout(r, 200));
                    emulator.sendKeyboard('Enter', 'down');
                    emulator.sendKeyboard('Enter', 'up');
                }
                return true;
            }
        } else if (lowerCmd.includes('type') || lowerCmd.includes('write')) {
            const textMatch = command.match(/(?:type|write)\s+(.+)/i);
            if (textMatch && emulator) {
                const text = textMatch[1];
                this.updateStatus(`Typing...`, 2000);
                for (const char of text) {
                    emulator.sendKeyboard(char, 'down');
                    await new Promise(r => setTimeout(r, 30));
                    emulator.sendKeyboard(char, 'up');
                }
                return true;
            }
        }
        
        return false;
    }

    updateStatus(text, duration = 3000, statusType = 'default') {
        if (!this.container) return;
        
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        // Always maintain centering transform
        this.positionTopCenter();
        
        // Handle errors with AI paraphrasing
        if (statusType === 'error') {
            this.handleError(text);
            return;
        }
        
        // Set status color and animation
        this.setStatusColor(statusType);
        
        const statusEl = document.getElementById('island-status');
        if (statusEl) {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                statusEl.textContent = text;
                this.statusText = text;
                statusEl.style.opacity = '1';
            }, 150);
            
            this.container.classList.add('pulse');
            setTimeout(() => {
                this.container.classList.remove('pulse');
            }, 300);
        }
        
        // Update boot panel if in boot mode
        if (this.state === 'boot-mode') {
            const bootStatus = document.getElementById('boot-status-value');
            if (bootStatus) {
                bootStatus.textContent = text;
            }
        }
        
        // Auto-hide after duration
        if (duration > 0 && !text.includes('Booting') && !text.includes('Loading') && !text.includes('Downloading')) {
            setTimeout(() => {
                if (this.statusText === text && !this.isExpanded && statusType !== 'error') {
                    this.collapse();
                    this.startAutoHide();
                }
            }, duration);
        }
    }

    async handleError(errorText) {
        // Always maintain centering
        this.positionTopCenter();
        
        // Add to error queue
        this.errorQueue.push(errorText);
        
        // Paraphrase error with AI
        try {
            const paraphrased = await this.paraphraseError(errorText);
            this.setStatusColor('error');
            const statusEl = document.getElementById('island-status');
            if (statusEl) {
                statusEl.textContent = paraphrased || errorText;
                this.statusText = paraphrased || errorText;
            }
        } catch (err) {
            // If AI fails, show original error
            this.setStatusColor('error');
            const statusEl = document.getElementById('island-status');
            if (statusEl) {
                statusEl.textContent = errorText;
                this.statusText = errorText;
            }
        }
        
        // Ensure centering is maintained after error state
        this.positionTopCenter();
    }

    async paraphraseError(errorText) {
        try {
            const response = await this.queryAI(`Paraphrase this error message in a user-friendly way (max 40 characters): ${errorText}`);
            if (response) {
                // Extract just the paraphrased text, remove quotes
                let paraphrased = response.trim();
                if (paraphrased.startsWith('"') && paraphrased.endsWith('"')) {
                    paraphrased = paraphrased.slice(1, -1);
                }
                if (paraphrased.startsWith("'") && paraphrased.endsWith("'")) {
                    paraphrased = paraphrased.slice(1, -1);
                }
                return paraphrased.substring(0, 50); // Limit length
            }
        } catch (error) {
            console.warn('Error paraphrasing failed:', error);
        }
        return null;
    }

    setStatusColor(type) {
        if (!this.container) return;
        
        // Always maintain centering when changing status
        this.positionTopCenter();
        
        // Remove all status color classes
        this.container.classList.remove('status-default', 'status-loading', 'status-success', 'status-error', 'status-warning');
        
        // Remove animation classes
        this.container.classList.remove('anim-loading', 'anim-error', 'anim-success');
        
        this.statusColor = type;
        
        switch (type) {
            case 'loading':
                this.container.classList.add('status-loading', 'anim-loading');
                break;
            case 'success':
                this.container.classList.add('status-success', 'anim-success');
                break;
            case 'error':
                this.container.classList.add('status-error', 'anim-error');
                break;
            case 'warning':
                this.container.classList.add('status-warning');
                break;
            default:
                this.container.classList.add('status-default');
        }
        
        // Ensure centering is maintained
        this.positionTopCenter();
    }

    updateNetworkStatus(status) {
        const networkIndicator = document.getElementById('network-indicator');
        if (!networkIndicator) return;
        
        networkIndicator.classList.remove('connected', 'connecting', 'disconnected', 'error');
        networkIndicator.classList.add(status.status);
        
        if (status.connected && status.networkInfo) {
            networkIndicator.title = `Connected: ${status.networkInfo.ip || 'Online'}`;
        } else if (status.status === 'connecting') {
            networkIndicator.title = 'Connecting to network...';
        } else if (status.status === 'error') {
            networkIndicator.title = 'Network connection error';
        } else {
            networkIndicator.title = 'Network disconnected';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createNetworkPanel() {
        const networkPanel = document.createElement('div');
        networkPanel.className = 'island-network-panel';
        networkPanel.id = 'island-network-panel';
        networkPanel.style.display = 'none';
        
        networkPanel.innerHTML = `
            <div class="network-panel-header">
                <div class="network-header-left">
                    <h3>Network Settings</h3>
                    <span class="network-badge" id="network-badge">Disconnected</span>
                </div>
                <button class="network-close-btn" onclick="window.dynamicIslandInstance?.exitNetworkMode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="network-panel-content">
                <div class="network-config">
                    <div class="form-group">
                        <label for="headscale-url">Headscale Server URL</label>
                        <input type="url" id="headscale-url" class="network-input" placeholder="Leave empty to use browser server" value="${this.emulator?.headscaleClient?.serverUrl || ''}">
                        <small style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 4px; display: block;">
                            Leave empty to automatically start a browser-based server
                        </small>
                    </div>
                    <div class="form-group">
                        <label for="headscale-api-key">API Key (Optional)</label>
                        <input type="password" id="headscale-api-key" class="network-input" placeholder="Enter API key if required">
                    </div>
                    <div class="network-status" id="network-status">
                        <div class="status-item">
                            <span class="status-label">Status:</span>
                            <span class="status-value" id="network-status-value">Disconnected</span>
                        </div>
                        <div class="status-item" id="network-ip-item" style="display: none;">
                            <span class="status-label">IP Address:</span>
                            <span class="status-value" id="network-ip-value">-</span>
                        </div>
                    </div>
                </div>
                <div class="network-actions">
                    <button class="network-action-btn" id="connect-network-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Connect
                    </button>
                    <button class="network-action-btn" id="disconnect-network-btn" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                        Disconnect
                    </button>
                </div>
            </div>
        `;
        
        this.container.appendChild(networkPanel);
        
        // Setup event listeners
        setTimeout(() => {
            const connectBtn = document.getElementById('connect-network-btn');
            const disconnectBtn = document.getElementById('disconnect-network-btn');
            const urlInput = document.getElementById('headscale-url');
            const apiKeyInput = document.getElementById('headscale-api-key');
            
            if (connectBtn && this.emulator && this.emulator.headscaleClient) {
                connectBtn.onclick = async () => {
                    let url = urlInput?.value || '';
                    const apiKey = apiKeyInput?.value || null;
                    
                    // If no URL provided, try to start BrowserPod server
                    if (!url) {
                        this.updateStatus('Starting browser server...', 0, 'loading');
                        try {
                            if (typeof BrowserPodHeadscale !== 'undefined') {
                                const browserpodServer = new BrowserPodHeadscale();
                                const result = await browserpodServer.start();
                                if (result.success) {
                                    url = result.url;
                                    urlInput.value = url;
                                    this.emulator.headscaleClient.browserpodServer = browserpodServer;
                                    this.updateStatus('Browser server started', 2000, 'success');
                                } else {
                                    throw new Error('Failed to start browser server');
                                }
                            } else {
                                throw new Error('BrowserPod not available. Please enter a Headscale server URL.');
                            }
                        } catch (error) {
                            this.updateStatus('Please enter Headscale server URL or enable BrowserPod', 3000, 'error');
                            return;
                        }
                    }
                    
                    this.emulator.headscaleClient.configure(url, apiKey);
                    this.updateStatus('Connecting to network...', 0, 'loading');
                    
                    try {
                        const result = await this.emulator.headscaleClient.connect();
                        this.updateStatus('Network connected', 3000, 'success');
                        this.refreshNetworkDisplay();
                    } catch (error) {
                        this.updateStatus(error.message, 5000, 'error');
                        this.refreshNetworkDisplay();
                    }
                };
            }
            
            if (disconnectBtn && this.emulator && this.emulator.headscaleClient) {
                disconnectBtn.onclick = async () => {
                    this.updateStatus('Disconnecting...', 0, 'loading');
                    try {
                        await this.emulator.headscaleClient.disconnect();
                        this.updateStatus('Network disconnected', 2000, 'default');
                        this.refreshNetworkDisplay();
                    } catch (error) {
                        this.updateStatus(error.message, 3000, 'error');
                    }
                };
            }
        }, 100);
    }

    enterNetworkMode() {
        this.state = 'network-mode';
        this.isExpanded = true;
        this.container.classList.add('network-mode');
        const networkPanel = document.getElementById('island-network-panel');
        if (networkPanel) {
            networkPanel.style.display = 'block';
        }
        this.container.style.width = 'auto';
        this.container.style.minWidth = '400px';
        this.container.style.maxWidth = '600px';
        this.container.style.height = 'auto';
        this.container.style.maxHeight = '70vh';
        
        this.refreshNetworkDisplay();
    }

    exitNetworkMode() {
        this.state = this.windowsReady ? 'compact' : 'boot-mode';
        this.isExpanded = false;
        this.container.classList.remove('network-mode');
        const networkPanel = document.getElementById('island-network-panel');
        if (networkPanel) {
            networkPanel.style.display = 'none';
        }
        this.container.style.width = 'auto';
        this.container.style.height = '40px';
        this.container.style.maxHeight = 'none';
        
        if (!this.windowsReady) {
            this.enterBootMode();
        } else {
            this.collapse();
        }
    }

    refreshNetworkDisplay() {
        if (!this.emulator || !this.emulator.headscaleClient) return;
        
        const status = this.emulator.headscaleClient.getStatus();
        const badge = document.getElementById('network-badge');
        const statusValue = document.getElementById('network-status-value');
        const ipValue = document.getElementById('network-ip-value');
        const ipItem = document.getElementById('network-ip-item');
        const connectBtn = document.getElementById('connect-network-btn');
        const disconnectBtn = document.getElementById('disconnect-network-btn');
        
        if (badge) {
            badge.textContent = status.connected ? 'Connected' : (status.status === 'connecting' ? 'Connecting...' : 'Disconnected');
            badge.className = `network-badge ${status.status}`;
        }
        
        if (statusValue) {
            statusValue.textContent = status.connected ? 'Connected' : (status.status === 'connecting' ? 'Connecting...' : 'Disconnected');
        }
        
        if (status.connected && status.networkInfo && status.networkInfo.ip) {
            if (ipValue) ipValue.textContent = status.networkInfo.ip;
            if (ipItem) ipItem.style.display = 'flex';
        } else {
            if (ipItem) ipItem.style.display = 'none';
        }
        
        if (connectBtn) {
            connectBtn.style.display = status.connected ? 'none' : 'flex';
        }
        
        if (disconnectBtn) {
            disconnectBtn.style.display = status.connected ? 'flex' : 'none';
        }
    }

    updateProgress(percent, statusText = null, totalBytes = null, loadedBytes = null) {
        if (!this.container) return;
        
        clearTimeout(this.autoHideTimeout);
        this.container.style.opacity = '1';
        
        const progressContainer = document.getElementById('island-progress-container');
        const progressBar = document.getElementById('island-progress-bar');
        const progressText = document.getElementById('island-progress-text');
        
        if (!progressContainer || !progressBar || !progressText) return;
        
        this.progress = Math.max(0, Math.min(100, percent));
        
        if (this.progress > 0 && this.progress < 100) {
            progressContainer.style.display = 'flex';
            progressBar.style.setProperty('--progress-width', this.progress + '%');
            
            const now = Date.now();
            if (!this.progressStartTime) {
                this.progressStartTime = now;
                this.progressLastUpdate = now;
                this.progressLastValue = 0;
            }
            
            let timeRemaining = '';
            
            if (this.progressLastValue > 0 && this.progress > this.progressLastValue) {
                const timeDiff = now - this.progressLastUpdate;
                const progressDiff = this.progress - this.progressLastValue;
                
                if (progressDiff > 0 && timeDiff > 0) {
                    const progressPerMs = progressDiff / timeDiff;
                    const remainingProgress = 100 - this.progress;
                    const estimatedMs = remainingProgress / progressPerMs;
                    
                    if (estimatedMs > 0 && estimatedMs < 3600000) {
                        const seconds = Math.ceil(estimatedMs / 1000);
                        if (seconds < 60) {
                            timeRemaining = `${seconds}s`;
                        } else {
                            const minutes = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            timeRemaining = `${minutes}m ${secs > 0 ? secs + 's' : ''}`;
                        }
                    }
                }
            }
            
            if (statusText) {
                this.updateStatus(statusText, 0);
            }
            
            let displayText = `${Math.round(this.progress)}%`;
            if (timeRemaining) {
                displayText += ` • ${timeRemaining} left`;
            }
            if (totalBytes && loadedBytes) {
                const loadedMB = (loadedBytes / 1024 / 1024).toFixed(1);
                const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
                displayText += ` • ${loadedMB}/${totalMB}MB`;
            }
            
            progressText.textContent = displayText;
            
            // Update boot panel
            if (this.state === 'boot-mode') {
                const bootProgress = document.getElementById('boot-progress-value');
                const bootTime = document.getElementById('boot-time-value');
                if (bootProgress) bootProgress.textContent = `${Math.round(this.progress)}%`;
                if (bootTime) bootTime.textContent = timeRemaining || 'Calculating...';
            }
            
            this.progressLastUpdate = now;
            this.progressLastValue = this.progress;
        } else {
            progressContainer.style.display = 'none';
            if (this.progress >= 100) {
                this.progressStartTime = null;
                this.progressLastUpdate = null;
                this.progressLastValue = 0;
                this.exitBootMode();
                this.startAutoHide();
            }
        }
    }

    setWindowsReady(ready) {
        this.windowsReady = ready;
        if (ready) {
            this.exitBootMode();
        } else {
            this.enterBootMode();
        }
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.classList.toggle('hidden', !this.isVisible);
            if (this.isVisible) {
                this.container.style.opacity = '1';
                this.container.style.visibility = 'visible';
                this.container.style.display = 'flex';
            } else {
                this.container.style.opacity = '0';
                this.container.style.visibility = 'hidden';
            }
        }
    }

    setAIEnabled(enabled) {
        this.aiEnabled = enabled;
        const indicator = document.getElementById('ai-indicator');
        if (indicator) {
            indicator.classList.toggle('active', enabled);
            indicator.title = enabled ? 'AI Assistant Active' : 'AI Assistant Inactive';
        }
    }

    setEmulator(emulator) {
        this.emulator = emulator;
    }

    // Update storage status
    updateStorageStatus() {
        if (this.emulator && this.emulator.storageManager) {
            const stats = this.emulator.storageManager.getStats();
            const totalGB = (stats.totalSize / (1024 * 1024 * 1024)).toFixed(2);
            const cacheMB = (stats.cacheSize / (1024 * 1024)).toFixed(1);
            
            // Update status with storage info
            const storageText = `${stats.fileCount} files • ${totalGB}GB stored`;
            this.updateStatus(storageText, 5000);
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.DynamicIsland = DynamicIsland;
    // Store instance globally for chat close button
    window.dynamicIslandInstance = null;
}
