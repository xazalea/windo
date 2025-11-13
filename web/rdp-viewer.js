// RDP Viewer using WebSocket Gateway
// This connects to an RDP gateway running on the Azure VM

class RDPViewer {
    constructor() {
        this.canvas = document.getElementById('rdpCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ws = null;
        this.connected = false;
        this.server = null;
        this.port = 3389;
        this.gatewayPort = 8080;
        this.username = null;
        this.password = null;
        this.resolution = { width: 1920, height: 1080 };
        
        this.setupEventListeners();
        this.loadConnectionParams();
    }

    setupEventListeners() {
        // Connection form
        document.getElementById('connectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.connect();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.connected) {
                goBack();
            }
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
        });

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e, 'down'));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouse(e, 'up'));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouse(e, 'move'));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Canvas keyboard events
        this.canvas.addEventListener('keydown', (e) => this.handleKey(e, 'down'));
        this.canvas.addEventListener('keyup', (e) => this.handleKey(e, 'up'));
        this.canvas.setAttribute('tabindex', '0');
    }

    loadConnectionParams() {
        // Load from URL parameters
        const params = new URLSearchParams(window.location.search);
        const server = params.get('server');
        const user = params.get('username');
        
        if (server) {
            document.getElementById('rdpServer').value = server;
        }
        if (user) {
            document.getElementById('rdpUser').value = user;
        }
    }

    async connect() {
        this.server = document.getElementById('rdpServer').value.trim();
        this.port = parseInt(document.getElementById('rdpPort').value) || 3389;
        this.gatewayPort = parseInt(document.getElementById('rdpGatewayPort').value) || 8080;
        this.username = document.getElementById('rdpUser').value.trim();
        this.password = document.getElementById('rdpPass').value;
        
        const resolution = document.getElementById('rdpResolution').value;
        if (resolution !== 'fit') {
            const [width, height] = resolution.split('x').map(Number);
            this.resolution = { width, height };
        } else {
            this.resolution = {
                width: window.innerWidth,
                height: window.innerHeight - 60
            };
        }

        if (!this.server || !this.username || !this.password) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.updateStatus('connecting', 'Connecting...');
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.getElementById('errorOverlay').style.display = 'none';
        document.getElementById('connectionModal').classList.remove('active');

        try {
            // Connect to WebSocket gateway
            // The gateway should be running on the Azure VM
            const gatewayUrl = `ws://${this.server}:${this.gatewayPort}/rdp`;
            
            this.ws = new WebSocket(gatewayUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                // Send connection parameters
                this.send({
                    type: 'connect',
                    server: this.server,
                    port: this.port,
                    username: this.username,
                    password: this.password,
                    width: this.resolution.width,
                    height: this.resolution.height
                });
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showError('Connection failed. Make sure the RDP gateway is running on the VM.');
            };

            this.ws.onclose = () => {
                if (this.connected) {
                    this.disconnect();
                }
            };

        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Failed to connect. Please check the server address and gateway port.');
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'connected':
                this.connected = true;
                this.updateStatus('connected', 'Connected');
                document.getElementById('loadingOverlay').style.display = 'none';
                this.setupCanvas();
                break;
                
            case 'frame':
                this.drawFrame(data.image);
                break;
                
            case 'error':
                this.showError(data.message);
                break;
                
            case 'clipboard':
                // Handle clipboard updates
                break;
        }
    }

    setupCanvas() {
        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.focus();
    }

    drawFrame(imageData) {
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = 'data:image/png;base64,' + imageData;
    }

    handleMouse(event, action) {
        if (!this.connected) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) * (this.resolution.width / rect.width));
        const y = Math.floor((event.clientY - rect.top) * (this.resolution.height / rect.height));
        
        this.send({
            type: 'mouse',
            action: action,
            x: x,
            y: y,
            button: event.button
        });
    }

    handleWheel(event) {
        if (!this.connected) return;
        
        event.preventDefault();
        this.send({
            type: 'wheel',
            deltaX: event.deltaX,
            deltaY: event.deltaY
        });
    }

    handleKey(event, action) {
        if (!this.connected) return;
        
        // Don't send special keys that might interfere
        if (event.key === 'F11' || event.key === 'F12') {
            return;
        }
        
        this.send({
            type: 'keyboard',
            action: action,
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        });
        
        // Prevent default for some keys
        if (['Tab', 'F5'].includes(event.key)) {
            event.preventDefault();
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.updateStatus('disconnected', 'Disconnected');
        document.getElementById('connectionModal').classList.add('active');
    }

    updateStatus(status, text) {
        const indicator = document.getElementById('connectionStatus');
        const textEl = document.getElementById('connectionText');
        
        indicator.className = `status-indicator ${status}`;
        textEl.textContent = text;
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorOverlay').style.display = 'flex';
        document.getElementById('loadingOverlay').style.display = 'none';
        this.updateStatus('disconnected', 'Connection Failed');
    }

    retry() {
        document.getElementById('errorOverlay').style.display = 'none';
        this.connect();
    }
}

// Global functions
let rdpViewer;

function goBack() {
    if (rdpViewer && rdpViewer.connected) {
        if (confirm('Are you sure you want to disconnect?')) {
            rdpViewer.disconnect();
        }
    } else {
        window.location.href = '/';
    }
}

function toggleFullscreen() {
    const container = document.querySelector('.rdp-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
        container.classList.add('fullscreen');
    } else {
        document.exitFullscreen();
        container.classList.remove('fullscreen');
    }
}

function showSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function disconnect() {
    if (rdpViewer) {
        rdpViewer.disconnect();
    }
}

function retryConnection() {
    if (rdpViewer) {
        rdpViewer.retry();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    rdpViewer = new RDPViewer();
});

