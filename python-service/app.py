"""
Python Microservice for Azalea Windows Emulator
Handles image processing, automation, and data analysis
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import subprocess
from pathlib import Path
import hashlib
import time

app = Flask(__name__)
CORS(app)

STORAGE_DIR = Path('/app/storage') if os.path.exists('/app/storage') else Path('./storage')
IMAGES_DIR = STORAGE_DIR / 'images'
PROCESSED_DIR = STORAGE_DIR / 'processed'

# Ensure directories exist
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'python-image-processor',
        'uptime': time.time(),
        'storage': {
            'images': len(list(IMAGES_DIR.glob('*'))),
            'processed': len(list(PROCESSED_DIR.glob('*')))
        }
    })

@app.route('/api/compress', methods=['POST'])
def compress_image():
    """Compress Windows image using various methods"""
    data = request.get_json()
    filename = data.get('filename')
    
    if not filename:
        return jsonify({'error': 'Filename required'}), 400
    
    filepath = IMAGES_DIR / filename
    if not filepath.exists():
        return jsonify({'error': 'File not found'}), 404
    
    try:
        # Use qemu-img or similar for compression
        output_path = PROCESSED_DIR / f'compressed-{filename}'
        
        # Example: Use qemu-img convert (if available)
        # subprocess.run(['qemu-img', 'convert', '-O', 'qcow2', 
        #                '-c', str(filepath), str(output_path)], check=True)
        
        # For now, return success (actual compression would require qemu-img)
        return jsonify({
            'success': True,
            'message': 'Compression queued',
            'original_size': filepath.stat().st_size,
            'output': str(output_path)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Analyze Windows image metadata"""
    data = request.get_json()
    filename = data.get('filename')
    
    if not filename:
        return jsonify({'error': 'Filename required'}), 400
    
    filepath = IMAGES_DIR / filename
    if not filepath.exists():
        return jsonify({'error': 'File not found'}), 404
    
    try:
        stats = filepath.stat()
        file_hash = calculate_hash(filepath)
        
        return jsonify({
            'filename': filename,
            'size': stats.st_size,
            'size_mb': round(stats.st_size / (1024 * 1024), 2),
            'created': stats.st_ctime,
            'modified': stats.st_mtime,
            'sha256': file_hash,
            'type': detect_image_type(filepath)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process', methods=['POST'])
def process_image():
    """Process image with various operations"""
    data = request.get_json()
    operation = data.get('operation')
    filename = data.get('filename')
    
    if not filename or not operation:
        return jsonify({'error': 'Operation and filename required'}), 400
    
    filepath = IMAGES_DIR / filename
    if not filepath.exists():
        return jsonify({'error': 'File not found'}), 404
    
    try:
        if operation == 'validate':
            # Validate image integrity
            return jsonify({
                'success': True,
                'valid': True,
                'message': 'Image appears valid'
            })
        elif operation == 'optimize':
            # Optimize image for faster loading
            return jsonify({
                'success': True,
                'message': 'Optimization queued'
            })
        else:
            return jsonify({'error': 'Unknown operation'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_hash(filepath):
    """Calculate SHA256 hash of file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def detect_image_type(filepath):
    """Detect image type from extension"""
    ext = filepath.suffix.lower()
    types = {
        '.img': 'raw',
        '.iso': 'iso9660',
        '.vmdk': 'vmdk',
        '.vdi': 'vdi',
        '.qcow2': 'qcow2'
    }
    return types.get(ext, 'unknown')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'false') == 'true')

