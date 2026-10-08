import {
  ACTIVE_ANDROID_PACKAGE,
  ANDROID_PACKAGE_LEGACY,
  ANDROID_PACKAGE_TARGET,
} from "@/constants/packageIdentity";

describe("packageIdentity", () => {
  it("uses kuriosity package after U1 migration release", () => {
    expect(ACTIVE_ANDROID_PACKAGE).toBe(ANDROID_PACKAGE_TARGET);
    expect(ANDROID_PACKAGE_LEGACY).toBe("com.mughals.familytree");
  });
});
