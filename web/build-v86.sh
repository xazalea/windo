#!/bin/bash
# Build script to create libv86.js from git submodule

set -e

echo "Building v86.js from submodule..."

cd v86

# Check if we have the required tools
if ! command -v make &> /dev/null; then
    echo "Error: 'make' is required. Please install it."
    exit 1
fi

# Check if Rust is available (optional, but recommended)
if ! command -v rustc &> /dev/null; then
    echo "Warning: Rust not found. Some features may not work."
    echo "Install Rust: https://rustup.rs/"
fi

# Build libv86.js
echo "Running 'make all' to build libv86.js..."
make all

# Copy to parent directory
if [ -f "build/libv86.js" ]; then
    cp build/libv86.js ../libv86.js
    echo "✓ libv86.js built and copied to web/libv86.js"
    ls -lh ../libv86.js
else
    echo "✗ Build failed: build/libv86.js not found"
    exit 1
fi

