// Performance optimization utilities for Windows emulator

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            cpuUsage: 0
        };
        this.optimizations = {
            canvasOptimized: false,
            gpuAccelerated: false,
            throttlingEnabled: false
        };
    }

    // Optimize canvas rendering
    optimizeCanvas(canvas) {
        if (!canvas) return;
        
        // Enable GPU acceleration
        canvas.style.transform = 'translateZ(0)';
        canvas.style.willChange = 'contents';
        canvas.style.backfaceVisibility = 'hidden';
        
        // Optimize context
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            willReadFrequently: false
        });
        
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'low';
        
        this.optimizations.canvasOptimized = true;
        return ctx;
    }

    // Throttle function calls for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Debounce function calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Monitor performance metrics
    startMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitor = () => {
            const now = performance.now();
            const delta = now - lastTime;
            
            frameCount++;
            if (delta >= 1000) {
                this.metrics.fps = Math.round((frameCount * 1000) / delta);
                this.metrics.frameTime = delta / frameCount;
                frameCount = 0;
                lastTime = now;
                
                // Log performance warnings
                if (this.metrics.fps < 30) {
                    console.warn('Low FPS detected:', this.metrics.fps);
                }
            }
            
            // Check memory usage (if available)
            if (performance.memory) {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    // Optimize event listeners
    optimizeEventListeners(element, events, handler, options = {}) {
        events.forEach(event => {
            element.addEventListener(event, handler, {
                passive: options.passive !== false,
                capture: options.capture || false
            });
        });
    }

    // Preload resources
    preloadResource(url, type = 'blob') {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = type;
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`Failed to load ${url}: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error(`Failed to load ${url}`));
            xhr.send();
        });
    }

    // Lazy load images
    lazyLoadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    // Optimize memory usage
    optimizeMemory() {
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc) {
            window.gc();
        }
        
        // Clear unused caches
        if ('caches' in window) {
            caches.keys().then(keys => {
                keys.forEach(key => {
                    if (!key.includes('v86')) {
                        caches.delete(key);
                    }
                });
            });
        }
    }

    // Get performance metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Check if optimizations are enabled
    getOptimizations() {
        return { ...this.optimizations };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
}

