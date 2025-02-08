self.onmessage = async function(event) {
    const { chunkKeys } = event.data;
    let chunkIndex = 0;

    // Function to load and process chunks from IndexedDB one by one
    async function processNextChunk() {
        if (chunkIndex < chunkKeys.length) {
            try {
                // Debugging: Show the current key
                console.log(`Loading chunk with key: ${chunkKeys[chunkIndex]}`);

                const chunk = await loadChunkFromIndexedDB(chunkKeys[chunkIndex]);
                console.log(`processNextChunk: ${chunk}`);
                if (chunk) {
                    if (chunkIndex === 0) {
                        self.combinedArrayBuffer = new ArrayBuffer(0);  // Initialize the ArrayBuffer
                    }

                    self.combinedArrayBuffer = concatenateChunks(self.combinedArrayBuffer, chunk);  // Combine the chunks

                    chunkIndex++; // Move to the next chunk
                    processNextChunk(); // Recursively request and process the next chunk
                } else {
                    self.postMessage({ status: 'error', error: 'Chunk not found' });
                }
            } catch (error) {
                console.error('Error loading the chunk:', error);  // Log the error in the Worker
                self.postMessage({ status: 'error', error: error.message });  // Send the error to the main thread
            }
        } else {
            // When all chunks are processed, convert the combined ArrayBuffer into a Blob
            const fileBlob = new Blob([self.combinedArrayBuffer]);
            self.postMessage({ status: 'done', blob: fileBlob });  // Send back to the main thread
        }
    }

    const allKeys = await getAllKeysFromIndexedDB();
    console.log(allKeys);
    
    // Start the process
    processNextChunk();
};

// Function to load a chunk from IndexedDB
async function loadChunkFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);  // Ensure the version is correct

        request.onerror = (error) => {
            console.error('Error opening IndexedDB:', error);  // Log error when opening DB
            reject('Error opening IndexedDB');
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');  // Use the correct Object Store
            const objectStore = transaction.objectStore('files');

            const chunkRequest = objectStore.get(key);  // Get the value using the key
            console.log(`loadChunkFromIndexedDB.onsuccess:${chunkRequest}`);

            chunkRequest.onsuccess = (event) => {
                // Assuming chunkRequest.result contains the byte array
                const byteArray = chunkRequest.result;
                console.log(`Chunk found with Key ${key}:`, byteArray);
                
                // If the value exists, return it
                if (byteArray) {
                    resolve(byteArray);  // Directly return the byte array
                } else {
                    resolve(null);  // If no chunk was found
                }
            };

            chunkRequest.onerror = (error) => {
                console.error('Error retrieving the chunk:', error);  // Log error retrieving the chunk
                reject('Error retrieving the chunk');
            };
        };
    });
}

// Function to concatenate chunks into an ArrayBuffer
function concatenateChunks(existingBuffer, newChunk) {
    const newArrayBuffer = new ArrayBuffer(existingBuffer.byteLength + newChunk.byteLength);
    const combinedView = new Uint8Array(newArrayBuffer);

    combinedView.set(new Uint8Array(existingBuffer), 0);
    combinedView.set(new Uint8Array(newChunk), existingBuffer.byteLength);

    return newArrayBuffer;
}

// Function to retrieve all keys from the IndexedDB Object Store
async function getAllKeysFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);  // Ensure the version is correct

        request.onerror = (error) => {
            console.error('Error opening IndexedDB:', error);
            reject('Error opening IndexedDB');
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');  // Access the 'files' Object Store
            const objectStore = transaction.objectStore('files');
            const keys = [];  // Array to store all keys
            const cursorRequest = objectStore.openCursor();  // Cursor for the Object Store

            cursorRequest.onerror = (error) => {
                console.error('Error iterating through IndexedDB:', error);
                reject('Error retrieving the keys');
            };

            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    keys.push(cursor.key);  // Store the key of the current cursor
                    cursor.continue();  // Move to the next item
                } else {
                    resolve(keys);  // All keys have been collected, return them
                }
            };
        };
    });
}
