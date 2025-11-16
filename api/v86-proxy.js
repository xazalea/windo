// Vercel serverless function to proxy v86.js and avoid CORS
export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    
    try {
        // Try multiple sources - use jsDelivr GitHub which is more reliable
        const sources = [
            'https://cdn.jsdelivr.net/gh/copy/v86@master/build/libv86.js',
            'https://unpkg.com/v86@0.9.0/build/libv86.js',
            'https://cdn.jsdelivr.net/npm/v86@0.9.0/build/libv86.js'
        ];
        
        for (const url of sources) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });
                
                if (response.ok) {
                    const text = await response.text();
                    // Cache for 1 hour
                    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
                    return res.status(200).send(text);
                } else {
                    console.warn(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
                }
            } catch (err) {
                console.warn(`Error fetching from ${url}:`, err.message);
                continue;
            }
        }
        
        return res.status(500).json({ error: 'All sources failed' });
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}

