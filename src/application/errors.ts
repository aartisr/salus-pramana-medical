export type ApplicationErrorCode = "unauthorized" | "forbidden" | "validation";

export class ApplicationError extends Error {
  constructor(readonly code: ApplicationErrorCode, message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ApplicationError";
  }
}