const uploadForm = document.getElementById("upload-form");
const transcriptOutput = document.getElementById("transcript-output");
const summaryContainer = document.getElementById("summary-container");
const summaryOutput = document.getElementById("summary-output");
const errorTemplate = document.getElementById("error-template");
const recordButton = document.getElementById("record-btn");
const recordingStatus = document.getElementById("recording-status");
const recordingPreview = document.getElementById("recording-preview");
const transcribeRecordingBtn = document.getElementById("transcribe-recording");

let mediaRecorder;
let recordedChunks = [];
let recordedBlob;

function showError(message) {
  const node = errorTemplate.content.cloneNode(true);
  node.querySelector(".error").textContent = message;
  document.querySelector("main").prepend(node);
}

async function submitAudio(formData) {
  transcriptOutput.textContent = "Transcribing...";
  summaryContainer.hidden = true;
  summaryOutput.textContent = "";

  try {
    const response = await fetch("/api/transcriptions", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || "Failed to transcribe file");
    }

    const payload = await response.json();
    const transcript = payload.transcript;
    const transcriptText = transcript?.text || transcript?.transcription || JSON.stringify(transcript, null, 2);
    transcriptOutput.textContent = transcriptText;

    const summary = transcript?.summary || transcript?.summaries?.[0]?.text;
    if (summary) {
      summaryOutput.textContent = summary;
      summaryContainer.hidden = false;
    }
  } catch (error) {
    console.error(error);
    showError(error.message);
    transcriptOutput.textContent = "";
  }
}

uploadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);

  ["diarize", "speaker_labels", "summarize", "punctuate"].forEach((key) => {
    formData.set(key, uploadForm.querySelector(`#${key.replace("_", "-")}`)?.checked);
  });

  submitAudio(formData);
});

recordButton?.addEventListener("click", async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordButton.textContent = "Start recording";
    recordingStatus.textContent = "Processing recording...";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", () => {
      recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });
      recordingPreview.src = URL.createObjectURL(recordedBlob);
      recordingPreview.hidden = false;
      transcribeRecordingBtn.disabled = false;
      recordingStatus.textContent = "Recording finished";
    });

    mediaRecorder.start();
    recordButton.textContent = "Stop recording";
    recordingStatus.textContent = "Recording...";
    transcribeRecordingBtn.disabled = true;
    recordingPreview.hidden = true;
  } catch (error) {
    console.error(error);
    showError("Unable to access microphone: " + error.message);
  }
});

transcribeRecordingBtn?.addEventListener("click", async () => {
  if (!recordedBlob) return;
  const formData = new FormData();
  formData.append("audio", recordedBlob, "recording.webm");
  formData.append("language", document.getElementById("language").value);
  formData.append("model", document.getElementById("model").value);
  formData.append("temperature", document.getElementById("temperature").value);
  formData.append("diarize", document.getElementById("diarize").checked);
  formData.append("speaker_labels", document.getElementById("speaker-labels").checked);
  formData.append("summarize", document.getElementById("summarize").checked);
  formData.append("punctuate", document.getElementById("punctuate").checked);

  submitAudio(formData);
});
