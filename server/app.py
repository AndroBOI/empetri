from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import yt_dlp
import os, uuid, glob

app = Flask(__name__)
CORS(app)


@app.route("/api/health")
def health():
    return {"message": "hello from python server"}


@app.route("/api/metadata", methods=["POST"])
def get_metadata():
    try:
        url = request.get_json().get("url")
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        ydl_opts = {
            "ffmpeg_location": FFMPEG_PATH,
            "quiet": True,
            "skip_download": True,
            "extractor_args": {"youtube": {"player_client": ["web"]}},
            "js_runtimes": {"deno": {"path": DENO_PATH}},
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        return jsonify(
            {
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "uploader": info.get("uploader"),
            }
        )

    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/download", methods=["POST"])
def download():
    try:
        url = request.get_json().get("url")
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        out_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(out_dir, exist_ok=True)
        base_id = uuid.uuid4().hex
        out_tmpl = os.path.join(out_dir, f"{base_id}.%(ext)s")

        ydl_opts = {
            "ffmpeg_location": FFMPEG_PATH,
            "format": "bestaudio/best",
            "outtmpl": out_tmpl,
            "extractor_args": {"youtube": {"player_client": ["web"]}},
            "js_runtimes": {"deno": {"path": DENO_PATH}},
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        mp3_path = os.path.join(out_dir, f"{base_id}.mp3")
        if not os.path.exists(mp3_path):
            candidates = glob.glob(os.path.join(out_dir, f"{base_id}*.mp3"))
            if not candidates:
                raise FileNotFoundError("MP3 not generated")
            mp3_path = candidates[0]

        response = send_file(mp3_path, as_attachment=True, download_name="song.mp3")

        @response.call_on_close
        def cleanup():
            if os.path.exists(mp3_path):
                os.remove(mp3_path)

        return response

    except Exception as e:
        print("🔥 DOWNLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
