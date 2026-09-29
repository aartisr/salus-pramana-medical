const LOCAL_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

export function getAllowedOrigins(): string[] | "*" {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw) {
    // An open CORS policy is convenient locally, but it is never a safe production default.
    return process.env.NODE_ENV === "production" ? [] : LOCAL_ORIGINS;
  }
  if (raw === "*") {
    return "*";
  }

  const origins = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : LOCAL_ORIGINS;
}

export function isStrictGovernanceEnabled(strictQuery: string | undefined): boolean {
  if (strictQuery === "true") return true;
  if (strictQuery === "false") return false;
  return process.env.STRICT_GOVERNANCE_GATES === "true";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
