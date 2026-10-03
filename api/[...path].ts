import { GoogleGenAI } from '@google/genai';
import { createApp, type ClinicalAiProvider } from '../src/server/app/create-app';
import { loadServerConfig } from '../src/server/config/runtime';

function createClinicalAiProvider(): ClinicalAiProvider | undefined {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return undefined;

  const client = new GoogleGenAI({ apiKey });
  return {
    async generate(prompt) {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    },
  };
}

// Vercel routes every /api/* request here. The Express app retains its /api
// normalization middleware, so the same route implementation serves local
// development and Vercel Functions.
export default createApp({
  config: loadServerConfig(),
  clinicalAiProvider: createClinicalAiProvider(),
});
