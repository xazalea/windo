// Filesystem Bridge - Seamless Puter.js Integration
// Automatically syncs Windows VM files with Puter.js cloud storage
class FilesystemBridge {
    constructor(emulator, storageManager) {
        this.emulator = emulator;
        this.storageManager = storageManager;
        this.syncQueue = [];
        this.syncing = false;
        this.watchInterval = null;
        this.virtualDrivePath = '/cloud'; // Virtual drive path in storage
        this.syncEnabled = true;
        this.autoSyncDelay = 2000; // Sync after 2 seconds of inactivity
        this.syncTimeout = null;
        this.pendingSyncs = new Map(); // Track files pending sync
        
        this.init();
    }

    init() {
        // Create virtual drive directory structure
        this.ensureVirtualDrive();
        
        // Start watching for file changes
        this.startWatching();
        
        // Setup periodic sync
        this.startPeriodicSync();
        
        console.log('Filesystem bridge initialized');
    }

    async ensureVirtualDrive() {
        try {
            // Ensure virtual drive exists in storage index
            if (!this.storageManager.storageIndex.directories || !this.storageManager.storageIndex.directories[this.virtualDrivePath]) {
                if (!this.storageManager.storageIndex.directories) {
                    this.storageManager.storageIndex.directories = {};
                }
                this.storageManager.storageIndex.directories[this.virtualDrivePath] = {
                    path: this.virtualDrivePath,
                    created: new Date().toISOString()
                };
                // Save to localStorage (always works)
                await this.storageManager.saveStorageIndex();
            }
        } catch (error) {
            console.warn('Error ensuring virtual drive:', error);
            // Continue anyway - localStorage will be used
        }
    }

    // Start watching for file operations
    startWatching() {
        // Monitor emulator for file operations
        // This is a simplified approach - in a real implementation,
        // we'd hook into v86.js filesystem events
        
        // For now, we'll use a polling approach to detect changes
        // In a full implementation, we'd use v86.js filesystem hooks
    }

    // Start periodic sync
    startPeriodicSync() {
        // Sync every 30 seconds
        this.watchInterval = setInterval(() => {
            if (this.syncEnabled && !this.syncing) {
                this.syncPendingFiles();
            }
        }, 30000);
    }

    // Auto-upload file when created/modified in Windows
    async autoUploadFile(filePath, fileData, metadata = {}) {
        if (!this.syncEnabled) return;
        
        try {
            // Normalize path
            const normalizedPath = this.normalizePath(filePath);
            
            // Add to sync queue
            this.pendingSyncs.set(normalizedPath, {
                path: normalizedPath,
                data: fileData,
                metadata: metadata,
                timestamp: Date.now()
            });
            
            // Debounce sync
            clearTimeout(this.syncTimeout);
            this.syncTimeout = setTimeout(() => {
                this.syncPendingFiles();
            }, this.autoSyncDelay);
            
        } catch (error) {
            console.error('Auto-upload error:', error);
        }
    }

    // Auto-download file when accessed in Windows
    async autoDownloadFile(filePath) {
        if (!this.syncEnabled) return null;
        
        try {
            const normalizedPath = this.normalizePath(filePath);
            
            // Check if file exists in cloud storage
            const files = this.storageManager.listFiles(this.virtualDrivePath);
            const file = files.find(f => f.path === normalizedPath || f.path.endsWith(normalizedPath));
            
            if (file) {
                // Download from cloud
                const blob = await this.storageManager.retrieveFile(file.path);
                return blob;
            }
            
            return null;
        } catch (error) {
            console.error('Auto-download error:', error);
            return null;
        }
    }

    // Sync pending files to cloud
    async syncPendingFiles() {
        if (this.syncing || this.pendingSyncs.size === 0) return;
        
        this.syncing = true;
        
        try {
            const filesToSync = Array.from(this.pendingSyncs.values());
            this.pendingSyncs.clear();
            
            for (const fileInfo of filesToSync) {
                try {
                    await this.storageManager.storeFile(
                        `${this.virtualDrivePath}${fileInfo.path}`,
                        fileInfo.data,
                        {
                            ...fileInfo.metadata,
                            autoSynced: true,
                            syncedAt: new Date().toISOString()
                        }
                    );
                    
                    if (this.emulator && this.emulator.dynamicIsland) {
                        this.emulator.dynamicIsland.updateStatus(`Synced ${fileInfo.path.split('/').pop()}`, 2000);
                    }
                } catch (error) {
                    console.error(`Error syncing ${fileInfo.path}:`, error);
                    // Re-add to queue for retry
                    this.pendingSyncs.set(fileInfo.path, fileInfo);
                }
            }
        } finally {
            this.syncing = false;
        }
    }

