// Vercel serverless function to proxy v86.js and avoid CORS
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/javascript');
    
    try {
        // Try multiple sources
        const sources = [
            'https://unpkg.com/v86@0.9.0/build/libv86.js',
            'https://cdn.jsdelivr.net/npm/v86@0.9.0/build/libv86.js',
            'https://raw.githubusercontent.com/copy/v86/master/build/libv86.js'
        ];
        
        for (const url of sources) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    // Cache for 1 hour
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    return res.status(200).send(text);
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${url}:`, err.message);
                continue;
            }
        }
        
        return res.status(500).json({ error: 'All sources failed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

