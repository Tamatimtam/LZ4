"""
LZ4 Compression Visualizer
A beautiful and interactive educational tool
Developed by: Pratama Varian Andika (2207421040)
Institution: Politeknik Negeri Jakarta
"""
from flask import Flask, render_template, request, jsonify, abort
import json
import os
from LZ4 import lz4_compress_with_steps, lz4_decompress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time

app = Flask(__name__)

# Setup rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Security middleware to validate request size
@app.before_request
def validate_request():
    # Limit request body size (5MB)
    max_content_length = 5 * 1024 * 1024  # 5 MB
    content_length = request.content_length

    if content_length and content_length > max_content_length:
        abort(413)  # Request Entity Too Large

    # Limit input data length for compression (100KB)
    if request.path == '/compress' and request.method == 'POST':
        data = request.json.get('data', '')
        if len(data) > 100 * 1024:  # 100 KB
            return jsonify({'error': 'Input data too large', 'max_size': '100KB'}), 413

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compress', methods=['POST'])
@limiter.limit("10 per minute")  # Stricter limit for compression endpoint
def compress():
    try:
        start_time = time.time()
        data = request.json.get('data', '')

        # Input validation
        if not isinstance(data, str):
            return jsonify({'error': 'Invalid input data type'}), 400

        if len(data) > 100 * 1024:  # Double-check size (also checked in middleware)
            return jsonify({'error': 'Input data too large', 'max_size': '100KB'}), 413

        # Time limit to prevent long-running compression
        max_processing_time = 5  # seconds

        # Encode for compression
        data_bytes = data.encode('utf-8')
        compression_steps, compressed_data = lz4_compress_with_steps(data_bytes)

        # Check if processing took too long
        elapsed_time = time.time() - start_time
        if elapsed_time > max_processing_time:
            app.logger.warning(f"Compression took {elapsed_time}s which is too long")
            # Still return the result, but log the warning

        # Convert bytes to list of integers for JSON serialization
        data_list = list(data_bytes)

        # Process the compressed data to make it JSON serializable
        serializable_compressed = []
        for item in compressed_data:
            if isinstance(item, tuple):
                serializable_compressed.append({"type": "match", "offset": item[0], "length": item[1]})
            else:
                serializable_compressed.append({"type": "literal", "value": item})

        # Calculate compression ratio
        original_size = len(data_list)
        # Calculate the compressed size by counting total bytes required for the compressed data
        compressed_size = sum(1 if step.get('type') == 'literal' else 2 for step in serializable_compressed)
        compression_ratio = compressed_size / original_size  if compressed_size > 0 else 0
        compression_ratio_formatted = f"{compression_ratio:.2f}x"

        return jsonify({
            'original_data': data_list,
            'compressed_data': serializable_compressed,
            'steps': compression_steps,
            'compression_ratio': compression_ratio_formatted
        })
    except Exception as e:
        app.logger.error(f"Error during compression: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/decompress', methods=['POST'])
@limiter.limit("20 per minute")
def decompress():
    try:
        compressed_data = request.json.get('compressed_data', [])

        # Input validation
        if not isinstance(compressed_data, list):
            return jsonify({'error': 'Invalid input data type'}), 400

        if len(compressed_data) > 10000:  # Arbitrary limit
            return jsonify({'error': 'Input data too large'}), 413

        # Convert the JSON representation back to the format LZ4 decompress expects
        decompression_input = []
        for item in compressed_data:
            if not isinstance(item, dict):
                return jsonify({'error': 'Invalid compressed data format'}), 400

            if item.get('type') == 'match':
                offset = item.get('offset')
                length = item.get('length')

                # Validate offset and length
                if not isinstance(offset, int) or not isinstance(length, int):
                    return jsonify({'error': 'Invalid match data'}), 400

                if offset <= 0 or length <= 0 or length > 1000:
                    return jsonify({'error': 'Invalid match parameters'}), 400

                decompression_input.append((offset, length))
            else:
                value = item.get('value')
                if not isinstance(value, int):
                    return jsonify({'error': 'Invalid literal value'}), 400
                decompression_input.append(value)

        decompressed_data = lz4_decompress(decompression_input)

        return jsonify({
            'decompressed_data': list(decompressed_data)
        })
    except Exception as e:
        app.logger.error(f"Error during decompression: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Error handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'Request too large'}), 413

@app.errorhandler(429)
def ratelimit_handler(error):
    return jsonify({'error': f"Rate limit exceeded: {error.description}"}), 429

if __name__ == '__main__':
    # Get port from environment variable or use 8080 as default
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
