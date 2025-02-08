self.onmessage = async function(event) {
    let { chunkKeys } = event.data;
    chunkKeys.sort((a, b) => a - b);
    let chunkIndex = 0;
    let chunks = []; // Array to store individual blobs

    async function processNextChunk() {
        if (chunkIndex < chunkKeys.length) {
            try {
                console.log(`Loading chunk with key: ${chunkKeys[chunkIndex]}`);

                const chunkBlob = await loadChunkFromIndexedDB(chunkKeys[chunkIndex]);
                if (chunkBlob) {
                    chunks.push(chunkBlob); // Store the blob

                    chunkIndex++;
                    processNextChunk(); // Load the next chunk
                } else {
                    self.postMessage({ status: 'error', error: 'Chunk not found' });
                }
            } catch (error) {
                console.error('Error loading chunk:', error);
                self.postMessage({ status: 'error', error: error.message });
            }
        } else {
            // All chunks are loaded → Merge them into a single Blob
            const fileBlob = new Blob(chunks);
            self.postMessage({ status: 'done', blob: fileBlob });
        }
    }

    const allKeys = await getAllKeysFromIndexedDB();
    console.log(allKeys);
    
    // Start the process
    processNextChunk();
};

// IndexedDB: Load a chunk from the database
async function loadChunkFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);

        request.onerror = () => reject('Error opening IndexedDB');

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');
            const objectStore = transaction.objectStore('files');

            const chunkRequest = objectStore.get(key);
            chunkRequest.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    resolve(new Blob([result])); // Return directly as a Blob
                } else {
                    resolve(null);
                }
            };

            chunkRequest.onerror = () => reject('Error retrieving the chunk');
        };
    });
}

// 🔹 IndexedDB: Retrieve all available keys
async function getAllKeysFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);

        request.onerror = () => reject('Error opening IndexedDB');

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');
            const objectStore = transaction.objectStore('files');

            const keys = [];
            const cursorRequest = objectStore.openCursor();

            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    keys.push(cursor.key);
                    cursor.continue();
                } else {
                    resolve(keys);
                }
            };

            cursorRequest.onerror = () => reject('Error retrieving keys');
        };
    });
}
