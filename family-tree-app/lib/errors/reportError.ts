import { AppError, toAppError } from "@/lib/errors/AppError";

export type ErrorReporter = (error: AppError) => void;

let reporter: ErrorReporter | null = null;

export function setErrorReporter(fn: ErrorReporter | null) {
  reporter = fn;
}

/** Central place to normalize errors before showing them in UI. */
export function reportError(error: unknown, fallbackMessage?: string): AppError {
  const appError = toAppError(error, fallbackMessage);
  if (__DEV__) {
    console.error(`[${appError.code}]`, appError.message, appError.cause);
  }
  reporter?.(appError);
  return appError;
}
