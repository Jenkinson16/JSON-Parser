import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Get API key from environment (support multiple possible env var names)
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Initialize Genkit with explicit API key if available
// The plugin will also check environment variables automatically
export const ai = genkit({
  plugins: [
    googleAI(
      apiKey ? { apiKey } : undefined
    ),
  ],
  model: 'googleai/gemini-2.0-flash',
});
