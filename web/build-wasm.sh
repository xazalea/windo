#!/bin/bash
# Build WebAssembly module from WAT source

echo "🔨 Building WebAssembly performance module..."

# Check if wat2wasm is available
if ! command -v wat2wasm &> /dev/null; then
    echo "⚠️  wat2wasm not found. Installing wabt..."
    # Try to install wabt (WebAssembly Binary Toolkit)
    if command -v brew &> /dev/null; then
        brew install wabt
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install -y wabt
    else
        echo "❌ Please install wabt manually: https://github.com/WebAssembly/wabt"
        exit 1
    fi
fi

# Compile WAT to WASM
wat2wasm web/wasm/performance.wat -o web/wasm/performance.wasm

if [ $? -eq 0 ]; then
    echo "✅ WebAssembly module built successfully!"
    echo "📦 Output: web/wasm/performance.wasm"
else
    echo "❌ Failed to build WebAssembly module"
    exit 1
fi

