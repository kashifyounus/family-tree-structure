import { copy } from "@/content/businessCopy";
import { toPresentedAppError } from "@/lib/errors/presentError";

export type AppErrorCode =
  | "UNKNOWN"
  | "NETWORK"
  | "AUTH"
  | "VALIDATION"
  | "STORAGE"
  | "BACKUP"
  | "NOT_FOUND"
  | "PERMISSION";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly cause?: unknown;

  constructor(
    code: AppErrorCode,
    userMessage: string,
    options?: { cause?: unknown; technical?: string },
  ) {
    super(options?.technical ?? userMessage);
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage;
    this.cause = options?.cause;
  }
}

export function toAppError(
  error: unknown,
  fallback = copy.errors.generic,
): AppError {
  return toPresentedAppError(error, fallback);
}
