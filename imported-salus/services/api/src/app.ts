import { Hono } from "hono";
import { cors } from "hono/cors";
import { getAllowedOrigins, isProduction } from "./config";
import { registerEvidenceRoutes } from "./routes/evidence-routes";
import { registerIntelligenceRoutes } from "./routes/intelligence-routes";

export const app = new Hono();

function createCorrelationId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function writeLog(event: string, fields: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      ...fields,
    }),
  );
}

app.use("*", cors({ origin: getAllowedOrigins(), allowMethods: ["GET", "POST", "PATCH", "OPTIONS"], allowHeaders: ["Authorization", "Content-Type", "X-Correlation-Id"] }));

app.use("*", async (c, next) => {
  c.header("x-content-type-options", "nosniff");
  c.header("x-frame-options", "DENY");
  c.header("referrer-policy", "strict-origin-when-cross-origin");
  c.header("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  c.header("cache-control", c.req.method === "GET" ? "no-store" : "no-store");

  if (isProduction()) {
    c.header("strict-transport-security", "max-age=31536000; includeSubDomains");
  }

  const contentLength = Number(c.req.header("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return c.json({ error: "Request body exceeds the 1 MB limit" }, 413);
  }
  await next();
});

app.use("*", async (c, next) => {
  const start = Date.now();
  const requestUrl = new URL(c.req.url);
  const correlationId = c.req.header("x-correlation-id") ?? c.req.header("x-request-id") ?? createCorrelationId();

  c.header("x-correlation-id", correlationId);
  writeLog("request.start", {
    correlationId,
    method: c.req.method,
    path: requestUrl.pathname,
    query: requestUrl.search,
  });

  try {
    await next();

    writeLog("request.finish", {
      correlationId,
      method: c.req.method,
      path: requestUrl.pathname,
      status: c.res.status,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    writeLog("request.error", {
      correlationId,
      method: c.req.method,
      path: requestUrl.pathname,
      durationMs: Date.now() - start,
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    });

    c.header("x-correlation-id", correlationId);
    return c.json({ error: "Internal server error", correlationId }, 500);
  }
});

app.get("/health", (c) => c.json({ ok: true, service: "salus-api", motto: "The evidence behind every path to healing." }));
registerEvidenceRoutes(app);
registerIntelligenceRoutes(app);
