# serve.py
from flask import Flask, request, Response, send_from_directory, jsonify
from flask_cors import CORS
import threading, json, time, os
import streamlit as st
from streamlit_autorefresh import st_autorefresh
import requests

app = Flask(__name__)
CORS(app)                       


current_params = {"kv": 80, "mA": 100, "Sec": 2, "kode": "x"}
lock = threading.Lock()

BACKEND = "http://localhost:8000"

@app.route("/update", methods=["POST"])
def update_params():
    data = request.get_json(force=True) or {}
    with lock:
        current_params.update(data)
    return jsonify(status="ok")


@app.route("/events")
def sse_events():
    def stream():
        while True:
            with lock:
                payload = json.dumps(current_params)
            yield f"data: {payload}\n\n"
            time.sleep(0.1)      # 10 fps
    return Response(stream(), mimetype="text/event-stream")


@app.route("/status")
def get_status():
    with lock:
        return jsonify(kode=current_params["kode"])


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR  = os.path.join(BASE_DIR, "web")

@app.route("/web/<path:filename>")
def serve_web(filename):
    return send_from_directory(WEB_DIR, filename)

# ---------------------------
# main
# ---------------------------
if __name__ == "__main__":
    print("=== FLASK SERVER STARTED ===")
    print("Listening  : http://localhost:8000")
    print("SSE stream : http://localhost:8000/events")
    print("Simulation : http://localhost:8000/web/index.html")
    app.run(port=8000, debug=True)

# Auto-refresh setiap 2 detik
st_autorefresh(interval=2000, key="status_poll")

def get_backend_status():
    try:
        resp = requests.get(f"{BACKEND}/status", timeout=0.2)
        kode_backend = resp.json().get("kode", "x")
        if kode_backend == "e":
            return "ON"
        elif kode_backend == "p":
            return "PRE"
        else:
            return "OFF"
    except:
        return "OFF"

# Ambil status backend
auto_status = get_backend_status()

# Tampilkan radio button, index sesuai status backend
kode = st.radio(
    "Status",
    ["OFF", "PRE", "ON"],
    horizontal=True,
    index=["OFF", "PRE", "ON"].index(auto_status),
    key="status_radio"
)
