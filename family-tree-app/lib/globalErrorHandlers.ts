import { log } from "@/lib/logging/logger";
import { reportError } from "@/lib/errors/reportError";

let installed = false;

/** Registers JS-level handlers so unexpected errors are logged and surfaced safely. */
export function installGlobalErrorHandlers(): void {
  if (installed) return;
  installed = true;

  const globalScope = globalThis as typeof globalThis & {
    ErrorUtils?: {
      getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
      setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    };
    onunhandledrejection?: ((event: PromiseRejectionEvent) => void) | null;
  };

  const errorUtils = globalScope.ErrorUtils;
  if (errorUtils) {
    const previous = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      log.error("global", "Uncaught error", error, { isFatal: Boolean(isFatal) });
      reportError(error);
      previous?.(error, isFatal);
    });
  }

  const rejectionHandler = (event: { reason?: unknown }) => {
    log.error("global", "Unhandled promise rejection", event.reason);
    reportError(event.reason);
  };
  if (typeof globalScope.addEventListener === "function") {
    globalScope.addEventListener("unhandledrejection", rejectionHandler);
  }
}
