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
        const { method, path, body } = req;
        
        // Construct File.IO API URL
        const fileIOUrl = `https://file.io${path || '/'}`;
        
        // Prepare fetch options
        const fetchOptions = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        // For POST requests, forward the body
        if (method === 'POST' && body) {
            // If it's FormData, we need to handle it differently
            if (body instanceof FormData) {
                fetchOptions.body = body;
            } else {
                fetchOptions.headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(body);
            }
        }
        
        // Forward the request to File.IO
        const response = await fetch(fileIOUrl, fetchOptions);
        
        // Get response data
        const data = await response.json();
        
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

