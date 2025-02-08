# local-llm-browser-chat

This repository implements a local chatbot using the **Gemma2 2B** model, which stores the model in the browser's `indexedDB` to avoid reloading it each time. The chatbot can be easily started using a local server and interacts with the model stored in the browser.

## Features
- **Local Chatbot**: A fully functional chatbot running directly in the browser, without needing to rely on external servers.
- **Model Storage**: The model is stored in the browser's `indexedDB`, allowing faster load times and reducing the need to reload the model for every session.
- **Chunking Script**: The repository includes a Python script (`chunker.py`) that helps in creating chunks of a specified model, which can be used for more efficient storage and retrieval.

## Requirements

- **Python 3.x**
- **Gemma2 2B model** (Ensure the model is available for chunking and storage)
- A modern web browser that supports `indexedDB` for storage.
  
## Usage
### Starting the Server
To run the application, navigate to the main folder and start a simple HTTP server using Python:
```bash
python3 -m http.server 80
```
This will start a local server on port 80. Open your browser and navigate to http://localhost/index.html to interact with the chatbot.

## Chunking the Model
In the llm folder, there's a Python script (chunker.py) that can be used to generate model chunks. To create chunks for a specific model, run the script and pass the model name as an argument:
```bash
cd llm
python3 chunker.py <model_name>
```
This will create the necessary chunks for the specified model. These chunks will be stored locally and can be accessed by the chatbot via indexedDB.

## How It Works

### Model Chunking
When you run the `chunker.py` script, it splits the model into smaller chunks that can be stored more efficiently.

### Model Loading
The chatbot loads the model from `indexedDB`. If the model is not yet stored, it will be loaded and saved to `indexedDB` for future sessions.

### Interaction
The chatbot allows users to interact with the Gemma2 2B model directly in the browser without the need for a constant internet connection.

## Contributing
Feel free to fork the repository and submit pull requests with improvements or bug fixes.

## Greetings
A special thanks to **James Mayes** for his contributions. This webAI part is partially built upon his code. You can connect with him on [LinkedIn](https://www.linkedin.com/in/webai/).