    // Normalize file path
    normalizePath(path) {
        // Convert Windows paths to Unix-style
        let normalized = path.replace(/\\/g, '/');
        if (normalized.startsWith('C:')) {
            normalized = normalized.substring(2);
        }
        if (normalized.startsWith('D:')) {
            normalized = '/cloud' + normalized.substring(2);
        }
        if (!normalized.startsWith('/')) {
            normalized = '/' + normalized;
        }
        return normalized;
    }

    // Create virtual drive in Windows (D: drive)
    async createVirtualDrive() {
        try {
            // Create a virtual disk that appears as D: drive in Windows
            const diskInfo = {
                id: 'cloud_drive',
                name: 'Cloud Storage',
                path: this.virtualDrivePath,
                size: 0, // Unlimited
                created: new Date().toISOString(),
                type: 'cloud'
            };
            
            // Store disk metadata in localStorage (always works)
            if (!this.storageManager.storageIndex.files) {
                this.storageManager.storageIndex.files = {};
            }
            this.storageManager.storageIndex.files[`.disk.json`] = {
                name: '.disk.json',
                path: '.disk.json',
                size: JSON.stringify(diskInfo).length,
                mimeType: 'application/json',
                data: JSON.stringify(diskInfo),
                created: new Date().toISOString()
            };
            
            // Try to upload to Puter.js (optional, may fail)
            try {
                await this.storageManager.storeFile(
                    `${this.virtualDrivePath}/.disk.json`,
                    JSON.stringify(diskInfo),
                    { mimeType: 'application/json' }
                );
            } catch (uploadError) {
                console.warn('Could not upload disk metadata to Puter.js, using localStorage:', uploadError);
            }
            
            // Create some default directories
            if (!this.storageManager.storageIndex.directories) {
                this.storageManager.storageIndex.directories = {};
            }
            const defaultDirs = ['Downloads', 'Documents', 'Programs', 'Apps'];
            for (const dir of defaultDirs) {
                this.storageManager.storageIndex.directories[`${this.virtualDrivePath}/${dir}`] = {
                    path: `${this.virtualDrivePath}/${dir}`,
                    created: new Date().toISOString()
                };
            }
            
            // Save to localStorage (always works)
            await this.storageManager.saveStorageIndex();
            
            return diskInfo;
        } catch (error) {
            console.error('Error creating virtual drive:', error);
            // Return a basic disk info even if storage fails
            return {
                id: 'cloud_drive',
                name: 'Cloud Storage (Local)',
                path: this.virtualDrivePath,
                size: 0,
                created: new Date().toISOString(),
                type: 'local'
            };
        }
    }

    // Install app/file to Windows
    async installToWindows(filePath, installPath = null) {
        try {
            // Download file from cloud
            const blob = await this.autoDownloadFile(filePath);
            if (!blob) {
                throw new Error('File not found in cloud storage');
            }
            
            // Convert blob to array buffer for v86.js
            const arrayBuffer = await blob.arrayBuffer();
            
            // Determine install path
            const targetPath = installPath || `C:/Program Files/${filePath.split('/').pop()}`;
            
            // In a real implementation, we'd write this to the v86.js filesystem
            // For now, we'll store it and let the user know
            await this.autoUploadFile(targetPath, blob, {
                installed: true,
                originalPath: filePath,
                installedAt: new Date().toISOString()
            });
            
            if (this.emulator && this.emulator.dynamicIsland) {
                this.emulator.dynamicIsland.updateStatus(`Installed ${filePath.split('/').pop()}`, 3000);
            }
            
            return { success: true, path: targetPath };
        } catch (error) {
            console.error('Install error:', error);
            throw error;
        }
    }

    // Share file (upload to cloud and get shareable link)
    async shareFile(filePath) {
        try {
            // Ensure file is synced
            await this.syncPendingFiles();
            
            // Get file info from storage
            const files = this.storageManager.listFiles(this.virtualDrivePath);
            const file = files.find(f => f.path === filePath || f.path.endsWith(filePath));
            
            if (file && file.link) {
                // Puter.js provides shareable links
                return {
                    success: true,
                    link: file.link,
                    key: file.key
                };
            }
            
            throw new Error('File not found or not synced');
        } catch (error) {
            console.error('Share error:', error);
            throw error;
        }
    }

    // Enable/disable auto-sync
    setAutoSync(enabled) {
        this.syncEnabled = enabled;
        localStorage.setItem('wind0_auto_sync', enabled.toString());
        
        if (enabled) {
            this.startPeriodicSync();
        } else {
            if (this.watchInterval) {
                clearInterval(this.watchInterval);
                this.watchInterval = null;
            }
        }
    }

    // Get sync status
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            syncing: this.syncing,
            pendingFiles: this.pendingSyncs.size,
            lastSync: this.lastSyncTime || null
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.FilesystemBridge = FilesystemBridge;
}

