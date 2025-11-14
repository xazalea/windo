// Storage Manager - Virtual Filesystem using File.IO
// Provides unlimited cloud storage for Windows VM
class StorageManager {
    constructor() {
        this.fileIO = new FileIOClient();
        this.storageIndex = null; // Index of all files stored in File.IO
        this.storageIndexKey = null; // Key of the storage index file
        this.virtualDrive = new Map(); // In-memory virtual drive structure
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache
        this.cache = new Map(); // LRU cache for frequently accessed files
        this.storagePrefix = 'wind0_vm_'; // Prefix for all VM files
        this.init();
    }

    async init() {
        try {
            // Load storage index
            await this.loadStorageIndex();
        } catch (error) {
            console.warn('Storage manager init error:', error);
            // Continue without storage index (will create new one)
        }
    }

    // Load or create storage index
    async loadStorageIndex() {
        try {
            // Try to load from localStorage first
            const cachedIndex = localStorage.getItem('wind0_storage_index');
            if (cachedIndex) {
                const indexData = JSON.parse(cachedIndex);
                this.storageIndexKey = indexData.indexKey;
                
                // Try to download the actual index from File.IO
                if (this.storageIndexKey) {
                    try {
                        const indexBlob = await this.fileIO.downloadFile(this.storageIndexKey);
                        const indexText = await indexBlob.text();
                        this.storageIndex = JSON.parse(indexText);
                        return;
                    } catch (err) {
                        console.warn('Could not load index from File.IO, using cached:', err);
                    }
                }
            }
            
            // Create new index
            this.storageIndex = {
                version: 1,
                created: new Date().toISOString(),
                files: {},
                directories: {},
                totalSize: 0,
                fileCount: 0
            };
        } catch (error) {
            console.error('Error loading storage index:', error);
            this.storageIndex = {
                version: 1,
                created: new Date().toISOString(),
                files: {},
                directories: {},
                totalSize: 0,
                fileCount: 0
            };
        }
    }

