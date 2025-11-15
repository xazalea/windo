// Enhanced Azalea Windows Emulator - Node.js Backend Server
// Modular architecture with Express.js

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import compression from 'compression';
import http from 'http';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { requestLogger, errorHandler } from './middleware/logger.js';

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
app.use(requestLogger);

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        storage: getStorageStats(),
        services: {
            nodejs: 'running',
            python: checkPythonService(),
            websocket: 'running'
        }
    });
});

// API Routes
app.use('/api', apiRoutes);

// Get storage statistics
function getStorageStats() {
    try {
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

// Check Python service availability
async function checkPythonService() {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:5000/health', {
            signal: AbortSignal.timeout(1000)
        });
        return response.ok ? 'running' : 'unavailable';
    } catch {
        return 'unavailable';
    }
}

// Error handling
app.use(errorHandler);

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
                    ws.send(JSON.stringify({
                        type: 'image_progress',
                        progress: 100
                    }));
                    break;
                case 'optimize_request':
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
    
    ws.send(JSON.stringify({
        type: 'connected',
        serverTime: Date.now(),
        capabilities: {
            storage: true,
            caching: true,
            optimization: true,
            websocket: true,
            python: await checkPythonService() === 'running'
        }
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Enhanced Azalea Server running on http://localhost:${PORT}`);
    console.log(`📁 Storage: ${STORAGE_DIR}`);
    console.log(`💾 Images: ${IMAGES_DIR}`);
    console.log(`⚡ Performance optimizations enabled`);
    console.log(`🔌 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
