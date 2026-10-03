import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { createApp, type ClinicalAiProvider } from './app/create-app';
import { loadServerConfig } from './config/runtime';

function createClinicalAiProvider(): ClinicalAiProvider | undefined {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return undefined;
  const client = new GoogleGenAI({ apiKey });
  return {
    async generate(prompt) {
      const response = await client.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      return response.text;
    },
  };
}

export async function startServer() {
  const config = loadServerConfig();
  const app = createApp({ config, clinicalAiProvider: createClinicalAiProvider() });
  const server = app.listen(config.port, () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : config.port;
    console.log(`SALUS Pramana API listening on http://127.0.0.1:${port}`);
  });

  const shutdown = () => new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  const handleSignal = () => void shutdown().finally(() => process.exit(0));
  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  return { app, server, shutdown };
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (entryPath === import.meta.url) void startServer();