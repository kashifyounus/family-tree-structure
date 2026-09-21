import { copy } from "@/content/businessCopy";
import { presentUserMessage } from "@/lib/errors/presentError";

describe("presentUserMessage", () => {
  it("maps technical union delete errors to business copy", () => {
    const msg = presentUserMessage(
      new Error("Cannot delete: member is linked to children through a union."),
    );
    expect(msg).toBe(copy.errors.deleteLinkedChildren);
  });

  it("never returns raw developer configuration strings", () => {
    const msg = presentUserMessage(
      new Error("Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment"),
    );
    expect(msg).toBe(copy.errors.backupNotConfigured);
    expect(msg).not.toContain("EXPO");
  });
});
