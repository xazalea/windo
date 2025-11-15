# Enhanced Architecture - Multi-Technology Integration

## Overview

The application has been enhanced with a modular, multi-technology architecture integrating:

- ✅ **Node.js (Express.js)**: Enhanced REST API and WebSocket server
- ✅ **Python (Flask)**: Microservice for image processing and automation
- ✅ **WebAssembly**: Performance-critical operations module
- ✅ **React (Optional)**: Modern UI components for gradual enhancement
- ✅ **Docker Compose**: Multi-service orchestration

## What's New

### 1. Enhanced Node.js Backend

**Location**: `server/`

- Modular Express.js structure with routes and middleware
- Improved error handling and logging
- Health checks and service discovery
- Integration with Python service

**Key Files**:
- `server/server.js` - Main server
- `server/routes/api.js` - API routes
- `server/middleware/logger.js` - Logging middleware

### 2. Python Microservice

**Location**: `python-service/`

- Flask-based microservice for specialized tasks
- Image compression and analysis
- Automation capabilities
- Docker container support

**Key Files**:
- `python-service/app.py` - Flask application
- `python-service/requirements.txt` - Dependencies
- `python-service/Dockerfile` - Container config

### 3. WebAssembly Performance Module

**Location**: `web/wasm/`

- High-performance memory operations
- Optimized pixel blitting
- Fast memory copy/set operations
- JavaScript fallback for compatibility

**Key Files**:
- `web/wasm/performance.wat` - WASM source
- `web/wasm/performance-loader.js` - Loader with fallback
- `web/build-wasm.sh` - Build script

### 4. Optional React Components

**Location**: `web/lib/react-components/`

- Modern UI components
- Can be integrated gradually
- Works alongside vanilla JS
- TypeScript support

**Key Files**:
- `web/lib/react-components/ModernUI.tsx` - Component library

### 5. Service Integration

**Location**: `web/integration.js`

- Unified interface for all services
- Automatic service discovery
- Error handling and fallbacks
- Health monitoring

## Quick Start

### Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually:

# Node.js backend
cd server && npm install && npm start

# Python service
cd python-service && pip install -r requirements.txt && python app.py

# Build WebAssembly
./web/build-wasm.sh
```

### Usage in Frontend

```javascript
import { initServices } from './integration.js';

// Initialize all services
const services = await initServices();

// Use Node.js backend
const images = await services.getImages();

// Use Python service
const analysis = await services.analyzeImage('windows.iso');

// Use WebAssembly
services.fastMemcpy(dst, src, len);
```

## Architecture Benefits

1. **Modularity**: Each service has a specific purpose
2. **Performance**: WebAssembly for critical paths
3. **Flexibility**: Best tool for each task
4. **Scalability**: Services scale independently
5. **Maintainability**: Clear separation of concerns

## Service Communication

```
Frontend (Browser)
    ↓
Integration Layer (integration.js)
    ↓
┌───────────┬───────────┬───────────┐
│ Node.js   │ Python    │ WebAssembly│
│ (Express) │ (Flask)   │ (WASM)     │
└───────────┴───────────┴───────────┘
```

## API Endpoints

### Node.js (Port 3001)
- `GET /health` - Health check
- `GET /api/images` - List images
- `POST /api/images/upload` - Upload image
- `GET /api/images/:filename` - Download image
- `POST /api/images/cache` - Cache from URL
- `POST /api/optimize` - Performance optimization

### Python (Port 5000)
- `GET /health` - Health check
- `POST /api/compress` - Compress image
- `POST /api/analyze` - Analyze image
- `POST /api/process` - Process image

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integration guide
- [server/README.md](./server/README.md) - Node.js backend docs

## Migration Notes

The existing vanilla JS code continues to work. The new services are:
- **Optional**: Can be used when available
- **Non-breaking**: Existing code works without them
- **Gradual**: Can be integrated incrementally

## Next Steps

1. ✅ Enhanced architecture implemented
2. ⏳ Test all services
3. ⏳ Add more Python endpoints
4. ⏳ Expand WebAssembly modules
5. ⏳ Production deployment setup

## Support

For issues or questions:
- Check service health: `GET /health` on each service
- Review logs: `docker-compose logs`
- See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for troubleshooting

