# Node.js Backend for Azalea

The Node.js backend server provides enhanced performance, storage, and capabilities for Azalea Windows emulator.

## Why Node.js Backend?

### Benefits

1. **More Storage**: Use server disk instead of browser limits
2. **Faster Speed**: Cached images load instantly
3. **Better Performance**: Server-side processing and optimization
4. **Enhanced Capabilities**: File management, WebSocket, APIs
5. **Local Access**: Direct file system access for better control

## Architecture

```
┌─────────────────┐
│  Vercel (Web)   │  ← Frontend (static)
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  Node.js Server │  ← Backend (localhost or cloud)
│  - Storage      │
│  - Caching      │
│  - WebSocket    │
│  - APIs         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Local Storage  │  ← File system access
│  - Images       │
│  - Cache        │
└─────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## Features

### 1. Image Storage

- **Upload**: Upload Windows images via API
- **Cache**: Cache images from URLs
- **Stream**: Efficient large file delivery
- **Manage**: List and manage stored images

### 2. Performance Optimization

- **Preloading**: Preload images into memory
- **Compression**: Compress images for faster transfer
- **Caching**: Cache frequently used images
- **Streaming**: Stream large files efficiently

### 3. WebSocket Communication

- **Real-time**: Real-time updates
- **Progress**: Download progress tracking
- **Events**: Server events to client
- **Optimization**: Real-time optimization requests

### 4. Enhanced APIs

- **Health Check**: Server status and metrics
- **Storage Stats**: Storage usage information
- **Image Management**: Upload, download, cache
- **Optimization**: Performance optimization endpoints

## Integration

### Frontend Integration

The frontend automatically detects and uses the Node.js server if available:

```javascript
// Automatically tries to connect
const apiClient = new AzaleaAPIClient('http://localhost:3001');

// Check health
const health = await apiClient.checkHealth();

// Get cached images
const images = await apiClient.getImages();

// Use cached image (faster!)
const imageUrl = apiClient.getImageUrl('windows-10-lite.iso');
```

### Benefits

1. **Faster Loading**: Cached images load instantly
2. **More Storage**: No browser storage limits
3. **Better Performance**: Server-side optimization
4. **File Management**: Upload and manage images
5. **Real-time Updates**: WebSocket for live updates

## Deployment Options

### Option 1: Local Development

Run server locally for development:

```bash
npm run dev
```

Frontend on Vercel connects to `http://localhost:3001`

### Option 2: Cloud Hosting

Deploy server to cloud:

**Railway**:
```bash
railway up
```

**Render**:
- Connect GitHub repo
- Set build command: `npm install`
- Set start command: `npm start`

**Heroku**:
```bash
heroku create azalea-server
git push heroku main
```

**DigitalOcean App Platform**:
- Connect repo
- Auto-detects Node.js
- Deploys automatically

### Option 3: Vercel Serverless Functions

Use Vercel API routes (limited, but works):

```javascript
// api/images.js
export default async function handler(req, res) {
    // Serverless function code
}
```

## Performance Improvements

### With Node.js Backend:

- **Image Loading**: 10-100x faster (cached)
- **Storage**: Unlimited (server disk)
- **Speed**: Optimized delivery
- **Capabilities**: File management, APIs

### Without Backend:

- **Image Loading**: Direct download (slower)
- **Storage**: Browser limits (limited)
- **Speed**: Depends on connection
- **Capabilities**: Basic only

## API Usage Examples

### Upload Image

```javascript
const file = document.getElementById('fileInput').files[0];
const result = await apiClient.uploadImage(file, (progress) => {
    console.log(`Upload: ${progress}%`);
});
```

### Cache Image from URL

```javascript
await apiClient.cacheImage(
    'https://archive.org/.../windows.iso',
    'windows-10-lite.iso'
);
```

### Preload Image

```javascript
await apiClient.preloadImage('windows-10-lite.iso');
```

### Get Cached Image URL

```javascript
const url = apiClient.getImageUrl('windows-10-lite.iso');
// Use in emulator
emulator.loadImage(url, 'cdrom');
```

## Configuration

### Environment Variables

```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
STORAGE_DIR=./storage
MAX_FILE_SIZE=10737418240
ENABLE_CACHING=true
```

### Storage

Images stored in `./storage/images/`

- Automatic directory creation
- File management
- Size tracking
- Cleanup utilities

## Security

- **CORS**: Configured allowed origins
- **File Size**: Limits on uploads
- **Validation**: Input validation
- **API Key**: Optional authentication
- **Secure**: Proper error handling

## Monitoring

### Health Endpoint

```bash
curl http://localhost:3001/health
```

Returns:
- Server status
- Uptime
- Memory usage
- Storage stats

## Troubleshooting

### Server Won't Start

1. Check port is available
2. Verify Node.js version (18+)
3. Check dependencies installed
4. Review error logs

### Images Not Loading

1. Check storage directory exists
2. Verify file permissions
3. Check CORS settings
4. Review server logs

### WebSocket Not Connecting

1. Check server is running
2. Verify WebSocket URL
3. Check firewall settings
4. Review browser console

## Next Steps

1. ✅ Install and run server
2. ✅ Configure environment
3. ✅ Test API endpoints
4. ✅ Deploy to cloud (optional)
5. ✅ Enjoy enhanced performance!

---

**Node.js backend provides the power and performance for a stunning Azalea experience!** 🚀

