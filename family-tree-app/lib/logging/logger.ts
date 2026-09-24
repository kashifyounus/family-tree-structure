/**
 * In-app diagnostics for genealogy workflows (storage, API, navigation).
 * Verbose logs are dev-only; warnings and errors always emit to logcat.
 */

const PREFIX = "KuriosityFamilyTree";

type LogFields = Record<string, unknown>;

function line(scope: string, message: string, fields?: LogFields): string {
  if (!fields || Object.keys(fields).length === 0) {
    return `[${PREFIX}][${scope}] ${message}`;
  }
  return `[${PREFIX}][${scope}] ${message} ${JSON.stringify(fields)}`;
}

export const log = {
  lifecycle(message: string, fields?: LogFields) {
    if (__DEV__) {
      console.info(line("lifecycle", message, fields));
    }
  },

  info(scope: string, message: string, fields?: LogFields) {
    if (__DEV__) {
      console.info(line(scope, message, fields));
    }
  },

  warn(scope: string, message: string, fields?: LogFields) {
    console.warn(line(scope, message, fields));
  },

  error(scope: string, message: string, error?: unknown, fields?: LogFields) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error != null
          ? { message: String(error) }
          : undefined;
    console.error(line(scope, message, { ...fields, error: err }));
  },
};
