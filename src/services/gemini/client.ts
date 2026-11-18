import { getGenerativeModel } from 'firebase/ai';
import { ai } from '@/config/firebase';
import { GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK } from '@/config/constants';

/**
 * Get a Gemini generative model instance from Firebase AI Logic.
 * Falls back to the lite model if primary is not available.
 */
export function getGeminiModel(useFallback = false) {
  const modelName = useFallback ? GEMINI_MODEL_FALLBACK : GEMINI_MODEL_PRIMARY;
  return getGenerativeModel(ai, { model: modelName });
}
