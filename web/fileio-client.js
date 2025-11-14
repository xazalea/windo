// File.IO API Client
// Provides unlimited cloud storage for Windows VM files
class FileIOClient {
    constructor() {
        // Use proxy to avoid CORS issues, fallback to direct URL
        this.baseUrl = '/api/fileio-proxy';
        this.directUrl = 'https://file.io';
        this.apiKey = localStorage.getItem('fileio_api_key') || null;
        this.files = new Map(); // Cache of file metadata
        this.storageIndex = null; // Index of all stored files
    }

    // Set API key (optional, for authenticated requests)
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('fileio_api_key', key);
    }

    // Upload a file to File.IO
    async uploadFile(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            if (options.expires) {
                formData.append('expires', options.expires);
            }
            if (options.maxDownloads) {
                formData.append('maxDownloads', options.maxDownloads.toString());
            }
            if (options.autoDelete !== undefined) {
                formData.append('autoDelete', options.autoDelete.toString());
            }

            const headers = {};
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            // Try proxy first
            let response = await fetch(`${this.baseUrl}/`, {
                method: 'POST',
                body: formData,
                headers: headers
            });

            // If proxy returns 404, try direct URL (may fail due to CORS)
            if (!response.ok && response.status === 404) {
                console.warn('File.IO proxy not available, trying direct URL (may fail due to CORS)');
                response = await fetch(`${this.directUrl}/`, {
                    method: 'POST',
                    body: formData,
                    headers: headers
                });
            }

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Cache file metadata
                this.files.set(data.key, {
                    key: data.key,
                    name: data.name || file.name,
                    link: data.link,
                    size: data.size,
                    mimeType: data.mimeType,
                    expires: data.expires,
                    maxDownloads: data.maxDownloads,
                    autoDelete: data.autoDelete,
                    created: data.created
                });
                
                return data;
            } else {
                throw new Error('Upload failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('File.IO upload error:', error);
            throw error;
        }
    }

    // Download a file from File.IO
    async downloadFile(key) {
        try {
            // Try proxy first
            let response = await fetch(`${this.baseUrl}/${key}`, {
                method: 'GET',
                redirect: 'follow'
            });

            // If proxy returns 404, try direct URL
            if (!response.ok && response.status === 404) {
                response = await fetch(`${this.directUrl}/${key}`, {
                    method: 'GET',
                    redirect: 'follow'
                });
            }

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('File.IO download error:', error);
            throw error;
        }
    }

    // Get file metadata
    async getFileInfo(key) {
        // Check cache first
        if (this.files.has(key)) {
            return this.files.get(key);
        }

        try {
            // File.IO doesn't have a direct metadata endpoint
            // We'll need to list files or use the key directly
            const list = await this.listFiles();
            const file = list.files.find(f => f.key === key);
            
            if (file) {
                this.files.set(key, file);
                return file;
            }
            
            return null;
        } catch (error) {
            console.error('File.IO get info error:', error);
            return null;
        }
    }

    // List all files
    async listFiles(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.search) params.append('search', options.search);
            if (options.sort) params.append('sort', options.sort);
            if (options.offset) params.append('offset', options.offset.toString());
            if (options.limit) params.append('limit', options.limit.toString());

            const headers = {};
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const url = `${this.baseUrl}/?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`List files failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Update cache
            if (data.files) {
                data.files.forEach(file => {
                    this.files.set(file.key, file);
                });
            }
            
            return data;
        } catch (error) {
            console.error('File.IO list files error:', error);
            throw error;
        }
    }

    // Delete a file
    async deleteFile(key) {
        try {
            const headers = {};
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            // Try proxy first
            let response = await fetch(`${this.baseUrl}/${key}`, {
                method: 'DELETE',
                headers: headers
            });

            // If proxy returns 404, try direct URL
            if (!response.ok && response.status === 404) {
                response = await fetch(`${this.directUrl}/${key}`, {
                    method: 'DELETE',
                    headers: headers
                });
            }

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Remove from cache
            this.files.delete(key);
            
            return data;
        } catch (error) {
            console.error('File.IO delete error:', error);
            throw error;
        }
    }

    // Update file metadata
    async updateFile(key, options = {}) {
        try {
            const formData = new FormData();
            
            if (options.expires) {
                formData.append('expires', options.expires);
            }
            if (options.maxDownloads) {
                formData.append('maxDownloads', options.maxDownloads.toString());
            }
            if (options.autoDelete !== undefined) {
                formData.append('autoDelete', options.autoDelete.toString());
            }

            const headers = {};
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const response = await fetch(`${this.baseUrl}/${key}`, {
                method: 'PATCH',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Update failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.key) {
                // Update cache
                this.files.set(key, {
                    key: data.key,
                    name: data.name,
                    link: data.link,
                    size: data.size,
                    mimeType: data.mimeType,
                    expires: data.expires,
                    maxDownloads: data.maxDownloads,
                    autoDelete: data.autoDelete,
                    created: data.created,
                    modified: data.modified
                });
            }
            
            return data;
        } catch (error) {
            console.error('File.IO update error:', error);
            throw error;
        }
    }

    // Get account/plan details
    async getAccountInfo() {
        try {
            const headers = {};
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            } else {
                throw new Error('API key required for account info');
            }

            const response = await fetch(`${this.baseUrl}/me`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Get account info failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('File.IO account info error:', error);
            throw error;
        }
    }

    // Upload a blob/file as ArrayBuffer
    async uploadBlob(blob, filename, options = {}) {
        const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
        return await this.uploadFile(file, options);
    }

    // Download file as ArrayBuffer
    async downloadFileAsArrayBuffer(key) {
        const blob = await this.downloadFile(key);
        return await blob.arrayBuffer();
    }
}

// Export
if (typeof window !== 'undefined') {
    window.FileIOClient = FileIOClient;
}

