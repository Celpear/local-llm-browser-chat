export function processChunksInWorker(chunkKeys) {
    return new Promise((resolve, reject) => {
        let worker;
        
        try {
            // Worker initialisieren
            worker = new Worker('/scripts/utils/worker.js');

            // Nachrichtenempfänger für den Worker
            worker.onmessage = function(event) {
                if (event.data.status === 'done') {
                    const blobUrl = URL.createObjectURL(event.data.blob);
                    resolve(blobUrl); // Erfolgreich, Blob-URL zurückgeben
                } else if (event.data.status === 'error') {
                    reject(event.data.error); // Fehler zurückgeben
                }
            };

            // Fehlerbehandlung für den Worker
            worker.onerror = function(error) {
                reject(`Fehler im Worker: ${error.message}`);
            };

            // Sende die Chunk-Schlüssel an den Worker
            worker.postMessage({ chunkKeys });
        } catch (error) {
            // Fehler beim Erstellen des Workers, z. B. wenn die Datei nicht gefunden wird
            reject(`Fehler beim Erstellen des Workers: ${error.message}`);
        }
    });
}
