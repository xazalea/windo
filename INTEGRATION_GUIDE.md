# Integration Guide

This guide explains how to use the enhanced multi-technology architecture.

## Quick Start

### 1. Start All Services

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or manually:

# Terminal 1: Node.js backend
cd server
npm install
npm start

# Terminal 2: Python service
cd python-service
pip install -r requirements.txt
python app.py

# Terminal 3: Build WebAssembly
chmod +x web/build-wasm.sh
./web/build-wasm.sh
```

### 2. Initialize Services in Frontend

```javascript
// In your emulator.js or main app file
import { initServices } from './integration.js';

const services = await initServices();
console.log('Services status:', services.getServiceStatus());
```

## Using Each Service

### Node.js Backend (Express.js)

**Get available images:**
```javascript
const services = getServices();
const images = await services.getImages();
```

**Upload image:**
```javascript
const file = document.getElementById('fileInput').files[0];
const result = await services.uploadImage(file);
```

**Cache image from URL:**
```javascript
const result = await services.cacheImage(
    'https://example.com/windows.iso',
    'windows.iso'
);
```

### Python Microservice (Flask)

**Compress image:**
```javascript
const result = await services.compressImage('windows.iso');
```

**Analyze image:**
```javascript
const analysis = await services.analyzeImage('windows.iso');
console.log('Image size:', analysis.size_mb, 'MB');
console.log('Image type:', analysis.type);
```

### WebAssembly Performance Module

**Fast memory copy:**
```javascript
const services = getServices();
services.fastMemcpy(dstBuffer, srcBuffer, length);
```

**Fast memory set:**
```javascript
services.fastMemset(buffer, 0, length);
```

**Blit pixels (for rendering):**
```javascript
services.blitPixels(dstCanvas, srcCanvas, width, height);
```

## Integration with Existing Code

### Update emulator.js

```javascript
// At the top
import { initServices } from './integration.js';

// In constructor or init method
async init() {
    // Initialize services
    this.services = await initServices();
    
    // Use WebAssembly for performance-critical operations
    if (this.services.services.wasm) {
        console.log('Using WebAssembly for performance');
    }
}

// Use in image loading
async loadImage(url) {
    // Try to cache via Node.js backend first
    try {
        const result = await this.services.cacheImage(url);
        url = result.file.url;
    } catch (err) {
        console.warn('Caching failed, using direct URL');
    }
    
    // Continue with normal loading...
}
```

## Service Health Checks

```javascript
const status = services.getServiceStatus();
console.log('Node.js:', status.nodejs ? '✅' : '❌');
console.log('Python:', status.python ? '✅' : '❌');
console.log('WebAssembly:', status.wasm ? '✅' : '❌');
```

## Error Handling

All service methods throw errors if the service is unavailable. Always use try-catch:

```javascript
try {
    const result = await services.compressImage('image.iso');
    console.log('Compression successful:', result);
} catch (err) {
    console.warn('Compression unavailable:', err.message);
    // Fallback to client-side processing or skip
}
```

## Environment Variables

Set these for different environments:

```bash
# Development
NODEJS_URL=http://localhost:3001
PYTHON_URL=http://localhost:5000

# Production
NODEJS_URL=https://api.yourdomain.com
PYTHON_URL=https://python.yourdomain.com
```

## Optional React Components

If you want to use React components:

```bash
# Install React
cd web
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

Then use the components:

```jsx
import { ModernButton, StatusCard } from './lib/react-components/ModernUI';

function App() {
    return (
        <div>
            <StatusCard title="FPS" value="60" status="success" />
            <ModernButton onClick={handleClick}>Click Me</ModernButton>
        </div>
    );
}
```

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Node.js service not connecting
- Check if server is running: `curl http://localhost:3001/health`
- Verify CORS settings in server.js
- Check firewall rules

### Python service not connecting
- Check if Flask app is running: `curl http://localhost:5000/health`
- Verify Python dependencies: `pip install -r requirements.txt`
- Check port conflicts

### WebAssembly not loading
- Build WASM module: `./web/build-wasm.sh`
- Check browser console for errors
- Verify WASM file exists: `ls web/wasm/performance.wasm`
- Fallback to JavaScript will work automatically

## Next Steps

1. ✅ Services are integrated
2. ⏳ Add more Python endpoints as needed
3. ⏳ Expand WebAssembly modules
4. ⏳ Add React components gradually
5. ⏳ Set up production deployment

