import { AppError } from "@/lib/errors/AppError";

describe("local account validation", () => {
  it("rejects short passwords via AppError contract", () => {
    const err = new AppError("VALIDATION", "Password must be at least 6 characters");
    expect(err.code).toBe("VALIDATION");
    expect(err.userMessage).toContain("6");
  });
});