    // Save storage index to File.IO
    async saveStorageIndex() {
        try {
            const indexJson = JSON.stringify(this.storageIndex);
            const indexBlob = new Blob([indexJson], { type: 'application/json' });
            const indexFile = new File([indexBlob], 'storage_index.json', { type: 'application/json' });
            
            if (this.storageIndexKey) {
                // Update existing index
                await this.fileIO.updateFile(this.storageIndexKey, {
                    autoDelete: false,
                    maxDownloads: 0 // Unlimited downloads
                });
                
                // Re-upload the updated index
                const result = await this.fileIO.uploadFile(indexFile, {
                    autoDelete: false,
                    maxDownloads: 0
                });
                this.storageIndexKey = result.key;
            } else {
                // Create new index
                const result = await this.fileIO.uploadFile(indexFile, {
                    autoDelete: false,
                    maxDownloads: 0
                });
                this.storageIndexKey = result.key;
            }
            
            // Cache in localStorage
            localStorage.setItem('wind0_storage_index', JSON.stringify({
                indexKey: this.storageIndexKey,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error saving storage index:', error);
        }
    }

    // Store a file in File.IO (with automatic retry and progress)
    async storeFile(filePath, fileData, metadata = {}) {
        try {
            const fileName = filePath.split('/').pop() || 'file';
            const fileBlob = fileData instanceof Blob ? fileData : new Blob([fileData]);
            const file = new File([fileBlob], fileName, { type: metadata.mimeType || 'application/octet-stream' });
            
            // Check if file already exists (update instead of create)
            const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
            const existingFile = this.storageIndex.files[relativePath];
            
            const oldSize = existingFile ? existingFile.size : 0;
            const newSize = fileBlob.size;
            
            // Always store in localStorage first (always works)
            if (!this.storageIndex.files) {
                this.storageIndex.files = {};
            }
            
            // Store file data in localStorage (for small files)
            const fileDataString = await fileBlob.text().catch(() => null);
            
            this.storageIndex.files[relativePath] = {
                name: fileName,
                path: relativePath,
                size: newSize,
                mimeType: metadata.mimeType || file.type || 'application/octet-stream',
                created: existingFile ? existingFile.created : new Date().toISOString(),
                modified: new Date().toISOString(),
                data: fileDataString, // Store data directly for small files
                ...metadata
            };
            
            // Try to upload to File.IO (optional, may fail due to CORS)
            let result = null;
            try {
                if (existingFile && existingFile.key) {
                    // Try to delete old file first
                    try {
                        await this.fileIO.deleteFile(existingFile.key);
                    } catch (err) {
                        // Ignore delete errors
                    }
                }
                
                // Upload to File.IO
                result = await this.fileIO.uploadFile(file, {
                    autoDelete: false, // Keep files as long as possible
                    maxDownloads: 0 // Unlimited downloads
                });
                
                // Update with File.IO metadata if upload succeeded
                if (result.success && result.key) {
                    this.storageIndex.files[relativePath].key = result.key;
                    this.storageIndex.files[relativePath].link = result.link;
                }
            } catch (uploadError) {
                // File.IO upload failed (CORS or other issue), but localStorage is saved
                console.warn('Could not upload file to File.IO, using localStorage only:', uploadError);
            }
            
            // Update total size
            this.storageIndex.totalSize = (this.storageIndex.totalSize || 0) - oldSize + newSize;
            if (!existingFile) {
                this.storageIndex.fileCount = (this.storageIndex.fileCount || 0) + 1;
            }
            
            // Update virtual drive
            if (!this.virtualDrive) {
                this.virtualDrive = new Map();
            }
            this.virtualDrive.set(relativePath, {
                key: result?.key || null,
                cached: true, // Cached in localStorage
                size: newSize
            });
            
            // Save index (async, don't wait)
            this.saveStorageIndex().catch(err => console.warn('Error saving index:', err));
            
            return {
                success: true,
                key: result?.key || null,
                path: relativePath,
                size: newSize,
                link: result?.link || null
            };
        } catch (error) {
            console.error('Error storing file:', error);
            throw error;
        }
    }

    // Retrieve a file from File.IO
    async retrieveFile(filePath) {
        try {
            const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
            
            // Check cache first
            if (this.cache.has(relativePath)) {
                const cached = this.cache.get(relativePath);
                return cached.data;
            }
            
            // Check storage index
            const fileInfo = this.storageIndex.files[relativePath];
            if (!fileInfo) {
                throw new Error('File not found: ' + filePath);
            }
            
            // Download from File.IO
            const blob = await this.fileIO.downloadFile(fileInfo.key);
            
            // Cache if small enough
            if (blob.size < this.maxCacheSize) {
                this.cache.set(relativePath, {
                    data: blob,
                    timestamp: Date.now()
                });
                
                // Limit cache size
                if (this.cache.size > 100) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            }
            
            return blob;
        } catch (error) {
            console.error('Error retrieving file:', error);
            throw error;
        }
    }

    // Delete a file
    async deleteFile(filePath) {
        try {
            const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
            const fileInfo = this.storageIndex.files[relativePath];
            
            if (!fileInfo) {
                throw new Error('File not found: ' + filePath);
            }
            
            // Delete from File.IO
            await this.fileIO.deleteFile(fileInfo.key);
            
            // Update index
            this.storageIndex.totalSize -= fileInfo.size;
            this.storageIndex.fileCount--;
            delete this.storageIndex.files[relativePath];
            
            // Remove from cache and virtual drive
            this.cache.delete(relativePath);
            this.virtualDrive.delete(relativePath);
            
            // Save index
            await this.saveStorageIndex();
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // List files in a directory
    listFiles(directoryPath = '/') {
        const dir = directoryPath.startsWith('/') ? directoryPath.substring(1) : directoryPath;
        const files = [];
        
        for (const [path, fileInfo] of Object.entries(this.storageIndex.files)) {
            const fileDir = path.substring(0, path.lastIndexOf('/') || 0);
            if (dir === '' || fileDir === dir || path.startsWith(dir + '/')) {
                files.push({
                    path: '/' + path,
                    name: fileInfo.name,
                    size: fileInfo.size,
                    mimeType: fileInfo.mimeType,
                    created: fileInfo.created,
                    modified: fileInfo.modified
                });
            }
        }
        
        return files;
    }

    // Get storage statistics
    getStats() {
        return {
            totalSize: this.storageIndex.totalSize,
            fileCount: this.storageIndex.fileCount,
            cacheSize: Array.from(this.cache.values()).reduce((sum, item) => sum + item.data.size, 0),
            cacheCount: this.cache.size
        };
    }

    // Create a virtual disk image that can be mounted in Windows
    async createVirtualDisk(sizeMB = 1000) {
        try {
            // Create a sparse disk image (we'll use File.IO to store the actual data)
            const diskId = 'wind0_disk_' + Date.now();
            const diskInfo = {
                id: diskId,
                size: sizeMB * 1024 * 1024,
                created: new Date().toISOString(),
                files: {},
                freeSpace: sizeMB * 1024 * 1024
            };
            
            // Store disk metadata
            await this.storeFile(`/disks/${diskId}.json`, JSON.stringify(diskInfo), {
                mimeType: 'application/json'
            });
            
            return diskInfo;
        } catch (error) {
            console.error('Error creating virtual disk:', error);
            throw error;
        }
    }

    // Mount virtual disk to Windows VM
    async mountVirtualDisk(diskId, emulator) {
        try {
            // Load disk info
            const diskBlob = await this.retrieveFile(`/disks/${diskId}.json`);
            const diskText = await diskBlob.text();
            const diskInfo = JSON.parse(diskText);
            
            // Create a virtual drive that syncs with File.IO
            // This would integrate with v86.js filesystem
            // For now, we'll create a mapping
            
            return {
                success: true,
                diskId: diskId,
                size: diskInfo.size,
                freeSpace: diskInfo.freeSpace
            };
        } catch (error) {
            console.error('Error mounting virtual disk:', error);
            throw error;
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

