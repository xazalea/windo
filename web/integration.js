// Integration module for multi-technology architecture
// Connects Node.js, Python, and WebAssembly services

class ServiceIntegration {
    constructor() {
        this.nodejsUrl = process.env.NODEJS_URL || 'http://localhost:3001';
        this.pythonUrl = process.env.PYTHON_URL || 'http://localhost:5000';
        this.wasmModule = null;
        this.services = {
            nodejs: false,
            python: false,
            wasm: false
        };
    }

    async init() {
        console.log('🔌 Initializing service integration...');
        
        // Initialize WebAssembly
        try {
            const { initWASM } = await import('./wasm/performance-loader.js');
            this.wasmModule = await initWASM();
            this.services.wasm = true;
            console.log('✅ WebAssembly module loaded');
        } catch (err) {
            console.warn('⚠️ WebAssembly not available:', err);
        }

        // Check Node.js service
        try {
            const response = await fetch(`${this.nodejsUrl}/health`);
            if (response.ok) {
                this.services.nodejs = true;
                console.log('✅ Node.js service connected');
            }
        } catch (err) {
            console.warn('⚠️ Node.js service unavailable:', err);
        }

        // Check Python service
        try {
            const response = await fetch(`${this.pythonUrl}/health`);
            if (response.ok) {
                this.services.python = true;
                console.log('✅ Python service connected');
            }
        } catch (err) {
            console.warn('⚠️ Python service unavailable:', err);
        }

        return this.services;
    }

    // Node.js API calls
    async getImages() {
        if (!this.services.nodejs) {
            throw new Error('Node.js service unavailable');
        }
        const response = await fetch(`${this.nodejsUrl}/api/images`);
        return await response.json();
    }

    async uploadImage(file) {
        if (!this.services.nodejs) {
            throw new Error('Node.js service unavailable');
        }
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${this.nodejsUrl}/api/images/upload`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }

    async cacheImage(url, filename) {
        if (!this.services.nodejs) {
            throw new Error('Node.js service unavailable');
        }
        const response = await fetch(`${this.nodejsUrl}/api/images/cache`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, filename })
        });
        return await response.json();
    }

    // Python API calls
    async compressImage(filename) {
        if (!this.services.python) {
            throw new Error('Python service unavailable');
        }
        const response = await fetch(`${this.pythonUrl}/api/compress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        return await response.json();
    }

    async analyzeImage(filename) {
        if (!this.services.python) {
            throw new Error('Python service unavailable');
        }
        const response = await fetch(`${this.pythonUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        return await response.json();
    }

    // WebAssembly operations
    fastMemcpy(dst, src, len) {
        if (!this.services.wasm || !this.wasmModule) {
            // Fallback to JavaScript
            const dstView = new Uint8Array(dst, 0, len);
            const srcView = new Uint8Array(src, 0, len);
            dstView.set(srcView);
            return;
        }
        this.wasmModule.fastMemcpy(dst, src, len);
    }

    fastMemset(dst, value, len) {
        if (!this.services.wasm || !this.wasmModule) {
            // Fallback to JavaScript
            const view = new Uint8Array(dst, 0, len);
            view.fill(value);
            return;
        }
        this.wasmModule.fastMemset(dst, value, len);
    }

    blitPixels(dst, src, width, height) {
        if (!this.services.wasm || !this.wasmModule) {
            // Fallback to JavaScript
            const dstView = new Uint8Array(dst, 0, width * height);
            const srcView = new Uint8Array(src, 0, width * height);
            dstView.set(srcView);
            return;
        }
        this.wasmModule.blitPixels(dst, src, width, height);
    }

    getServiceStatus() {
        return {
            ...this.services,
            nodejsUrl: this.nodejsUrl,
            pythonUrl: this.pythonUrl
        };
    }
}

// Global instance
let serviceIntegration = null;

export async function initServices() {
    if (!serviceIntegration) {
        serviceIntegration = new ServiceIntegration();
        await serviceIntegration.init();
    }
    return serviceIntegration;
}

export function getServices() {
    return serviceIntegration;
}

// Make available globally for easy access
if (typeof window !== 'undefined') {
    window.initServices = initServices;
    window.getServices = getServices;
}

