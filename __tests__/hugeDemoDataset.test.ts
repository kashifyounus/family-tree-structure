import { buildHugeDemoDataset } from "../shared/demoDataset/buildHugeDemoDataset";

describe("buildHugeDemoDataset", () => {
  it("builds unique names with cities and mixed relationships", () => {
    const dataset = buildHugeDemoDataset({ targetPersons: 800, seed: 99 });

    expect(dataset.persons.length).toBeGreaterThanOrEqual(800);
    expect(dataset.stats.uniqueFullNames).toBe(dataset.persons.length);
    expect(dataset.stats.uniqueCities).toBeGreaterThan(10);
    expect(dataset.unions.length).toBeGreaterThan(50);
    expect(dataset.children.length).toBeGreaterThan(100);
    expect(dataset.stats.adopted).toBeGreaterThan(0);
    expect(dataset.stats.step).toBeGreaterThan(0);
    expect(dataset.stats.remarriages).toBeGreaterThan(0);
    expect(dataset.focalPersonId).toBeTruthy();
    expect(
      dataset.persons.every(
        (p) => p.firstName && p.lastName && p.currentCity && p.birthDate,
      ),
    ).toBe(true);
  });

  it("is reproducible for the same seed", () => {
    const a = buildHugeDemoDataset({ targetPersons: 400, seed: 7 });
    const b = buildHugeDemoDataset({ targetPersons: 400, seed: 7 });
    expect(a.persons.length).toBe(b.persons.length);
    expect(a.persons[0]?.firstName).toBe(b.persons[0]?.firstName);
    expect(a.unions.length).toBe(b.unions.length);
  });
});
