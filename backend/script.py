from flask import Flask, jsonify
from flask_cors import CORS
from youtubesearchpython import VideosSearch

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Hello, world!"

@app.route('/api/youtube')
def youtube_search():
    try:
        search = VideosSearch("What is Love", limit=1)
        results = search.result()["result"]
        video = results[0]
        return jsonify(video)
    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
