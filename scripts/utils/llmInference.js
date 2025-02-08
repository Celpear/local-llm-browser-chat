import { FilesetResolver, LlmInference } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';

export async function initLLM(modelUrl, preloaderElement) {
  const genaiFileset = await FilesetResolver.forGenAiTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
  );
  console.log(genaiFileset);
  let llm = await LlmInference.createFromOptions(genaiFileset, {
    baseOptions: { modelAssetPath: modelUrl },
    maxTokens: 8000,
    topK: 1,
    temperature: 1,
    randomSeed: 64
  });

  preloaderElement.style.display = "none"; // Hide preloader when done
  return llm;
}
