// Enhanced API Routes with Express.js
import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const IMAGES_DIR = path.join(__dirname, '../storage/images');

// Configure multer for file uploads
const upload = multer({
    dest: IMAGES_DIR,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, IMAGES_DIR),
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

// Get available images
router.get('/images', async (req, res) => {
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

// Upload image
router.post('/images/upload', upload.single('image'), (req, res) => {
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

// Download image with range support
router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Image not found' });
    }
    
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;
    
    if (range) {
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
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
        });
        fs.createReadStream(filePath).pipe(res);
    }
});

// Cache image from URL
router.post('/images/cache', async (req, res) => {
    const { url, filename } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        
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

// Performance optimization
router.post('/optimize', async (req, res) => {
    const { action, config } = req.body;
    
    switch (action) {
        case 'preload':
            const imagePath = path.join(IMAGES_DIR, config.filename);
            if (fs.existsSync(imagePath)) {
                res.json({ success: true, message: 'Image preloaded' });
            } else {
                res.status(404).json({ error: 'Image not found' });
            }
            break;
        case 'compress':
            // Forward to Python service for compression
            try {
                const fetch = (await import('node-fetch')).default;
                const pyResponse = await fetch('http://localhost:5000/api/compress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const result = await pyResponse.json();
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: 'Python service unavailable' });
            }
            break;
        default:
            res.status(400).json({ error: 'Unknown action' });
    }
});

export default router;

