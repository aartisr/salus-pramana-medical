import { afterEach, describe, expect, it, vi } from "vitest";

const mockJwtVerify = vi.fn();

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => ({})),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

type EnvSnapshot = Record<string, string | undefined>;

const envKeys = ["NODE_ENV", "ALLOW_UNAUTH_MUTATIONS", "COGNITO_ISSUER", "COGNITO_AUDIENCE"] as const;

const baseEvidencePayload = {
  evidenceId: "ev-editorial-auth-test",
  conditionId: "cond-type2-diabetes",
  medicalSystem: "Allopathy",
  interventionName: "Editorial Auth Test Intervention",
  isPharmacological: true,
  evidenceGrade: "A",
  studyMethodology: "Randomized controlled trial",
  registryIdentifier: "PMID-123450",
  sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/123450/",
  clinicalOutcomeSummary: "Observed measurable improvement in trial outcomes across the intervention arm.",
  contraindications: ["Severe renal disease"],
  interactionWarnings: ["Monitor with insulin"],
};

function captureEnv(): EnvSnapshot {
  return Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: EnvSnapshot) {
  for (const key of envKeys) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

async function loadAppWithAuthEnabled() {
  process.env.NODE_ENV = "production";
  delete process.env.ALLOW_UNAUTH_MUTATIONS;
  process.env.COGNITO_ISSUER = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example";
  process.env.COGNITO_AUDIENCE = "example-client-id";

  vi.resetModules();
  const mod = await import("./app");
  return mod.app;
}

afterEach(() => {
  mockJwtVerify.mockReset();
  vi.clearAllMocks();
});

describe("editorial publish auth smoke", () => {
  it("returns 401 on editor status path when bearer token is missing", async () => {
    const snapshot = captureEnv();
    try {
      const app = await loadAppWithAuthEnabled();
      const res = await app.request("/auth/editor-status");

      expect(res.status).toBe(401);
    } finally {
      restoreEnv(snapshot);
    }
  });

  it("returns authenticated editor status for non-editor claims", async () => {
    const snapshot = captureEnv();
    try {
      mockJwtVerify.mockResolvedValue({ payload: { email: "viewer@salus.local", "cognito:groups": ["viewers"] } });
      const app = await loadAppWithAuthEnabled();

      const res = await app.request("/auth/editor-status", {
        headers: {
          authorization: "Bearer test-token",
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.authenticated).toBe(true);
      expect(body.isEditor).toBe(false);
      expect(body.actorEmail).toBe("viewer@salus.local");
    } finally {
      restoreEnv(snapshot);
    }
  });

  it("returns authenticated editor status for editor claims", async () => {
    const snapshot = captureEnv();
    try {
      mockJwtVerify.mockResolvedValue({ payload: { email: "editor@salus.local", "cognito:groups": ["evidence-editors"] } });
      const app = await loadAppWithAuthEnabled();

      const res = await app.request("/auth/editor-status", {
        headers: {
          authorization: "Bearer test-token",
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.authenticated).toBe(true);
      expect(body.isEditor).toBe(true);
      expect(body.groups).toContain("evidence-editors");
    } finally {
      restoreEnv(snapshot);
    }
  });

  it("returns 401 on publish path when bearer token is missing", async () => {
    const snapshot = captureEnv();
    try {
      const app = await loadAppWithAuthEnabled();
      const res = await app.request("/evidence/ev-metformin-1/publish", {
        method: "PATCH",
        body: JSON.stringify({ publicationStatus: "published" }),
        headers: { "content-type": "application/json" },
      });

      expect(res.status).toBe(401);
    } finally {
      restoreEnv(snapshot);
    }
  });

  it("returns 403 for non-editor token claims", async () => {
    const snapshot = captureEnv();
    try {
      mockJwtVerify.mockResolvedValue({ payload: { email: "viewer@salus.local", "cognito:groups": ["viewers"] } });
      const app = await loadAppWithAuthEnabled();

      const res = await app.request("/evidence/ev-metformin-1/publish", {
        method: "PATCH",
        body: JSON.stringify({ publicationStatus: "published" }),
        headers: {
          "content-type": "application/json",
          authorization: "Bearer test-token",
        },
      });

      expect(res.status).toBe(403);
    } finally {
      restoreEnv(snapshot);
    }
  });

  it("allows editor token claims to create and publish evidence", async () => {
    const snapshot = captureEnv();
    try {
      mockJwtVerify.mockResolvedValue({
        payload: { email: "editor@salus.local", "cognito:groups": ["evidence-editors"] },
      });
      const app = await loadAppWithAuthEnabled();

      const createRes = await app.request("/evidence", {
        method: "POST",
        body: JSON.stringify(baseEvidencePayload),
        headers: {
          "content-type": "application/json",
          authorization: "Bearer test-token",
        },
      });
      expect(createRes.status).toBe(201);

      const publishRes = await app.request("/evidence/ev-editorial-auth-test/publish", {
        method: "PATCH",
        body: JSON.stringify({ publicationStatus: "published" }),
        headers: {
          "content-type": "application/json",
          authorization: "Bearer test-token",
        },
      });

      expect(publishRes.status).toBe(200);
      const body = await publishRes.json();
      expect(body.publicationStatus).toBe("published");
    } finally {
      restoreEnv(snapshot);
    }
  });
});
