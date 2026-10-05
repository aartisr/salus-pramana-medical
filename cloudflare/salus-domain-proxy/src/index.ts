interface Env {
  /** The HTTPS Lambda Function URL emitted by the AWS deployment stack. */
  SALUS_ORIGIN?: string;
}

function originUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * TLS terminates at Cloudflare for myocardianregen.ai-aarti.com; this worker
 * transparently proxies every path, query, and method to the AWS Function URL.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = originUrl(env.SALUS_ORIGIN);
    if (!origin) {
      return new Response('SALUS origin is not configured.', {
        status: 503,
        headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    const incoming = new URL(request.url);
    origin.pathname = incoming.pathname;
    origin.search = incoming.search;

    const upstream = new Request(origin.toString(), request);
    upstream.headers.delete('host');
    upstream.headers.set('x-salus-public-host', incoming.host);
    return fetch(upstream);
  },
};
