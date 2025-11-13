// API Client for Azalea Node.js Backend Server
// Provides enhanced capabilities and performance

class AzaleaAPIClient {
    constructor(serverUrl = 'http://localhost:3001') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Connect to WebSocket server
    connectWebSocket() {
        try {
            const wsUrl = this.serverUrl.replace('http', 'ws');
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to Azalea server');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.onConnected();
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected = false;
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connectWebSocket();
            }, 2000 * this.reconnectAttempts);
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'connected':
                console.log('Server capabilities:', data.capabilities);
                break;
            case 'pong':
                // Heartbeat response
                break;
            case 'image_progress':
                if (this.onImageProgress) {
                    this.onImageProgress(data.progress);
                }
                break;
            case 'optimize_response':
                if (this.onOptimizeResponse) {
                    this.onOptimizeResponse(data);
                }
                break;
        }
    }

    onConnected() {
        // Override in implementation
    }

    // Check server health
    async checkHealth() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    }

    // Get available images
    async getImages() {
        try {
            const response = await fetch(`${this.serverUrl}/api/images`);
            const data = await response.json();
            return data.images || [];
        } catch (error) {
            console.error('Failed to get images:', error);
            return [];
        }
    }

    // Upload Windows image
    async uploadImage(file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = (e.loaded / e.total) * 100;
                    onProgress(percent);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = () => {
                reject(new Error('Upload failed'));
            };
            
            xhr.open('POST', `${this.serverUrl}/api/images/upload`);
            xhr.send(formData);
        });
    }

    // Cache image from URL
    async cacheImage(url, filename) {
        try {
            const response = await fetch(`${this.serverUrl}/api/images/cache`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, filename })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to cache image:', error);
            throw error;
        }
    }

    // Get image URL (from server cache)
    getImageUrl(filename) {
        return `${this.serverUrl}/api/images/${filename}`;
    }

    // Optimize image
    async optimizeImage(action, config) {
        try {
            const response = await fetch(`${this.serverUrl}/api/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, config })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Optimization failed:', error);
            throw error;
        }
    }

    // Preload image for faster loading
    async preloadImage(filename) {
        return this.optimizeImage('preload', { filename });
    }

    // Send WebSocket message
    sendMessage(type, data = {}) {
        if (this.ws && this.connected) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.warn('WebSocket not connected');
        }
    }

    // Disconnect
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.AzaleaAPIClient = AzaleaAPIClient;
}

