import os
from typing import Tuple

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

SCRIBE_TRANSCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text/stream"


class ElevenLabsError(Exception):
    """Raised when the ElevenLabs API returns an error."""


class MissingApiKeyError(Exception):
    """Raised when the ELEVENLABS_API_KEY env var is missing."""


def _require_api_key() -> str:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise MissingApiKeyError(
            "ELEVENLABS_API_KEY environment variable is not set."
        )
    return api_key


def _call_scribe_api(file_tuple: Tuple[str, bytes, str], 
                     diarize: bool, 
                     language: str,
                     punctuate: bool,
                     speaker_labels: bool,
                     summarize: bool,
                     temperature: float,
                     model: str) -> dict:
    api_key = _require_api_key()
    headers = {
        "xi-api-key": api_key,
    }
    data = {
        "model_id": model,
        "diarize": str(diarize).lower(),
        "language": language,
        "punctuate": str(punctuate).lower(),
        "speaker_labels": str(speaker_labels).lower(),
        "summarize": str(summarize).lower(),
        "temperature": str(temperature),
    }
    files = {
        "file": file_tuple,
    }

    response = requests.post(
        SCRIBE_TRANSCRIBE_URL,
        headers=headers,
        data=data,
        files=files,
        timeout=120,
    )

    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = {"detail": response.text}
        raise ElevenLabsError(payload.get("detail", payload))
    try:
        return response.json()
    except ValueError as exc:  # pragma: no cover - protective
        raise ElevenLabsError("Unexpected response from ElevenLabs") from exc


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/api/transcriptions")
def create_transcription():
    if "audio" not in request.files:
        return jsonify({"error": "Missing audio file"}), 400

    audio_file = request.files["audio"]
    diarize = request.form.get("diarize", "false").lower() == "true"
    language = request.form.get("language", "en")
    punctuate = request.form.get("punctuate", "true").lower() == "true"
    speaker_labels = request.form.get("speaker_labels", "false").lower() == "true"
    summarize = request.form.get("summarize", "false").lower() == "true"
    try:
        temperature = float(request.form.get("temperature", "0.5"))
    except (TypeError, ValueError):
        return jsonify({"error": "Temperature must be a number"}), 400
    model = request.form.get("model", "scribe_v1")

    audio_file.stream.seek(0)
    audio_bytes = audio_file.stream.read()
    if not audio_bytes:
        return jsonify({"error": "Audio file is empty"}), 400
    file_tuple = (
        audio_file.filename or "audio.wav",
        audio_bytes,
        audio_file.mimetype or "application/octet-stream",
    )

    try:
        transcript = _call_scribe_api(
            file_tuple=file_tuple,
            diarize=diarize,
            language=language,
            punctuate=punctuate,
            speaker_labels=speaker_labels,
            summarize=summarize,
            temperature=temperature,
            model=model,
        )
    except MissingApiKeyError as missing_key_error:
        return jsonify({"error": str(missing_key_error)}), 500
    except ElevenLabsError as api_error:
        return jsonify({"error": str(api_error)}), 502
    return jsonify({"transcript": transcript})


if __name__ == "__main__":
    app.run(debug=True)
