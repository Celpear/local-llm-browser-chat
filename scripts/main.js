import { addMessageToChatWindow, executeAgent } from './chat/chat.js';

import { initLLM } from './utils/llmInference.js';
import {loadChunks} from './utils/chunks_loader.js';
import {loadModelJson} from './utils/fetchdata.js'
import {processChunksInWorker} from './utils/model_builder.js';

const PRELOADER = document.getElementById('preloader');
const CHAT = document.getElementById('chat');
const CHAT_BTN = document.getElementById('chatBtn');
const CHAT_WINDOW = document.getElementById('chatWindow');
const PRELOADER_MSG = document.getElementById('preloader_sub');


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

window.onload = async () => {
  const models = await loadModelJson("llm/chunks/gemma2-2b-it-gpu-int8.bin.json");
  const progressCallback = (progress) => {
    if(progress > 99){
      PRELOADER_MSG.innerText = `Assemble model...`;
    }else{
      PRELOADER_MSG.innerText = `Model loading: ${progress}%`;
    }
  };

  const failureCallback = (fileUrl, error) => {
      alert(`Failed to download ${fileUrl}:`);
      console.error(`Failed to download ${fileUrl}:`, error);
  };

  await loadChunks(models, progressCallback, failureCallback);

  processChunksInWorker(Array.from({ length: models["chunks"].length }, (_, i) => i))
    .then(blobUrl => {
        console.log("Assembled model blob-URL:", blobUrl);
        initLLM(blobUrl, PRELOADER)
        //initLLM(`http://${window.location.host}/llm/gemma2-2b-it-gpu-int8.bin`, PRELOADER)
          .then((llm) => {
            llmInference = llm;
        });
    })
    .catch(error => {
        console.error("Fehler:", error);
    });
};