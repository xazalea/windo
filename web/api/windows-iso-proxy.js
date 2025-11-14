// Vercel serverless function to proxy Windows ISO and avoid CORS
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
        // Windows 10 Lite ISO URL
        const isoUrl = 'https://archive.org/download/windows-10-lite-edition-19h2-x64/Windows%2010%20Lite%20Edition%2019H2%20x64.iso';
        
        // Support Range requests for streaming (v86.js uses Range requests for large files)
        const range = req.headers.range;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };
        
        if (range) {
            headers['Range'] = range;
        }
        
        const response = await fetch(isoUrl, { headers });
        
        if (!response.ok && response.status !== 206) {
            return res.status(response.status).json({ 
                error: `Failed to fetch: ${response.status} ${response.statusText}` 
            });
        }
        
        // Forward content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        // Forward content length if available
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }
        
        // Handle partial content (Range requests)
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
        
        // Stream the response in chunks (Vercel has response size limits)
        // For large files, we stream chunk by chunk
        const reader = response.body.getReader();
        const chunks = [];
        let done = false;
        
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(Buffer.from(value));
            }
        }
        
        const buffer = Buffer.concat(chunks);
        return res.send(buffer);
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}
