# Azalea Node.js Backend Server

Enhanced Node.js backend server for Azalea Windows emulator providing:
- **Better Performance**: Server-side processing and caching
- **More Storage**: Local file system access
- **Faster Speed**: Optimized image delivery and caching
- **Enhanced Capabilities**: WebSocket, file management, optimization

## Features

✅ **Local Storage**: Store Windows images on server  
✅ **Image Caching**: Cache images for faster loading  
✅ **File Upload**: Upload Windows images via API  
✅ **WebSocket**: Real-time communication  
✅ **Performance API**: Optimization endpoints  
✅ **Streaming**: Efficient large file delivery  
✅ **Compression**: Gzip compression for faster transfers  

## Installation

```bash
cd server
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Configure settings:
   - `PORT`: Server port (default: 3001)
   - `ALLOWED_ORIGINS`: CORS origins
   - `STORAGE_DIR`: Storage directory

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Get Images
```
GET /api/images
```

### Upload Image
```
POST /api/images/upload
Content-Type: multipart/form-data
```

### Download Image
```
GET /api/images/:filename
```

### Cache Image from URL
```
POST /api/images/cache
Body: { "url": "https://...", "filename": "windows.img" }
```

### Optimize
```
POST /api/optimize
Body: { "action": "preload", "config": {...} }
```

## WebSocket API

Connect to `ws://localhost:3001`

### Messages

**Ping**
```json
{ "type": "ping" }
```

**Get Image Progress**
```json
{ "type": "get_image_progress" }
```

## Integration with Vercel Frontend

The Vercel frontend can connect to this Node.js server for:
- Faster image loading
- Local storage
- Better performance
- Enhanced capabilities

## Deployment Options

### Option 1: Local Development
Run server locally, frontend on Vercel connects to it.

### Option 2: Cloud Hosting
Deploy server to:
- Railway
- Render
- Heroku
- DigitalOcean
- AWS/Google Cloud/Azure

### Option 3: Vercel Serverless Functions
Use Vercel API routes (limited functionality).

## Performance Benefits

- **Faster Loading**: Cached images load instantly
- **Better Storage**: Use server disk instead of browser limits
- **Optimization**: Server-side image processing
- **Streaming**: Efficient large file delivery
- **Compression**: Gzip for faster transfers

## Security

- CORS protection
- File size limits
- API key authentication (optional)
- Input validation
- Secure file handling

## Storage

Images are stored in `./storage/images/`

- Upload via API
- Cache from URLs
- Stream for download
- Manage via API

## Next Steps

1. Deploy server to cloud hosting
2. Update frontend to use server API
3. Enjoy better performance!

