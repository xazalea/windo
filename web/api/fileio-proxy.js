// Vercel serverless function to proxy File.IO API requests
// Bypasses CORS restrictions for File.IO API

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    
    try {
        const method = req.method;
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname.replace('/api/fileio-proxy', '') || '/';
        
        // Construct File.IO API URL
        const fileIOUrl = `https://file.io${path}`;
        
        // Prepare fetch options
        const fetchOptions = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        // For POST requests, we need to handle FormData
        if (method === 'POST') {
            // Vercel automatically parses FormData, but we need to reconstruct it
            // For now, we'll forward the raw body
            const contentType = req.headers['content-type'] || '';
            if (contentType.includes('multipart/form-data')) {
                // Forward as-is (Vercel handles FormData)
                fetchOptions.body = req.body;
                // Don't set Content-Type header, let fetch set it with boundary
            } else if (req.body) {
                fetchOptions.headers['Content-Type'] = contentType;
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }
        }
        
        // Forward the request to File.IO
        const response = await fetch(fileIOUrl, fetchOptions);
        
        // Get response data
        const contentType = response.headers.get('content-type') || '';
        let data;
        
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // For binary responses (file downloads), return as buffer
            const buffer = await response.arrayBuffer();
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', buffer.byteLength);
            return res.status(response.status).send(Buffer.from(buffer));
        }
        
        // Forward status and data
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('File.IO proxy error:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}

