import type { AuthContext } from "@/lib/auth";
import { maskPersonSummary, TREE_PRIVATE_PLACEHOLDER } from "@/lib/privacy";
import type { PersonSummary } from "@/types/family";

const guest: AuthContext = {
  isAuthenticated: false,
  role: "GUEST",
  userId: null,
  displayName: null,
};

const viewer: AuthContext = {
  isAuthenticated: true,
  role: "VIEWER",
  userId: "v1",
  displayName: "Viewer",
};

const contributor: AuthContext = {
  isAuthenticated: true,
  role: "CONTRIBUTOR",
  userId: "c1",
  displayName: "Contributor",
};

const livingPerson: PersonSummary = {
  id: "1",
  familyCode: "FAM-1",
  title: null,
  firstName: "Hassan",
  lastName: "Khan",
  nickname: null,
  urduFirstName: "حسن",
  urduLastName: "خان",
  gender: "MALE",
  birthDate: "1990-06-15T00:00:00.000Z",
  deathDate: null,
  photoUrl: "https://example.com/photo.jpg",
  bio: "Private bio",
  isLiving: true,
  age: 35,
  occupation: "Engineer",
  motherTongue: "Urdu",
  privacyLevel: "MEMBERS_ONLY",
  birthPlace: "Lahore",
  currentCity: "Karachi",
  permanentCity: "Karachi",
  homeTown: "Lahore",
};

describe("privacy masking", () => {
  it("masks sensitive fields for GUEST viewers of living members", () => {
    const masked = maskPersonSummary(livingPerson, guest);
    expect(masked.bio).toBeNull();
    expect(masked.photoUrl).toBeNull();
    expect(masked.birthPlace).toBeNull();
    expect(masked.currentCity).toBeNull();
    expect(masked.birthDate).toMatch(/^1990-01-01$/);
    expect(masked.firstName).toBe(TREE_PRIVATE_PLACEHOLDER);
    expect(masked.treeDisplayIsPrivate).toBe(true);
    expect(masked.familyCode).toBe(TREE_PRIVATE_PLACEHOLDER);
  });

  it("masks sensitive fields for VIEWER role", () => {
    const masked = maskPersonSummary(livingPerson, viewer);
    expect(masked.bio).toBeNull();
    expect(masked.photoUrl).toBeNull();
    expect(masked.homeTown).toBeNull();
  });

  it("does not mask living member details for CONTRIBUTOR", () => {
    const masked = maskPersonSummary(livingPerson, contributor);
    expect(masked.bio).toBe("Private bio");
    expect(masked.photoUrl).toBe("https://example.com/photo.jpg");
    expect(masked.currentCity).toBe("Karachi");
    expect(masked.birthDate).toBe(livingPerson.birthDate);
  });

  it("does not mask PUBLIC living members for guests", () => {
    const publicPerson = { ...livingPerson, privacyLevel: "PUBLIC" as const };
    const masked = maskPersonSummary(publicPerson, guest);
    expect(masked.bio).toBe("Private bio");
    expect(masked.photoUrl).toBe("https://example.com/photo.jpg");
  });
});
