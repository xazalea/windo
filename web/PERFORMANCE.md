# Performance Optimization Guide

This document explains the performance optimizations implemented in Azalea to ensure Windows runs smoothly in your browser.

## Optimizations Implemented

### 1. Canvas Rendering Optimizations

- **GPU Acceleration**: Canvas uses `translateZ(0)` for hardware acceleration
- **Optimized Context**: 2D context configured for write operations
- **Image Smoothing Disabled**: Faster rendering with pixel-perfect output
- **Device Pixel Ratio**: Proper scaling for high-DPI displays

### 2. Event Handling Optimizations

- **Throttled Mouse Events**: Mouse moves limited to ~60fps
- **Debounced Resize**: Window resize events debounced to 250ms
- **Passive Event Listeners**: Better scroll performance
- **Key Queue Processing**: Keyboard events queued and processed efficiently

### 3. Memory Optimizations

- **Optimal Memory Allocation**: 1.5GB RAM (optimal for Windows 10)
- **VGA Memory**: 32MB for better graphics performance
- **Virtual Disk**: 8GB for app installation
- **Garbage Collection**: Periodic memory cleanup

### 4. Rendering Optimizations

- **RequestAnimationFrame**: Smooth 60fps rendering
- **Frame Throttling**: Screen updates limited to 60fps
- **Lazy Loading**: Resources loaded on demand
- **Progressive Loading**: Images load progressively

### 5. Network Optimizations

- **Async Loading**: All resources load asynchronously
- **Caching**: Browser caching for BIOS and images
- **CDN Usage**: Fast CDN for v86.js library

## Performance Metrics

The emulator monitors:
- **FPS**: Frames per second (target: 60fps)
- **Frame Time**: Time per frame (target: <16ms)
- **Memory Usage**: JavaScript heap usage
- **CPU Usage**: Estimated CPU usage

## Best Practices for Users

### To Get Best Performance:

1. **Close Other Tabs**: Free up browser memory
2. **Use Modern Browser**: Chrome, Firefox, Edge (latest versions)
3. **Adequate RAM**: At least 4GB system RAM
4. **Fast Internet**: For initial image download
5. **Disable Extensions**: Some extensions can slow down emulation

### Settings for Performance:

- **Memory**: 1536MB (optimal) or 2048MB (maximum)
- **CPU Speed**: Medium (balanced) or Slow (more stable)
- **Network**: Disable if not needed
- **Sound**: Disable if not needed

## Technical Details

### Canvas Optimization

```javascript
// GPU acceleration
canvas.style.transform = 'translateZ(0)';
canvas.style.willChange = 'contents';

// Optimized context
const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
    willReadFrequently: false
});
```

### Event Throttling

```javascript
// Throttle to 60fps
const throttled = throttle(handler, 16);

// Debounce resize
const debounced = debounce(handler, 250);
```

### Memory Management

- 1.5GB RAM allocation (optimal for Windows 10)
- 32MB VGA memory (better graphics)
- 8GB virtual disk (space for apps)
- Periodic garbage collection

## Performance Monitoring

The emulator includes built-in performance monitoring:

- FPS counter (visible in console)
- Frame time tracking
- Memory usage monitoring
- Automatic optimization suggestions

## Troubleshooting Performance Issues

### Low FPS (<30fps)

**Solutions**:
1. Increase memory to 2048MB
2. Close other browser tabs
3. Disable browser extensions
4. Use "slow" CPU speed
5. Disable network if not needed

### High Memory Usage

**Solutions**:
1. Reduce memory allocation
2. Close other applications
3. Restart browser
4. Clear browser cache

### Slow Boot Time

**Solutions**:
1. Check internet connection speed
2. Use CDN-hosted images
3. Pre-cache Windows image
4. Be patient (30-60 seconds normal)

## Expected Performance

### On Modern Hardware:

- **FPS**: 30-60fps (depending on workload)
- **Boot Time**: 30-60 seconds
- **App Launch**: 5-15 seconds
- **Responsiveness**: Good for basic apps

### On Lower-End Devices:

- **FPS**: 15-30fps
- **Boot Time**: 60-120 seconds
- **App Launch**: 15-30 seconds
- **Responsiveness**: Acceptable for lightweight apps

## Advanced Optimizations

### For Developers:

1. **Web Workers**: Can be used for heavy computation
2. **Offscreen Canvas**: For better rendering performance
3. **SharedArrayBuffer**: For faster memory access (requires headers)
4. **WebAssembly**: For CPU-intensive operations

### Future Improvements:

- WebGPU support (when available)
- Better multi-threading
- Improved memory management
- Hardware acceleration enhancements

## Benchmarking

To benchmark performance:

1. Open browser DevTools
2. Go to Performance tab
3. Record a session
4. Check FPS, memory, and CPU usage
5. Identify bottlenecks

## Conclusion

These optimizations ensure Windows 10 Lite runs as smoothly as possible in the browser. While emulated performance will never match native, these techniques provide the best possible experience.

