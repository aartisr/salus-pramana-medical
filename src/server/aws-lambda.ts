import serverlessExpress from '@codegenie/serverless-express';
import { GoogleGenAI } from '@google/genai';
import { createApp, type ClinicalAiProvider } from './app/create-app';
import { createRuntimeRepositories } from './app/runtime-repositories';
import { loadServerConfig } from './config/runtime';

function createClinicalAiProvider(): ClinicalAiProvider | undefined {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return undefined;
  const client = new GoogleGenAI({ apiKey });
  return { async generate(prompt) { return (await client.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })).text; } };
}

let cachedHandler: ReturnType<typeof serverlessExpress> | undefined;

/** Lambda entry point. Dependencies are initialized once per warm execution environment. */
export async function handler(event: Parameters<ReturnType<typeof serverlessExpress>>[0], context: Parameters<ReturnType<typeof serverlessExpress>>[1]) {
  if (!cachedHandler) {
    const config = loadServerConfig();
    const repositories = await createRuntimeRepositories(config, () => new Date());
    cachedHandler = serverlessExpress({ app: createApp({ config, repositories, clinicalAiProvider: createClinicalAiProvider() }) });
  }
  return cachedHandler(event, context);
}
