import { GoogleGenAI } from '@google/genai';

const isGeminiConfigured = (): boolean => {
  return !!process.env.GEMINI_API_KEY;
};

let ai: GoogleGenAI | null = null;

if (isGeminiConfigured()) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Google Gemini AI service initialized.');
  } catch (error) {
    console.error('Error initializing Gemini AI SDK:', error);
  }
} else {
  console.log('GEMINI_API_KEY missing. Defaulting to mock transcription/summarization.');
}

export { ai, isGeminiConfigured };
