// Headscale Client - Self-hosted Tailscale Control Server Integration
// Provides WiFi/network connectivity for Windows VM
// Based on https://github.com/juanfont/headscale

class HeadscaleClient {
    constructor() {
        this.serverUrl = localStorage.getItem('wind0_headscale_url') || 'https://headscale.example.com';
        this.apiKey = localStorage.getItem('wind0_headscale_api_key') || null;
        this.machineId = localStorage.getItem('wind0_headscale_machine_id') || null;
        this.connected = false;
        this.connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'error'
        this.networkInfo = null;
        this.statusListeners = [];
        this.reconnectInterval = null;
    }

    // Set Headscale server URL and API key
    configure(serverUrl, apiKey = null) {
        this.serverUrl = serverUrl;
        this.apiKey = apiKey;
        localStorage.setItem('wind0_headscale_url', serverUrl);
        if (apiKey) {
            localStorage.setItem('wind0_headscale_api_key', apiKey);
        }
    }

    // Connect to Headscale server
    async connect() {
        if (this.connected) {
            return { success: true, status: 'already_connected' };
        }

        this.connectionStatus = 'connecting';
        this.notifyStatusChange();

        try {
            // Check if server is reachable
            const healthResponse = await fetch(`${this.serverUrl}/health`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!healthResponse.ok) {
                throw new Error(`Headscale server not reachable: ${healthResponse.status}`);
            }

            // Register or authenticate machine
            if (!this.machineId) {
                const registerResult = await this.registerMachine();
                if (!registerResult.success) {
                    throw new Error('Failed to register machine');
                }
                this.machineId = registerResult.machineId;
                localStorage.setItem('wind0_headscale_machine_id', this.machineId);
            }

            // Get network info
            this.networkInfo = await this.getNetworkInfo();

            this.connected = true;
            this.connectionStatus = 'connected';
            this.notifyStatusChange();

            // Start periodic status updates
            this.startStatusUpdates();

            return {
                success: true,
                status: 'connected',
                networkInfo: this.networkInfo
            };
        } catch (error) {
            this.connectionStatus = 'error';
            this.connected = false;
            this.notifyStatusChange();
            throw error;
        }
    }

    // Disconnect from Headscale
    async disconnect() {
        if (!this.connected) {
            return { success: true };
        }

        try {
            if (this.machineId) {
                // Optionally delete machine from server
                // await this.deleteMachine(this.machineId);
            }

            this.connected = false;
            this.connectionStatus = 'disconnected';
            this.networkInfo = null;

            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
                this.reconnectInterval = null;
            }

            this.notifyStatusChange();
            return { success: true };
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    }

    // Register machine with Headscale
    async registerMachine() {
        try {
            const response = await fetch(`${this.serverUrl}/api/v1/machine/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    key: this.generateMachineKey(),
                    name: `wind0-vm-${Date.now()}`,
                    user: 'wind0-user'
                })
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                machineId: data.machine?.id || data.id
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get network information
    async getNetworkInfo() {
        try {
            if (!this.machineId) {
                return null;
            }

            const response = await fetch(`${this.serverUrl}/api/v1/machine/${this.machineId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to get network info: ${response.status}`);
            }

            const data = await response.json();
            return {
                ip: data.machine?.ipAddresses?.[0] || null,
                name: data.machine?.name || 'wind0-vm',
                online: data.machine?.online || false,
                lastSeen: data.machine?.lastSeen || null
            };
        } catch (error) {
            console.error('Get network info error:', error);
            return null;
        }
    }

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    // Generate machine key (simplified - in production, use proper key generation)
    generateMachineKey() {
        // This is a simplified key generation
        // In production, you'd use proper cryptographic key generation
        return `wind0-key-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    // Start periodic status updates
    startStatusUpdates() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }

        this.reconnectInterval = setInterval(async () => {
            if (this.connected) {
                try {
                    this.networkInfo = await this.getNetworkInfo();
                    this.notifyStatusChange();
                } catch (error) {
                    console.warn('Status update error:', error);
                    // Try to reconnect
                    if (this.connectionStatus === 'connected') {
                        this.connectionStatus = 'error';
                        this.notifyStatusChange();
                    }
                }
            }
        }, 30000); // Update every 30 seconds
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
    notifyStatusChange() {
        this.statusListeners.forEach(callback => {
            try {
                callback({
                    connected: this.connected,
                    status: this.connectionStatus,
                    networkInfo: this.networkInfo
            });
            } catch (error) {
                console.error('Status listener error:', error);
            }
        });
    }

    // Get current status
    getStatus() {
        return {
            connected: this.connected,
            status: this.connectionStatus,
            networkInfo: this.networkInfo,
            serverUrl: this.serverUrl
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.HeadscaleClient = HeadscaleClient;
}

