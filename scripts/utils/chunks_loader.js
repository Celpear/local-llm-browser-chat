export async function loadBinaryFile(fileUrl, retries = 3, delay = 500, failureCallback) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Loading file: ${fileUrl} (Attempt ${attempt})`);
            const response = await fetch(fileUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const blob = await response.blob();
            console.log("File successfully loaded as Blob:", blob);
            return blob; // File loaded successfully, return it

        } catch (error) {
            console.error(`Error loading ${fileUrl}: ${error}`);

            if (attempt < retries) {
                const waitTime = delay * Math.pow(2, attempt - 1); // Exponential Backoff (500ms, 1000ms, 2000ms)
                console.log(`Retrying in ${waitTime}ms...`);
                await sleep(waitTime);
            } else {
                console.error(`Failed after ${retries} attempts: ${fileUrl}`);
                
                // Call the failure callback if provided
                if (failureCallback) {
                    failureCallback(fileUrl, error); // Pass fileUrl and error to the failure callback
                }
                return null; // All attempts failed
            }
        }
    }
}

export async function initIndexedDB() {
    try {
        const request = indexedDB.open("BinaryFileDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create the "files" object store if it doesn't already exist
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files");
            }
        };

        request.onsuccess = () => {
            console.log("IndexedDB and the 'files' object store have been successfully created/connected.");
        };

        request.onerror = (event) => {
            console.error("Error opening IndexedDB:", event.target.error);
            alert("Error initializing IndexedDB.");
        };
    } catch (error) {
        console.error("Error initializing IndexedDB:", error);
        alert("Error initializing IndexedDB!");
    }
}


async function saveToIndexedDB(key, arrayBuffer) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("BinaryFileDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files");
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("files", "readwrite");
            const store = transaction.objectStore("files");

            const putRequest = store.put(arrayBuffer, key);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = (error) => reject(error);
        };

        request.onerror = (error) => reject(error);
    });
}

async function isFileInIndexedDB(key) {
    return new Promise((resolve) => {
        const request = indexedDB.open("BinaryFileDB", 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("files", "readonly");
            const store = transaction.objectStore("files");

            const getRequest = store.get(key);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(true); // File is in IndexedDB
                } else {
                    resolve(false); // File is not in IndexedDB
                }
            };

            getRequest.onerror = () => resolve(false); // Handle error, file not found
        };
    });
}

export async function loadChunks(models, progressCallback, failureCallback) {
    const totalChunks = models["chunks"].length;
    let loadedChunks = 0;

    for (const path of models["chunks"]) {
        const fileUrl = `${path}`;
        const dbKey = loadedChunks;

        // Check if the file is already in IndexedDB
        const isInDB = await isFileInIndexedDB(dbKey);
        if (isInDB) {
            console.log(`${path} (${dbKey}) already exists in IndexedDB, skipping download.`);
            loadedChunks++;
            const progress = Math.round((loadedChunks / totalChunks) * 100);
            if (progressCallback) {
                progressCallback(progress);
            }
            continue; // Skip download if file is in IndexedDB
        }

        // If the file is not in IndexedDB, load it
        const binaryBlob = await loadBinaryFile(fileUrl, 3, 500, failureCallback); // 3 retries with 500ms start delay

        if (binaryBlob) {
            const arrayBuffer = await binaryBlob.arrayBuffer();
            console.log(`Saving ${path} to IndexedDB...`);
            await saveToIndexedDB(dbKey, arrayBuffer);
            console.log(`${path} (${dbKey}) saved!`);
        }

        loadedChunks++;
        
        // Calculate the loading progress in percentage
        const progress = Math.round((loadedChunks / totalChunks) * 100);

        // Call the callback function if provided
        if (progressCallback) {
            progressCallback(progress);
        }

        await sleep(500); // Default delay between downloads
    }
}

// Helper function for delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
