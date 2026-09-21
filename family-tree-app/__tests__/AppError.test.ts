import { AppError } from "@/lib/errors/AppError";
import { toAppError } from "@/lib/errors/presentError";

describe("AppError", () => {
  it("maps unknown errors to user-friendly messages", () => {
    const err = toAppError(new Error("db locked"), "Could not save");
    expect(err).toBeInstanceOf(AppError);
    expect(err.userMessage).toBe("Could not save");
    expect(err.code).toBe("UNKNOWN");
  });

  it("preserves AppError instances", () => {
    const original = new AppError("VALIDATION", "Invalid email");
    expect(toAppError(original).userMessage).toBe("Invalid email");
  });
});
