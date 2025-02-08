import { addMessageToChatWindow, executeAgent } from './chat/chat.js';

import { initLLM } from './utils/llmInference.js';
import {loadChunks} from './utils/chunks_loader.js';
import {processChunksInWorker} from './utils/model_builder.js';

const models = {
    "original_file": "gemma2-2b-it-gpu-int8.bin",
    "chunks": [
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk0",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk1",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk2",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk3",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk4",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk5",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk6",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk7",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk8",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk9",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk10",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk11",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk12",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk13",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk14",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk15",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk16",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk17",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk18",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk19",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk20",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk21",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk22",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk23",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk24",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk25",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk26",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk27",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk28",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk29",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk30",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk31",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk32",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk33",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk34",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk35",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk36",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk37",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk38",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk39",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk40",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk41",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk42",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk43",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk44",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk45",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk46",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk47",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk48",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk49",
        "/llm/chunks/gemma2-2b-it-gpu-int8.bin.chunk50"
    ]
}

window.onload = async () => {
  const progressCallback = (progress) => {
      document.getElementById("preloader_sub").innerText = `Loading progress: ${progress}%`;
  };

  const failureCallback = (fileUrl, error) => {
      alert(`Failed to download ${fileUrl}:`);
      console.error(`Failed to download ${fileUrl}:`, error);
  };

  //await loadChunks(models, progressCallback, failureCallback);

  const chunkKeys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

processChunksInWorker(chunkKeys)
    .then(blobUrl => {
        console.log("Fertig! Blob-URL:", blobUrl);
        // Hier kannst du die Blob-URL verwenden, z.B. zum Anzeigen im Browser
    })
    .catch(error => {
        console.error("Fehler:", error);
    });


};




if(false){

const PRELOADER = document.getElementById('preloader');
const CHAT = document.getElementById('chat');
const CHAT_BTN = document.getElementById('chatBtn');
const CHAT_WINDOW = document.getElementById('chatWindow');

let llmInference = undefined;
let lastGeneratedResponse = '';
let activePersona = '';
const CHAT_PERSONA_NAME = 'chatPersona';
const CHAT_PERSONA_HISTORY = [];

const gpuviewdiv = document.getElementById("error-gpu");

if ('gpu' in navigator) {
  gpuviewdiv.style.display = "none";
} else {
  console.log('GPU nicht verfügbar');
}

CHAT_BTN.addEventListener('click', function () {
  executeAgent(CHAT.value, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
  CHAT.value = '';
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    executeAgent(CHAT.value, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
    CHAT.value = '';
  }
});


window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH_RECOGNITION = new window.SpeechRecognition();
SPEECH_RECOGNITION.continuous = true;
SPEECH_RECOGNITION.interimResults = true;

SPEECH_RECOGNITION.addEventListener('result', function (data) {
  for (const result of data.results) {
    if (result.isFinal) {
      executeAgent(result[0].transcript, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY, llmInference, lastGeneratedResponse, CHAT_WINDOW);
    }
  }
});

initLLM(`http://${window.location.host}/llm/gemma2-2b-it-gpu-int8.bin`, PRELOADER)
//initLLM("https://storage.googleapis.com/jmstore/WebAIDemos/models/Gemma2/gemma2-2b-it-gpu-int8.bin",PRELOADER)
  .then((llm) => {
    llmInference = llm;
  });
}