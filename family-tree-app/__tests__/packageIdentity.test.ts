import {
  ACTIVE_ANDROID_PACKAGE,
  ANDROID_PACKAGE_LEGACY,
  ANDROID_PACKAGE_TARGET,
} from "@/constants/packageIdentity";

describe("packageIdentity", () => {
  it("keeps legacy package active until migration release", () => {
    expect(ACTIVE_ANDROID_PACKAGE).toBe(ANDROID_PACKAGE_LEGACY);
    expect(ANDROID_PACKAGE_TARGET).toBe("com.kuriosity.engineering");
  });
});
