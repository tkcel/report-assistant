import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";
import { firebaseApp } from "./firebase";

// Vertex AI バックエンドを使用してAIインスタンスを初期化
const ai = getAI(firebaseApp, { backend: new VertexAIBackend() });

// Flash モデル（高速な応答が必要な場合）
export const geminiFlashModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 10000,
  },
});
