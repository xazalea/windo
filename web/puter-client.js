// Puter.js API Client
// Provides unlimited cloud storage for Windows VM files using Puter.js
class PuterClient {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
    }

    // Initialize Puter.js (ensure script is loaded)
    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            // Check if puter is already loaded
            if (typeof puter !== 'undefined' && puter.fs) {
                this.initialized = true;
                return;
            }

            // Wait for puter to be available (script might be loading)
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds max wait

                const checkPuter = () => {
                    if (typeof puter !== 'undefined' && puter.fs) {
                        this.initialized = true;
                        resolve();
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(checkPuter, 100);
                    } else {
                        reject(new Error('Puter.js failed to load. Make sure the script is included.'));
                    }
                };

                checkPuter();
            });
        })();

        return this.initPromise;
    }

    // Upload a file to Puter.js cloud storage
    async uploadFile(file, options = {}) {
        await this.init();
        
        try {
            const fileName = options.path || file.name || 'file';
            const path = options.directory ? `${options.directory}/${fileName}` : fileName;

            // Write file to Puter.js storage
            await puter.fs.write(path, file, {
                dedupeName: options.dedupeName !== false,
                createMissingParents: true
            });

            // Get file info
            const stat = await puter.fs.stat(path);
            
            // Get readable URL if needed
            let readURL = null;
            try {
                readURL = await puter.fs.getReadURL(path);
            } catch (err) {
                // getReadURL might not be available in all versions
                console.warn('getReadURL not available:', err);
            }

            return {
                success: true,
                key: path, // Use path as key for Puter.js
                path: path,
                name: stat.name,
                size: stat.size,
                mimeType: file.type || 'application/octet-stream',
                link: readURL,
                created: stat.created,
                modified: stat.modified
            };
        } catch (error) {
            console.error('Puter.js upload error:', error);
            throw error;
        }
    }

    // Download a file from Puter.js cloud storage
    async downloadFile(path) {
        await this.init();
        
        try {
            const blob = await puter.fs.read(path);
            return blob;
        } catch (error) {
            console.error('Puter.js download error:', error);
            throw error;
        }
    }

    // Get file metadata
    async getFileInfo(path) {
        await this.init();
        
        try {
            const stat = await puter.fs.stat(path);
            return {
                key: path,
                path: path,
                name: stat.name,
                size: stat.size,
                is_dir: stat.is_dir,
                created: stat.created,
                modified: stat.modified
            };
        } catch (error) {
            console.error('Puter.js get info error:', error);
            return null;
        }
    }

    // List files in a directory
    async listFiles(directoryPath = '/', options = {}) {
        await this.init();
        
        try {
            const items = await puter.fs.readdir(directoryPath);
            
            const files = items.map(item => ({
                key: item.path || item.name,
                path: item.path || item.name,
                name: item.name,
                size: item.size || 0,
                is_dir: item.is_dir || false,
                created: item.created,
                modified: item.modified
            }));

            return {
                files: files,
                count: files.length
            };
        } catch (error) {
            console.error('Puter.js list files error:', error);
            throw error;
        }
    }

    // Delete a file
    async deleteFile(path) {
        await this.init();
        
        try {
            await puter.fs.delete(path);
            return {
                success: true
            };
        } catch (error) {
            console.error('Puter.js delete error:', error);
            throw error;
        }
    }

    // Update file (rename or move)
    async updateFile(oldPath, options = {}) {
        await this.init();
        
        try {
            if (options.newPath) {
                // Move/rename file
                await puter.fs.move(oldPath, options.newPath);
                return {
                    success: true,
                    key: options.newPath,
                    path: options.newPath
                };
            } else {
                // Just return current file info
                return await this.getFileInfo(oldPath);
            }
        } catch (error) {
            console.error('Puter.js update error:', error);
            throw error;
        }
    }

    // Copy a file
    async copyFile(sourcePath, destPath) {
        await this.init();
        
        try {
            await puter.fs.copy(sourcePath, destPath);
            return {
                success: true,
                key: destPath,
                path: destPath
            };
        } catch (error) {
            console.error('Puter.js copy error:', error);
            throw error;
        }
    }

    // Create directory
    async createDirectory(path) {
        await this.init();
        
        try {
            await puter.fs.mkdir(path, { createMissingParents: true });
            return {
                success: true,
                path: path
            };
        } catch (error) {
            console.error('Puter.js create directory error:', error);
            throw error;
        }
    }

    // Upload a blob/file as ArrayBuffer
    async uploadBlob(blob, filename, options = {}) {
        const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
        return await this.uploadFile(file, options);
    }

    // Download file as ArrayBuffer
    async downloadFileAsArrayBuffer(path) {
        const blob = await this.downloadFile(path);
        return await blob.arrayBuffer();
    }

    // Get readable URL for a file
    async getReadURL(path) {
        await this.init();
        
        try {
            return await puter.fs.getReadURL(path);
        } catch (error) {
            console.error('Puter.js getReadURL error:', error);
            return null;
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.PuterClient = PuterClient;
    // Also export as FileIOClient for backward compatibility during migration
    window.FileIOClient = PuterClient;
}

