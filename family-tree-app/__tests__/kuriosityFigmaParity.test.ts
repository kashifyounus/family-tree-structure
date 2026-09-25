import { lightColors, semantic } from "@/theme/appTheme";
import {
  margaretKhanProfile,
  showcaseMemberRows,
  showcasePedigree,
  showcaseStatsDefault,
  showcaseUser,
} from "@/lib/mock/kuriosityShowcase";

describe("Kuriosity Figma design tokens", () => {
  it("uses brand palette from mockups", () => {
    expect(semantic.primary.toLowerCase()).toBe("#1b4332");
    expect(lightColors.background.toLowerCase()).toBe("#f6f1e7");
    expect(lightColors.surface.toLowerCase()).toBe("#fffdf8");
    expect(lightColors.outlineVariant.toLowerCase()).toBe("#ddd3c4");
    expect(lightColors.onSurfaceVariant.toLowerCase()).toBe("#5c5346");
  });
});

describe("Kuriosity showcase dataset", () => {
  it("includes Kay household and Margaret profile", () => {
    expect(showcaseUser.displayName).toBe("Kay Hassan");
    expect(showcaseStatsDefault.members).toBe(48);
    expect(showcaseMemberRows.some((r) => r.name === "Margaret Khan")).toBe(true);
    expect(margaretKhanProfile.relationBadge).toBe("Aunt");
  });

  it("defines three-generation pedigree names", () => {
    const gen1 = showcasePedigree.generation1.map((p) => p.firstName).join(",");
    expect(gen1).toContain("Omar");
    expect(gen1).toContain("Fatima");
    const gen3 = showcasePedigree.generation3.find((p) => p.isFocal);
    expect(gen3?.firstName).toBe("Kay");
  });
});
