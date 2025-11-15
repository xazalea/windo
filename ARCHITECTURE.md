# Enhanced Architecture Documentation

This document describes the enhanced modular architecture integrating multiple technologies.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Vanilla JS  │  │  React (opt) │  │  WebAssembly │  │
│  │  (Core)      │  │  (UI Enhance)│  │  (Performance)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│              (Vercel Serverless Functions)              │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Node.js     │ │   Python     │ │  WebAssembly │
│  (Express)   │ │   (Flask)     │ │  (WASM)      │
│              │ │               │ │              │
│  - REST API  │ │  - Image      │ │  - Fast ops  │
│  - WebSocket │ │    Processing │ │  - Memory    │
│  - Storage   │ │  - Automation │ │    Ops       │
│  - Caching   │ │  - Analysis  │ │  - Rendering │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Technology Stack

### Frontend
- **Vanilla JavaScript/TypeScript**: Core emulator logic
- **React (Optional)**: Modern UI components for gradual enhancement
- **WebAssembly**: Performance-critical operations (memory, rendering)

### Backend Services

#### Node.js (Express.js)
- **Primary Backend**: REST API, WebSocket server
- **Features**:
  - Image storage and streaming
  - Real-time communication
  - Caching and optimization
  - Health monitoring

#### Python (Flask)
- **Microservice**: Specialized image processing
- **Features**:
  - Image compression
  - Image analysis and validation
  - Automation tasks
  - Data processing

#### WebAssembly
- **Performance Module**: Critical path optimizations
- **Features**:
  - Fast memory operations
  - Optimized pixel blitting
  - CPU emulation helpers

## Service Communication

### Node.js ↔ Python
- REST API calls from Node.js to Python service
- Health checks and service discovery
- Async processing for heavy operations

### Frontend ↔ Backend
- REST API for CRUD operations
- WebSocket for real-time updates
- Serverless functions for Vercel deployment

## Directory Structure

```
windows/
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── server.js          # Main server
├── python-service/        # Python microservice
│   ├── app.py            # Flask application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Container config
├── web/                   # Frontend
│   ├── wasm/             # WebAssembly modules
│   │   ├── performance.wat
│   │   └── performance-loader.js
│   └── lib/
│       └── react-components/  # Optional React components
└── docker-compose.yml     # Multi-service orchestration
```

## Deployment

### Development
```bash
# Start Node.js backend
cd server && npm start

# Start Python service
cd python-service && python app.py

# Frontend runs on Vercel
```

### Production
- **Frontend**: Vercel (static + serverless)
- **Node.js**: Vercel serverless or dedicated server
- **Python**: Docker container or serverless function
- **WebAssembly**: Bundled with frontend

## API Endpoints

### Node.js (Express)
- `GET /health` - Health check
- `GET /api/images` - List images
- `POST /api/images/upload` - Upload image
- `GET /api/images/:filename` - Download image
- `POST /api/images/cache` - Cache from URL
- `POST /api/optimize` - Performance optimization

### Python (Flask)
- `GET /health` - Health check
- `POST /api/compress` - Compress image
- `POST /api/analyze` - Analyze image
- `POST /api/process` - Process image

## Integration Points

### WebAssembly Integration
```javascript
import { initWASM } from './wasm/performance-loader.js';

const wasm = await initWASM();
wasm.fastMemcpy(dst, src, len);
```

### React Components (Optional)
```jsx
import { ModernButton, StatusCard } from './lib/react-components/ModernUI';

// Use alongside vanilla JS
<ModernButton onClick={handleClick}>Click Me</ModernButton>
```

### Python Service Call
```javascript
// From Node.js
const response = await fetch('http://localhost:5000/api/compress', {
    method: 'POST',
    body: JSON.stringify({ filename: 'image.iso' })
});
```

## Benefits

1. **Modularity**: Each service has a specific purpose
2. **Performance**: WebAssembly for critical paths
3. **Flexibility**: Can use best tool for each task
4. **Scalability**: Services can scale independently
5. **Maintainability**: Clear separation of concerns

## Migration Path

1. ✅ Enhanced Node.js backend (Express.js)
2. ✅ Python microservice for image processing
3. ✅ WebAssembly performance modules
4. ⏳ Optional React components (gradual)
5. ⏳ Full integration testing

## Next Steps

- [ ] Add Docker Compose for local development
- [ ] Implement WebAssembly compilation pipeline
- [ ] Add React component examples
- [ ] Create integration tests
- [ ] Document API contracts
- [ ] Set up CI/CD pipeline

