import { marked } from "../extern/marked.js";

export function addMessageToChatWindow(message, sender, chatWindow) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'userMessage' : 'botMessage');
      
    // Setze das HTML in das Element
    messageElement.innerHTML = marked.parse(message);
  
    // Füge die Nachricht zum Chatfenster hinzu
    chatWindow.appendChild(messageElement);
    
    // Scrolle zum neuesten Eintrag
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  
  export function executeAgent(task, personaName, personaHistory, llmInference, lastGeneratedResponse, chatWindow) {
    if (lastGeneratedResponse === '') {
      personaHistory.push('<start_of_turn>user\n' + task + '<end_of_turn>\n<start_of_turn>model\n');
  
      if (llmInference !== undefined) {
        llmInference.generateResponse(personaHistory.join(''), (partialResults, complete) => {
          lastGeneratedResponse += partialResults;
          if (complete) {
            addMessageToChatWindow(lastGeneratedResponse, 'bot', chatWindow);
            lastGeneratedResponse = '';
          }
        });
      }
  
      addMessageToChatWindow(task, 'user', chatWindow);
    } else {
      console.warn('Agent is busy!');
    }
  }
  