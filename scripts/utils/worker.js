self.onmessage = async function(event) {
    const { chunkKeys } = event.data;
    let chunkIndex = 0;
    let chunks = []; // Array für die einzelnen Blobs

    async function processNextChunk() {
        if (chunkIndex < chunkKeys.length) {
            try {
                console.log(`Lade Chunk mit Schlüssel: ${chunkKeys[chunkIndex]}`);

                const chunkBlob = await loadChunkFromIndexedDB(chunkKeys[chunkIndex]);
                if (chunkBlob) {
                    chunks.push(chunkBlob); // Speichere den Blob

                    chunkIndex++;
                    processNextChunk(); // Nächster Chunk laden
                } else {
                    self.postMessage({ status: 'error', error: 'Chunk nicht gefunden' });
                }
            } catch (error) {
                console.error('Fehler beim Laden des Chunks:', error);
                self.postMessage({ status: 'error', error: error.message });
            }
        } else {
            // Alle Chunks sind geladen → Zusammenfügen als ein Blob
            const fileBlob = new Blob(chunks);
            self.postMessage({ status: 'done', blob: fileBlob });
        }
    }

    const allKeys = await getAllKeysFromIndexedDB();
    console.log(allKeys);
    
    // Starte den Prozess
    processNextChunk();
};

// 🔹 IndexedDB: Chunk aus DB laden
async function loadChunkFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);

        request.onerror = () => reject('Fehler beim Öffnen von IndexedDB');

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');
            const objectStore = transaction.objectStore('files');

            const chunkRequest = objectStore.get(key);
            chunkRequest.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    resolve(new Blob([result])); // Direkt als Blob zurückgeben
                } else {
                    resolve(null);
                }
            };

            chunkRequest.onerror = () => reject('Fehler beim Abrufen des Chunks');
        };
    });
}

// 🔹 IndexedDB: Alle verfügbaren Keys abrufen
async function getAllKeysFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BinaryFileDB', 1);

        request.onerror = () => reject('Fehler beim Öffnen von IndexedDB');

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

            cursorRequest.onerror = () => reject('Fehler beim Abrufen der Schlüssel');
        };
    });
}
