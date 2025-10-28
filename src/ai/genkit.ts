
import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const googleApiKey = process.env.GEMINI_API_KEY;
if (!googleApiKey) {
  // This is a server-side check.
  if (process.env.NODE_ENV === 'production') {
    console.warn('GEMINI_API_KEY is not set. Genkit will not work.');
  } else {
    console.log('GEMINI_API_KEY is not set. Using fallback for development.');
  }
}

export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
