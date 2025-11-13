#!/bin/bash
# Script to download v86.js locally to avoid CORS issues

echo "Downloading v86.js from GitHub releases..."

# Try to download from GitHub releases
curl -L -o libv86.js "https://github.com/copy/v86/releases/download/v0.9.0/libv86.js" || \
curl -L -o libv86.js "https://raw.githubusercontent.com/copy/v86/master/build/libv86.js" || \
curl -L -o libv86.js "https://unpkg.com/v86@0.9.0/build/libv86.js"

if [ -f libv86.js ]; then
    echo "✓ v86.js downloaded successfully"
    ls -lh libv86.js
else
    echo "✗ Failed to download v86.js"
    exit 1
fi

