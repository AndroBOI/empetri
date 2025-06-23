from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from youtubesearchpython import VideosSearch
import yt_dlp
import os, uuid, glob

app = Flask(__name__)
CORS(app)

@app.route("/api/youtube")
def youtube_search():
    query = request.args.get("query", "stupid love")
    try:
        search   = VideosSearch(query, limit=1)
        video    = search.result()["result"][0]
        video["link"] = f"https://www.youtube.com/watch?v={video['id']}"
        return jsonify(video)
    except Exception as e:
        print("🔥 SEARCH ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/youtube/download", methods=["POST"])
def download_video():
    try:
        video_url = request.get_json().get("url")
        if not video_url:
            return jsonify({"error": "No URL provided"}), 400

    
        out_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(out_dir, exist_ok=True)
        base_id = uuid.uuid4().hex                     
        out_tmpl = os.path.join(out_dir, f"{base_id}.%(ext)s")


        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": out_tmpl,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])


        mp3_path = os.path.join(out_dir, f"{base_id}.mp3")
        if not os.path.exists(mp3_path):
           
            candidates = glob.glob(os.path.join(out_dir, f"{base_id}*.mp3"))
            if not candidates:
                raise FileNotFoundError("MP3 file was not generated")
            mp3_path = candidates[0]

      
        return send_file(mp3_path, as_attachment=True)

    except Exception as e:
        print("🔥 DOWNLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

