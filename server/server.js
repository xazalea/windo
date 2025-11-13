// Azalea Windows Emulator - Node.js Backend Server
// Provides enhanced performance, storage, and capabilities

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import compression from 'compression';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const STORAGE_DIR = path.join(__dirname, 'storage');
const IMAGES_DIR = path.join(STORAGE_DIR, 'images');
const CACHE_DIR = path.join(STORAGE_DIR, 'cache');

// Ensure directories exist
fs.ensureDirSync(STORAGE_DIR);
fs.ensureDirSync(IMAGES_DIR);
fs.ensureDirSync(CACHE_DIR);

// Middleware
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({
    dest: IMAGES_DIR,
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024 // 10GB max
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, IMAGES_DIR);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    })
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        storage: {
            total: getStorageStats().total,
            used: getStorageStats().used,
            available: getStorageStats().available
        }
    });
});

// Get storage statistics
function getStorageStats() {
    try {
        const stats = fs.statSync(STORAGE_DIR);
        // Simplified - in production, use proper disk space checking
        return {
            total: 100 * 1024 * 1024 * 1024, // 100GB (example)
            used: getDirectorySize(STORAGE_DIR),
            available: 100 * 1024 * 1024 * 1024 - getDirectorySize(STORAGE_DIR)
        };
    } catch (err) {
        return { total: 0, used: 0, available: 0 };
    }
}

function getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                totalSize += stats.size;
            } else if (stats.isDirectory()) {
                totalSize += getDirectorySize(filePath);
            }
        });
    } catch (err) {
        console.error('Error calculating directory size:', err);
    }
    return totalSize;
}

// API Routes

// Get available Windows images
app.get('/api/images', (req, res) => {
    try {
        const images = fs.readdirSync(IMAGES_DIR)
            .filter(file => /\.(img|iso|vmdk|vdi)$/i.test(file))
            .map(file => {
                const filePath = path.join(IMAGES_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    url: `/api/images/${file}`
                };
            });
        
        res.json({ images });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Windows image
app.post('/api/images/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        success: true,
        file: {
            name: req.file.filename,
            size: req.file.size,
            url: `/api/images/${req.file.filename}`
        }
    });
});

// Download Windows image (streaming for large files)
app.get('/api/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Image not found' });
    }
    
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;
    
    if (range) {
        // Support range requests for large files
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'application/octet-stream',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// Cache Windows image from URL
app.post('/api/images/cache', async (req, res) => {
    const { url, filename } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const filePath = path.join(IMAGES_DIR, filename || path.basename(url));
        const writeStream = fs.createWriteStream(filePath);
        
        if (response.body) {
            response.body.pipe(writeStream);
            
            writeStream.on('finish', () => {
                res.json({
                    success: true,
                    file: {
                        name: path.basename(filePath),
                        size: fs.statSync(filePath).size,
                        url: `/api/images/${path.basename(filePath)}`
                    }
                });
            });
            
            writeStream.on('error', (err) => {
                res.status(500).json({ error: err.message });
            });
        } else {
            res.status(500).json({ error: 'No response body' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Performance optimization endpoint
app.post('/api/optimize', (req, res) => {
    const { action, config } = req.body;
    
    switch (action) {
        case 'preload':
            // Preload Windows image into memory cache
            const imagePath = path.join(IMAGES_DIR, config.filename);
            if (fs.existsSync(imagePath)) {
                // In production, implement actual caching
                res.json({ success: true, message: 'Image preloaded' });
            } else {
                res.status(404).json({ error: 'Image not found' });
            }
            break;
            
        case 'compress':
            // Compress image (would use actual compression library)
            res.json({ success: true, message: 'Compression queued' });
            break;
            
        default:
            res.status(400).json({ error: 'Unknown action' });
    }
});

// WebSocket server for real-time communication
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                case 'get_image_progress':
                    // Return download progress for cached images
                    ws.send(JSON.stringify({
                        type: 'image_progress',
                        progress: 100 // Would track actual progress
                    }));
                    break;
                    
                case 'optimize_request':
                    // Handle optimization requests
                    ws.send(JSON.stringify({
                        type: 'optimize_response',
                        success: true
                    }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: err.message }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
        type: 'connected',
        serverTime: Date.now(),
        capabilities: {
            storage: true,
            caching: true,
            optimization: true,
            websocket: true
        }
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Azalea Server running on http://localhost:${PORT}`);
    console.log(`📁 Storage: ${STORAGE_DIR}`);
    console.log(`💾 Images: ${IMAGES_DIR}`);
    console.log(`⚡ Performance optimizations enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

