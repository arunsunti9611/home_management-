from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

STATE_FILE = 'shared_state.json'

def load_file():
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save_file(data):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f)

@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify(load_file())

@app.route('/api/state', methods=['POST'])
def post_state():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'error': 'invalid json'}), 400
    save_file(data)
    return jsonify({'ok': True})

# Serve static files (index.html, app.js, etc.)
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    app.run(host=args.host, port=args.port)
