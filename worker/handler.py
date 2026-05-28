"""
RunPod Serverless handler for OmniVoice Studio.
Starts the OmniVoice FastAPI server on init, then handles TTS jobs.
"""

import runpod
import subprocess
import time
import requests
import base64
import os

OMNIVOICE_PORT = 3900
OMNIVOICE_DIR = "/app"
_server_ready = False


def start_server():
    global _server_ready
    print("[handler] Starting OmniVoice server...")
    env = {
        **os.environ,
        "PYTHONPATH": "/app/backend",
        "HF_HOME": os.environ.get("HF_HOME", "/app/omnivoice_data/huggingface"),
        "OMNIVOICE_DATA_DIR": os.environ.get("OMNIVOICE_DATA_DIR", "/app/omnivoice_data"),
        "OMNIVOICE_BIND_HOST": "0.0.0.0",
    }
    subprocess.Popen(
        ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", str(OMNIVOICE_PORT)],
        cwd=OMNIVOICE_DIR,
        env=env,
    )
    for i in range(100):
        try:
            r = requests.get(f"http://localhost:{OMNIVOICE_PORT}/health", timeout=3)
            if r.status_code == 200:
                _server_ready = True
                print(f"[handler] OmniVoice ready after {i * 3}s")
                return
        except Exception:
            pass
        time.sleep(3)
    raise RuntimeError("OmniVoice server failed to start within 5 minutes")


def handler(job):
    if not _server_ready:
        start_server()

    inp = job.get("input", {})
    text = inp.get("text", "").strip()
    language = inp.get("language", "English")

    if not text:
        return {"error": "text is required"}

    try:
        res = requests.post(
            f"http://localhost:{OMNIVOICE_PORT}/generate",
            data={"text": text, "language": language},
            timeout=120,
        )

        if not res.ok:
            return {"error": f"Generation failed: {res.status_code} — {res.text[:300]}"}

        audio_b64 = base64.b64encode(res.content).decode("utf-8")
        return {
            "audio_base64": audio_b64,
            "content_type": res.headers.get("content-type", "audio/mpeg"),
        }

    except Exception as e:
        return {"error": str(e)}


# Start OmniVoice on worker initialisation (before first job arrives)
start_server()
runpod.serverless.start({"handler": handler})
