import {
  APP_NAME,
  APP_OWNER,
  APP_VERSION,
  APP_VERSION_LABEL,
} from "@/constants/appMeta";

describe("appMeta", () => {
  it("exposes genealogy branding constants", () => {
    expect(APP_NAME).toContain("Family Tree");
    expect(APP_OWNER).toBeTruthy();
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_VERSION_LABEL).toContain(APP_VERSION);
  });
});
