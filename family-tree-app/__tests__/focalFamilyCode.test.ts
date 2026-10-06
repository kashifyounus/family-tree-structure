import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import {
  loadCloudFocalFamilyCode,
  loadLocalTreeViewFamilyCode,
  resolveCloudFocalFamilyCode,
  resolveLocalFocalFamilyCode,
  resolveLocalTreeViewFamilyCode,
  saveCloudFocalFamilyCode,
  saveLocalTreeViewFamilyCode,
} from "@/lib/tree/focalFamilyCode";

jest.mock("@/lib/recentPeople", () => ({
  loadRecentPeople: jest.fn(async () => []),
}));

describe("focalFamilyCode", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("resolveLocalFocalFamilyCode uses session or default", () => {
    expect(resolveLocalFocalFamilyCode("FAM-20001")).toBe("FAM-20001");
    expect(resolveLocalFocalFamilyCode(null)).toBe(DEFAULT_FAMILY_CODE);
  });

  it("resolveCloudFocalFamilyCode prefers stored cloud focal", async () => {
    await saveCloudFocalFamilyCode("FAM-77777");
    expect(await resolveCloudFocalFamilyCode("FAM-10001")).toBe("FAM-77777");
    expect(await loadCloudFocalFamilyCode()).toBe("FAM-77777");
  });

  it("resolveCloudFocalFamilyCode falls back to household then default", async () => {
    expect(await resolveCloudFocalFamilyCode("FAM-20002")).toBe("FAM-20002");
    expect(await resolveCloudFocalFamilyCode(null)).toBe(DEFAULT_FAMILY_CODE);
  });

  it("resolveLocalTreeViewFamilyCode prefers last viewed per lane", async () => {
    await saveLocalTreeViewFamilyCode("live", "FAM-VIEW-01");
    await saveLocalTreeViewFamilyCode("demo", "FAM-DEMO-99");
    expect(await loadLocalTreeViewFamilyCode("live")).toBe("FAM-VIEW-01");
    expect(await resolveLocalTreeViewFamilyCode("live", "FAM-20001")).toBe(
      "FAM-VIEW-01",
    );
    expect(await resolveLocalTreeViewFamilyCode("demo", "FAM-20001")).toBe(
      "FAM-DEMO-99",
    );
  });
});
