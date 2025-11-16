// Vercel serverless function to proxy Windows ISO and avoid CORS
// v86.js uses Range requests for async loading, so we need to handle those properly

// Support both Vercel and standard Node.js formats
export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
        return res.status(200).end();
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    
    try {
        // Windows 10 Lite ISO URL (32-bit)
        const isoUrl = 'https://github.com/xazalea/windo/releases/download/v1.1/wind0.iso';
        
        // Support Range requests for streaming (v86.js uses Range requests for large files)
        const range = req.headers.range;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*'
        };
        
        if (range) {
            headers['Range'] = range;
            console.log('Range request:', range);
        }
        
        const response = await fetch(isoUrl, { headers });
        
        if (!response.ok && response.status !== 206) {
            console.error('Failed to fetch ISO:', response.status, response.statusText);
            const errorBody = await response.text().catch(() => '');
            console.error('Error response body:', errorBody.substring(0, 200));
            return res.status(response.status).json({ 
                error: `Failed to fetch: ${response.status} ${response.statusText}`,
                details: errorBody.substring(0, 200)
            });
        }
        
        // Forward content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        // Forward content length if available (critical for v86.js to avoid I/O errors)
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
            console.log('Content-Length:', contentLength, 'bytes');
        } else {
            console.warn('WARNING: No Content-Length header from source - this may cause I/O errors');
        }
        
        // Handle partial content (Range requests) - v86.js uses these for large files
        if (response.status === 206) {
            const contentRange = response.headers.get('content-range');
            if (contentRange) {
                res.setHeader('Content-Range', contentRange);
                res.status(206);
            }
        } else {
            res.status(200);
        }
        
        // Cache for 24 hours
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        res.setHeader('Accept-Ranges', 'bytes');
        
        // For Range requests, v86.js only requests small chunks (typically 64KB-1MB)
        // Stream the response instead of buffering to avoid memory issues and I/O errors
        const reader = response.body.getReader();
        const chunks = [];
        let done = false;
        let totalSize = 0;
        const maxBufferSize = 10 * 1024 * 1024; // 10MB max buffer (for Range requests)
        
        try {
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    chunks.push(Buffer.from(value));
                    totalSize += value.length;
                    
                    // For Range requests, limit buffer size to prevent memory issues
                    if (range && totalSize > maxBufferSize) {
                        console.warn('Range request buffer size exceeded limit, truncating');
                        break;
                    }
                }
            }
            
            const buffer = Buffer.concat(chunks);
            
            // Log for debugging
            if (range) {
                console.log(`Range request completed: ${range}, size: ${buffer.length} bytes`);
            } else {
                console.log(`Full request completed, size: ${buffer.length} bytes`);
            }
            
            return res.send(buffer);
        } catch (streamError) {
            console.error('Stream error:', streamError);
            return res.status(500).json({ 
                error: 'Stream error: ' + streamError.message 
            });
        }
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}
