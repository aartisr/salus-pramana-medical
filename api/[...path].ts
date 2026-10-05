import { GoogleGenAI } from '@google/genai';
import { createApp, type ClinicalAiProvider } from '../src/server/app/create-app';
import { createRuntimeRepositories } from '../src/server/app/runtime-repositories';
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

let appPromise: ReturnType<typeof createVercelApp> | undefined;

async function createVercelApp() {
  const config = loadServerConfig();
  const repositories = await createRuntimeRepositories(config, () => new Date());
  return createApp({ config, repositories, clinicalAiProvider: createClinicalAiProvider() });
}

// Vercel routes every /api/* request here. The Express app retains its /api
// normalization middleware, while production persistence is resolved through
// the same DynamoDB runtime used by AWS Lambda.
export default async function handler(request: Parameters<Awaited<ReturnType<typeof createVercelApp>>>[0], response: Parameters<Awaited<ReturnType<typeof createVercelApp>>>[1]) {
  appPromise ??= createVercelApp();
  const app = await appPromise;
  return app(request, response);
}
