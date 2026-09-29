#!/usr/bin/env node

const apiBaseUrl = process.env.SALUS_API_BASE_URL || process.env.VITE_API_BASE_URL;
const accessToken = process.env.SALUS_ACCESS_TOKEN;
const expectEditor = (process.env.SALUS_EXPECT_EDITOR || "true").toLowerCase() !== "false";

function fail(message) {
  console.error(`Editor role verification failed: ${message}`);
  process.exit(1);
}

if (!apiBaseUrl) {
  fail("Missing SALUS_API_BASE_URL (or VITE_API_BASE_URL). Example: https://<function-url>");
}

if (!accessToken) {
  fail("Missing SALUS_ACCESS_TOKEN bearer token. Use a Cognito access token for the signed-in user.");
}

const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/auth/editor-status`;

async function run() {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payloadText = await response.text();
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    payload = { raw: payloadText };
  }

  if (!response.ok) {
    fail(`${response.status} ${response.statusText} at ${endpoint}. Response: ${payloadText}`);
  }

  const isEditor = Boolean(payload?.isEditor);
  const actorEmail = payload?.actorEmail || "unknown";
  const groups = Array.isArray(payload?.groups) ? payload.groups.join(", ") : "";

  console.log("Editor role verification result:");
  console.log(`- endpoint: ${endpoint}`);
  console.log(`- actorEmail: ${actorEmail}`);
  console.log(`- isEditor: ${isEditor}`);
  console.log(`- groups: ${groups || "(none)"}`);

  if (expectEditor && !isEditor) {
    fail("User is authenticated but not in evidence-editors group.");
  }

  process.exit(0);
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
