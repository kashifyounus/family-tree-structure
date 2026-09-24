import {
  APP_COMPANY,
  APP_CREDIT_SUBTITLE,
  APP_NAME,
  APP_OWNER,
  APP_VERSION,
  APP_VERSION_LABEL,
} from "@/constants/appMeta";

describe("appMeta", () => {
  it("exposes Kuriosity branding constants", () => {
    expect(APP_NAME).toBe("Kuriosity Family Tree");
    expect(APP_COMPANY).toBe("Kuriosity Engineering");
    expect(APP_CREDIT_SUBTITLE).toBe("by Kashif Younus");
    expect(APP_OWNER).toBe("Kashif Younus");
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_VERSION_LABEL).toContain(APP_VERSION);
  });
});
