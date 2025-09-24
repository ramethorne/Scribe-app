# Scribe Meeting Transcriber

A lightweight Flask application that lets you upload existing meeting recordings or capture fresh audio in the browser, then sends the audio to ElevenLabs' Scribe v1 speech-to-text API for transcription.


## Features

- Upload audio files (`.wav`, `.mp3`, `.m4a`, etc.) for transcription
- Record audio directly in the browser using the MediaRecorder API
- Optional transcription settings, including diarization, speaker labels, summaries, and temperature adjustments
- Displays the transcript and optional summaries returned by Scribe v1
- Built with vanilla HTML/CSS/JS on top of a Flask backend

## Requirements

- Python 3.10+
- An ElevenLabs API key with access to the Scribe v1 speech-to-text API

## Getting started

> 💡 There is no hosted demo. To try the app you need to run the Flask server locally so the frontend can talk to the backend that proxies ElevenLabs' API.

1. **Clone & set up the project**

   ```bash
   git clone <repo-url>
   cd Scribe-app
   python -m venv .venv
   source .venv/bin/activate  # On Windows use `.venv\\Scripts\\activate`
   pip install -r requirements.txt
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root (or export variables another way) and set your ElevenLabs key:

   ```env
   ELEVENLABS_API_KEY=your_xi_api_key
   ```

3. **Run the development server**

   With the virtual environment active, start Flask:

   ```bash
   flask --app app run  # or `python app.py`
   ```

   This boots both the UI and the API at http://127.0.0.1:5000/. Open that URL in a browser tab to use the app interactively.

4. **Use the app**

   - When prompted, grant your browser permission to use the microphone so recording works.
   - Click **Start recording** to capture a clip in the browser, then **Transcribe recording** once you're done. The audio is streamed through the Flask backend to ElevenLabs for transcription.
   - Alternatively, drag an existing audio file into the upload box and press **Transcribe file**.

   After ElevenLabs finishes processing, the transcript (and any optional summary) is rendered directly in the results panel on the same page.

## Notes on the Scribe API

- The backend proxies requests to `https://api.elevenlabs.io/v1/speech-to-text/stream` and forwards optional parameters such as diarization, speaker labels, summaries, and temperature.
- Ensure the authenticated account has access to Scribe v1; otherwise, the ElevenLabs API may respond with an authorization error.
- The proxy responds with `502` errors when the upstream request fails—check the JSON payload for details when debugging.

## Production tips

- Consider fronting the Flask application with a production-ready WSGI server such as `gunicorn`.
- Secure the `/api/transcriptions` endpoint (e.g., via authentication) if you deploy this publicly.
- Modern browsers require HTTPS to access the microphone. When deploying, ensure the app is served over HTTPS so the MediaRecorder API can function.

## License

MIT
