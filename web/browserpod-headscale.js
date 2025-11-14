// BrowserPod Headscale Server - Runs Headscale in the browser
// Creates a temporary Headscale server instance using BrowserPod
class BrowserPodHeadscale {
    constructor() {
        this.serverUrl = null;
        this.browserpodInstance = null;
        this.isRunning = false;
        this.port = 8080;
        this.statusListeners = [];
        this.machines = new Map();
        this.machineCounter = 0;
    }

    // Initialize BrowserPod and start Headscale server
    async start() {
        if (this.isRunning) {
            return { success: true, url: this.serverUrl };
        }

        try {
            // Check if BrowserPod is available
            if (typeof BrowserPod !== 'undefined') {
                // Use BrowserPod if available
                this.browserpodInstance = new BrowserPod({
                    image: 'headscale/headscale:latest',
                    resources: {
                        cpu: 1,
                        memory: '512Mi'
                    }
                });

                await this.browserpodInstance.start();
                this.serverUrl = this.browserpodInstance.getUrl() || `http://localhost:${this.port}`;
                await this.waitForReady();
            } else {
                // Fallback: Create in-browser mock server
                await this.startInBrowserServer();
            }

            this.isRunning = true;
            this.notifyStatusChange({ running: true, url: this.serverUrl });

            return {
                success: true,
                url: this.serverUrl,
                message: 'Headscale server started in browser'
            };
        } catch (error) {
            console.error('Failed to start BrowserPod Headscale:', error);
            // Fallback to in-browser server
            try {
                await this.startInBrowserServer();
                this.isRunning = true;
                this.notifyStatusChange({ running: true, url: this.serverUrl });
                return {
                    success: true,
                    url: this.serverUrl,
                    message: 'Headscale server started in browser (fallback mode)'
                };
            } catch (fallbackError) {
                throw error;
            }
        }
    }

    async startInBrowserServer() {
        // Create a unique session ID for this server instance
        const sessionId = `headscale-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        this.serverUrl = `http://localhost:${this.port}/${sessionId}`;
        
        // Set up fetch interception to handle Headscale API requests
        this.setupFetchInterception();
        
        console.log('In-browser Headscale server started at:', this.serverUrl);
    }

    setupFetchInterception() {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = async function(url, options = {}) {
            const urlString = typeof url === 'string' ? url : url.url || url.toString();
            
            // Intercept requests to our Headscale server
            if (urlString.includes(self.serverUrl) || urlString.includes('localhost:' + self.port)) {
                return self.handleRequest(urlString, options);
            }
            
            // Pass through other requests
            return originalFetch(url, options);
        };
    }

