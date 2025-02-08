export async function loadModelJson(path) {
    try {
      const response = await fetch(path);  // URL zu deiner JSON-Datei
      if (!response.ok) {
        throw new Error('Failed to fetch model JSON');
      }
      const modelData = await response.json();  // Das JSON parsen
      return modelData;
    } catch (error) {
      console.error('Error loading model JSON:', error);
    }
  }
  