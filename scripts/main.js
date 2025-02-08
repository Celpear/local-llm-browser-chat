import { addMessageToChatWindow, executeAgent } from './chat/chat.js';

import { initLLM } from './utils/llmInference.js';
import { loadChunks } from './utils/chunks_loader.js';
import { loadModelJson } from './utils/fetchdata.js';
import { processChunksInWorker } from './utils/model_builder.js';

const PRELOADER = document.getElementById('preloader');
const CHAT = document.getElementById('chat');
const CHAT_BTN = document.getElementById('chatBtn');
const CHAT_WINDOW = document.getElementById('chatWindow');
const PRELOADER_MSG = document.getElementById('preloader_sub');

// Declare variables for model inference and user interaction
let llmInference = undefined;
let lastGeneratedResponse = '';
let activePersona = '';
const CHAT_PERSONA_NAME = 'chatPersona';
const CHAT_PERSONA_HISTORY = [];

// Check if the browser supports GPU
const gpuviewdiv = document.getElementById("error-gpu");

if ('gpu' in navigator) {
  gpuviewdiv.style.display = "none"; // Hide GPU error message if GPU is available
} else {
  console.log('GPU not available');
}

// Button to send chat messages
CHAT_BTN.addEventListener('click', function () {
  executeAgent(CHAT.value, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
  CHAT.value = ''; // Clear the input field after sending
});

// Listen for Enter key to send messages
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    executeAgent(CHAT.value, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
    CHAT.value = ''; // Clear the input field after sending
  }
});

// Speech Recognition functionality
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH_RECOGNITION = new window.SpeechRecognition();
SPEECH_RECOGNITION.continuous = true;
SPEECH_RECOGNITION.interimResults = true;

// Event listener for speech recognition result
SPEECH_RECOGNITION.addEventListener('result', function (data) {
  for (const result of data.results) {
    if (result.isFinal) {
      executeAgent(result[0].transcript, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
    }
  }
});

window.onload = async () => {
  // Load model chunks from the specified JSON file
  const models = await loadModelJson("llm/chunks/gemma2-2b-it-gpu-int8.bin.json");

  // Progress callback to update loading status
  const progressCallback = (progress) => {
    if (progress > 99) {
      PRELOADER_MSG.innerText = `Assembling model...`;
    } else {
      PRELOADER_MSG.innerText = `Model loading: ${progress}%`;
    }
  };

  // Failure callback to handle errors during chunk loading
  const failureCallback = (fileUrl, error) => {
    alert(`Failed to download ${fileUrl}:`);
    console.error(`Failed to download ${fileUrl}:`, error);
  };

  // Load chunks for the model
  await loadChunks(models, progressCallback, failureCallback);

  // Process model chunks in the worker and initialize the model
  processChunksInWorker(Array.from({ length: models["chunks"].length }, (_, i) => i))
    .then(blobUrl => {
        console.log("Assembled model blob-URL:", blobUrl);
        PRELOADER_MSG.innerText = "Init Model...";
        initLLM(blobUrl, PRELOADER)
          .then((llm) => {
            llmInference = llm;
        });
    })
    .catch(error => {
        console.error("Error:", error);
    });
};