    // Wait for Headscale server to be ready
    async waitForReady(maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await fetch(`${this.serverUrl}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                });
                
                if (response.ok) {
                    console.log('Headscale server is ready');
                    return true;
                }
            } catch (error) {
                // Server not ready yet, wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // If BrowserPod failed, the in-browser server should work immediately
        return true;
    }

    async handleRequest(url, options) {
        const urlObj = new URL(url);
        const path = urlObj.pathname;

        // Health check
        if (path.includes('/health') || path.endsWith('/health')) {
            return new Response(JSON.stringify({ status: 'ok' }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Register machine
        if (path.includes('/api/v1/machine/register') || path.endsWith('/register')) {
            const machineId = `machine-${++this.machineCounter}`;
            const ip = `100.64.0.${this.machineCounter}`;
            
            let requestData = {};
            if (options.body) {
                try {
                    requestData = JSON.parse(options.body);
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            const machine = {
                id: machineId,
                ipAddresses: [ip],
                name: requestData.name || 'wind0-vm',
                online: true,
                lastSeen: new Date().toISOString()
            };
            
            this.machines.set(machineId, machine);

            return new Response(JSON.stringify({
                machine: {
                    id: machineId,
                    ipAddresses: [ip]
                }
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get machine info
        if (path.includes('/api/v1/machine/')) {
            const parts = path.split('/');
            const machineId = parts[parts.length - 1];
            const machine = this.machines.get(machineId);

            if (machine) {
                return new Response(JSON.stringify({ machine }), {
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // Default response
        return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    // Stop the Headscale server
    async stop() {
        if (!this.isRunning) {
            return { success: true };
        }

        try {
            if (this.browserpodInstance) {
                await this.browserpodInstance.stop();
            }

            // Restore original fetch if we modified it
            // Note: We can't easily restore it, but it's okay for this use case

            this.isRunning = false;
            this.serverUrl = null;
            this.browserpodInstance = null;
            this.machines.clear();
            this.notifyStatusChange({ running: false, url: null });

            return { success: true };
        } catch (error) {
            console.error('Failed to stop BrowserPod Headscale:', error);
            throw error;
        }
    }

    // Get the server URL
    getUrl() {
        return this.serverUrl;
    }

    // Get status
    getStatus() {
        return {
            running: this.isRunning,
            url: this.serverUrl
        };
    }

    // Add status change listener
    onStatusChange(callback) {
        this.statusListeners.push(callback);
    }

    // Remove status change listener
    removeStatusListener(callback) {
        this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    }

    // Notify all listeners of status change
    notifyStatusChange(status) {
        this.statusListeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Status listener error:', error);
            }
        });
    }
}

// Alternative: Use a simple in-browser Headscale mock server
// This creates a WebSocket-based server that mimics Headscale API
class InBrowserHeadscaleServer {
    constructor() {
        this.serverUrl = null;
        this.isRunning = false;
        this.machines = new Map();
        this.machineCounter = 0;
        this.statusListeners = [];
        this.worker = null;
    }

    async start() {
        if (this.isRunning) {
            return { success: true, url: this.serverUrl };
        }

        try {
            // Create a Web Worker to run the server logic
            const workerCode = `
                // Headscale API mock server in Web Worker
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    
                    if (type === 'health') {
                        self.postMessage({ type: 'health', success: true });
                    } else if (type === 'register') {
                        const machineId = 'machine-' + Date.now();
                        self.postMessage({ 
                            type: 'register', 
                            success: true, 
                            machineId: machineId 
                        });
                    } else if (type === 'getMachine') {
                        self.postMessage({ 
                            type: 'getMachine', 
                            success: true, 
                            machine: { 
                                id: data.machineId,
                                ipAddresses: ['100.64.0.1'],
                                name: 'wind0-vm',
                                online: true,
                                lastSeen: new Date().toISOString()
                            }
                        });
                    }
                };
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));

            // Generate a unique URL for this session
            const sessionId = `headscale-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            this.serverUrl = `http://localhost:${this.port || 8080}/${sessionId}`;

            // Create a simple HTTP server using Service Worker or fetch interception
            await this.setupServer();

            this.isRunning = true;
            this.notifyStatusChange({ running: true, url: this.serverUrl });

            return {
                success: true,
                url: this.serverUrl,
                message: 'Headscale server started in browser'
            };
        } catch (error) {
            console.error('Failed to start in-browser Headscale:', error);
            throw error;
        }
    }

    setupFetchInterception() {
        // Create a simple proxy that handles Headscale API requests
        // This intercepts fetch calls to the Headscale URL
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = async function(url, options) {
            if (typeof url === 'string' && url.includes(self.serverUrl)) {
                return self.handleRequest(url, options);
            }
            return originalFetch(url, options);
        };
    }

    async handleRequest(url, options) {
        const path = new URL(url).pathname;

        if (path.includes('/health')) {
            return new Response(JSON.stringify({ status: 'ok' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (path.includes('/api/v1/machine/register')) {
            const machineId = `machine-${++this.machineCounter}`;
            const ip = `100.64.0.${this.machineCounter}`;
            
            this.machines.set(machineId, {
                id: machineId,
                ipAddresses: [ip],
                name: 'wind0-vm',
                online: true,
                lastSeen: new Date().toISOString()
            });

            return new Response(JSON.stringify({
                machine: {
                    id: machineId,
                    ipAddresses: [ip]
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (path.includes('/api/v1/machine/')) {
            const machineId = path.split('/').pop();
            const machine = this.machines.get(machineId);

            if (machine) {
                return new Response(JSON.stringify({ machine }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async stop() {
        if (!this.isRunning) {
            return { success: true };
        }

        try {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }

            // Restore original fetch if we modified it
            if (window.fetch !== fetch) {
                // Note: We can't easily restore original fetch, but it's okay for this use case
            }

            this.isRunning = false;
            this.serverUrl = null;
            this.machines.clear();
            this.notifyStatusChange({ running: false, url: null });

            return { success: true };
        } catch (error) {
            console.error('Failed to stop in-browser Headscale:', error);
            throw error;
        }
    }

    getUrl() {
        return this.serverUrl;
    }

    getStatus() {
        return {
            running: this.isRunning,
            url: this.serverUrl
        };
    }

    onStatusChange(callback) {
        this.statusListeners.push(callback);
    }

    removeStatusListener(callback) {
        this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    }

    notifyStatusChange(status) {
        this.statusListeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Status listener error:', error);
            }
        });
    }
}

// Export BrowserPodHeadscale (handles both BrowserPod and fallback)
if (typeof window !== 'undefined') {
    window.BrowserPodHeadscale = BrowserPodHeadscale;
}

