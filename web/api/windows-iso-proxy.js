// Vercel serverless function to proxy Windows ISO and avoid CORS
// Note: Vercel has a 50MB response limit, so we need to handle Range requests properly
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*'
        };
        
        if (range) {
            headers['Range'] = range;
        }
        
        const response = await fetch(isoUrl, { headers });
        
        if (!response.ok && response.status !== 206) {
            console.error('Failed to fetch ISO:', response.status, response.statusText);
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
        
        // Stream the response in chunks
        // For Range requests, we only need to stream the requested range
        const reader = response.body.getReader();
        const chunks = [];
        let done = false;
        let totalSize = 0;
        const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
        
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(Buffer.from(value));
                totalSize += value.length;
                
                // For Range requests, we can stop early if we've read enough
                if (range && totalSize > MAX_CHUNK_SIZE) {
                    // We've read enough for this range request
                    break;
                }
            }
        }
        
        const buffer = Buffer.concat(chunks);
        
        // For very large files, we might hit Vercel's limit
        // But v86.js uses Range requests, so it should only request small chunks
        if (buffer.length > 50 * 1024 * 1024) {
            console.warn('Response size exceeds 50MB, this might fail on Vercel');
        }
        
        return res.send(buffer);
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}
