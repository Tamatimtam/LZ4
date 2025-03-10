"""
LZ4 Compression Visualizer
A beautiful and interactive educational tool
Developed by: Pratama Varian Andika (2207421040)
Institution: Politeknik Negeri Jakarta
"""
from flask import Flask, render_template, request, jsonify
import json
import os
from LZ4 import lz4_compress_with_steps, lz4_decompress

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compress', methods=['POST'])
def compress():
    data = request.json.get('data', '').encode('utf-8')
    compression_steps, compressed_data = lz4_compress_with_steps(data)
    
    # Convert bytes to list of integers for JSON serialization
    if isinstance(data, bytes):
        data = list(data)
    
    # Process the compressed data to make it JSON serializable
    serializable_compressed = []
    for item in compressed_data:
        if isinstance(item, tuple):
            serializable_compressed.append({"type": "match", "offset": item[0], "length": item[1]})
        else:
            serializable_compressed.append({"type": "literal", "value": item})
    
    return jsonify({
        'original_data': data,
        'compressed_data': serializable_compressed,
        'steps': compression_steps,
        'compression_ratio': len(data) / (sum(step.get('length', 1) for step in serializable_compressed) + len(serializable_compressed))
    })

@app.route('/decompress', methods=['POST'])
def decompress():
    compressed_data = request.json.get('compressed_data', [])
    
    # Convert the JSON representation back to the format LZ4 decompress expects
    decompression_input = []
    for item in compressed_data:
        if item['type'] == 'match':
            decompression_input.append((item['offset'], item['length']))
        else:
            decompression_input.append(item['value'])
    
    decompressed_data = lz4_decompress(decompression_input)
    
    return jsonify({
        'decompressed_data': list(decompressed_data)
    })

if __name__ == '__main__':
    # Get port from environment variable or use 8080 as default
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
