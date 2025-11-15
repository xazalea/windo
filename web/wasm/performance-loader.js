// WebAssembly Performance Module Loader
// Loads and initializes WASM modules for performance-critical operations

class WASMPerformanceModule {
    constructor() {
        this.module = null;
        this.instance = null;
        this.memory = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Compile WASM module
            const wasmModule = await WebAssembly.compileStreaming(
                fetch('/wasm/performance.wasm')
            );

            // Create memory
            const memory = new WebAssembly.Memory({ initial: 1 });

            // Instantiate module
            this.instance = await WebAssembly.instantiate(wasmModule, {
                env: { memory }
            });

            this.module = wasmModule;
            this.memory = memory;
            this.initialized = true;

            console.log('✅ WASM Performance Module loaded');
        } catch (err) {
            console.warn('⚠️ WASM module not available, using JS fallback:', err);
            // Fallback to JavaScript implementations
            this.initFallback();
        }
    }

    initFallback() {
        // JavaScript fallback implementations
        this.instance = {
            fast_memcpy: (dst, src, len) => {
                const dstView = new Uint8Array(this.memory.buffer, dst, len);
                const srcView = new Uint8Array(this.memory.buffer, src, len);
                dstView.set(srcView);
            },
            fast_memset: (dst, value, len) => {
                const view = new Uint8Array(this.memory.buffer, dst, len);
                view.fill(value);
            },
            blit_pixels: (dst, src, width, height) => {
                const dstView = new Uint8Array(this.memory.buffer, dst, width * height);
                const srcView = new Uint8Array(this.memory.buffer, src, width * height);
                dstView.set(srcView);
            }
        };
        this.memory = new WebAssembly.Memory({ initial: 1 });
        this.initialized = true;
    }

    fastMemcpy(dst, src, len) {
        if (!this.initialized) return;
        this.instance.fast_memcpy(dst, src, len);
    }

    fastMemset(dst, value, len) {
        if (!this.initialized) return;
        this.instance.fast_memset(dst, value, len);
    }

    blitPixels(dst, src, width, height) {
        if (!this.initialized) return;
        this.instance.blit_pixels(dst, src, width, height);
    }

    getMemoryBuffer() {
        return this.memory ? this.memory.buffer : null;
    }
}

// Global instance
let wasmModule = null;

export async function initWASM() {
    if (!wasmModule) {
        wasmModule = new WASMPerformanceModule();
        await wasmModule.init();
    }
    return wasmModule;
}

export function getWASMModule() {
    return wasmModule;
}

