export function processChunksInWorker(chunkKeys) {
    return new Promise((resolve, reject) => {
        let worker;
        
        try {
            // Initialize the worker
            worker = new Worker('/scripts/utils/worker.js');

            // Message receiver for the worker
            worker.onmessage = function(event) {
                if (event.data.status === 'done') {
                    const blobUrl = URL.createObjectURL(event.data.blob);
                    resolve(blobUrl); // Successfully return the Blob URL
                } else if (event.data.status === 'error') {
                    reject(event.data.error); // Return error
                }
            };

            // Error handling for the worker
            worker.onerror = function(error) {
                reject(`Worker error: ${error.message}`);
            };

            // Send the chunk keys to the worker
            worker.postMessage({ chunkKeys });
        } catch (error) {
            // Error creating the worker, e.g., if the file is not found
            reject(`Error creating the worker: ${error.message}`);
        }
    });
}
