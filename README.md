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

## Sharing your copy on GitHub (beginner friendly)

If you only see the README file on GitHub right now, it just means you have not pushed the rest of the project yet. Follow these steps once and your full copy of the app will appear on GitHub. The instructions are written for absolute beginners—just go in order.

1. **Create an empty GitHub repository**

   1. Sign in at [https://github.com](https://github.com).
   2. Click the ➕ in the top-right corner and choose **New repository**.
   3. Give it a name (for example `scribe-app`) and press **Create repository**. Do not add a README, `.gitignore`, or license—the project already has those.

2. **Get the project onto your computer (only once)**

   ```bash
   # If you do not already have git installed, download it from https://git-scm.com/downloads
   git clone https://github.com/your-username/scribe-app.git
   cd scribe-app
   ```

   If you already downloaded a ZIP from this project earlier, open that ZIP, copy its contents, and paste/replace them inside the new `scribe-app` folder you just cloned. You should see files such as `app.py`, `requirements.txt`, `static/`, and `templates/` next to `README.md`.

3. **Save (commit) the project locally**

   ```bash
   git status             # Shows which files are ready
   git add .              # Stage everything
   git commit -m "Add Scribe meeting transcriber"
   ```

   After the commit finishes you can type `git status` again. If it says “nothing to commit, working tree clean” you are ready for the final step.

4. **Push (upload) the commit to GitHub**

   ```bash
   git push origin main   # or "master" if GitHub named your default branch that
   ```

   Refresh your repository page on GitHub. All of the project files—including the app, frontend assets, and this README—will now be visible. From this point forward, whenever you make changes locally repeat only steps 3 and 4 to update GitHub.

### Alternative: upload without using the command line

If you prefer not to install git, you can also upload through the GitHub website:

1. Create a new repository as in step 1 above.
2. Click **uploading an existing file** on the empty repository page.
3. Drag the entire project folder (or individual files) into the browser window.
4. Scroll down, write a short commit message, and click **Commit changes**.

This method is slower for future updates but works fine if you only need to upload the project once.

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
