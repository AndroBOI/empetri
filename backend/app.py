from flask import Flask, jsonify, request, send_file, after_this_request
from flask_cors import CORS
from youtubesearchpython import VideosSearch
import yt_dlp, os, uuid, glob

app = Flask(__name__)
CORS(app)

@app.route("/api/youtube")
def youtube_search():
    query = request.args.get("query", "stupid love")
    try:
        video = VideosSearch(query, limit=1).result()["result"][0]
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

        out_dir  = "/tmp"                       
        base_id  = uuid.uuid4().hex
        out_tmpl = os.path.join(out_dir, f"{base_id}.%(ext)s")

        ydl_opts = {
            "format": "bestaudio[ext=m4a]/bestaudio/best",
            "outtmpl": out_tmpl,
            "quiet": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        m4a_path = glob.glob(os.path.join(out_dir, f"{base_id}*.m4a"))[0]


        @after_this_request
        def cleanup(resp):
            try: os.remove(m4a_path)
            except: pass
            return resp

        return send_file(m4a_path, as_attachment=True)

    except Exception as e:
        print("🔥 DOWNLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
