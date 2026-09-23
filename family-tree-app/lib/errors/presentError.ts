import { copy } from "@/content/businessCopy";
import { AppError, type AppErrorCode } from "@/lib/errors/AppError";
import { RelationshipRuleError } from "@/lib/rules/relationshipRules";

const CODE_MESSAGES: Record<AppErrorCode, string> = {
  UNKNOWN: copy.errors.generic,
  NETWORK: copy.errors.network,
  AUTH: copy.errors.auth,
  VALIDATION: copy.errors.validation,
  STORAGE: copy.errors.storage,
  BACKUP: copy.errors.backup,
  NOT_FOUND: copy.errors.notFound,
  PERMISSION: copy.errors.permission,
};

/** Maps thrown errors (including legacy technical messages) to safe user copy. */
export function presentUserMessage(error: unknown, fallback?: string): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof RelationshipRuleError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (
      (msg.includes("union") && msg.includes("child")) ||
      msg.includes("linked to children")
    ) {
      return copy.errors.deleteLinkedChildren;
    }
    if (
      msg.includes("child in a union") ||
      msg.includes("recorded as a child") ||
      msg.includes("child in a marriage")
    ) {
      return copy.errors.deleteLinkedAsChild;
    }
    if (msg.includes("union or second parent")) {
      return copy.errors.needMarriageForChild;
    }
    if (msg.includes("already exists")) {
      return copy.errors.duplicateEmail;
    }
    if (msg.includes("incorrect password")) {
      return copy.errors.wrongPassword;
    }
    if (msg.includes("no local account")) {
      return copy.errors.memberMissing;
    }
    if (msg.includes("cancelled")) {
      return copy.errors.authCancelled;
    }
    if (msg.includes("not configured") || msg.includes("expo_public")) {
      return copy.errors.backupNotConfigured;
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return copy.errors.network;
    }

    if (__DEV__) {
      console.warn("[presentUserMessage] Unmapped Error:", error.message);
    }
  }

  return fallback ?? copy.errors.generic;
}

export function toPresentedAppError(
  error: unknown,
  fallback?: string,
): AppError {
  if (error instanceof AppError) return error;

  const userMessage = presentUserMessage(error, fallback ?? copy.errors.generic);
  let code: AppErrorCode = "UNKNOWN";
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    if (m.includes("password") || m.includes("account")) code = "AUTH";
    else if (m.includes("union") || m.includes("delete")) code = "VALIDATION";
    else if (m.includes("backup") || m.includes("drive")) code = "BACKUP";
  }

  const technical =
    error instanceof Error ? error.message : error ? String(error) : undefined;

  return new AppError(code, userMessage, {
    cause: error,
    technical,
  });
}

export function messageForCode(code: AppErrorCode): string {
  return CODE_MESSAGES[code];
}

export function toAppError(error: unknown, fallback?: string): AppError {
  return toPresentedAppError(error, fallback ?? copy.errors.generic);
}
