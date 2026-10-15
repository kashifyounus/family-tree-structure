import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
} from "../marriageTreeLayout";
import {
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_MIN_L_JOG,
  PEDIGREE_ROW_STEP,
} from "../pedigreeLayoutTokens";
import { buildCuratedPedigreeDemo } from "../demoDataset/buildCuratedPedigreeDemo";
import { measureFocalChildColumnWidth } from "./focalChildFamilyColumnLayout";

function minHorizontalGapOnRow(
  positions: Map<string, { x: number; y: number }>,
  ids: string[],
  rowY: number,
  cardW: number,
): number {
  const onRow = ids
    .map((id) => {
      const pos = positions.get(id);
      return pos ? { id, ...pos } : null;
    })
    .filter((p): p is { id: string; x: number; y: number } => !!p)
    .filter((p) => Math.abs(p.y - rowY) < 3)
    .sort((a, b) => a.x - b.x);
  let minGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < onRow.length; i++) {
    const gap = onRow[i].x - (onRow[i - 1].x + cardW);
    minGap = Math.min(minGap, gap);
  }
  return minGap;
}

describe("focalChildFamilyColumnLayout", () => {
  it("measures wider columns when a child has more grandchildren", () => {
    const unions = [
      {
        id: "u-focal",
        partner1Id: "ego",
        partner2Id: "sp",
        childships: [{ childId: "a" }, { childId: "b" }],
      },
      {
        id: "u-a",
        partner1Id: "a",
        partner2Id: "sp-a",
        childships: [{ childId: "g1" }],
      },
      {
        id: "u-b",
        partner1Id: "b",
        partner2Id: "sp-b",
        childships: [
          { childId: "g2" },
          { childId: "g3" },
          { childId: "g4" },
        ],
      },
    ];
    const people = new Map(
      ["ego", "sp", "a", "b", "sp-a", "sp-b", "g1", "g2", "g3", "g4"].map(
        (id) => [id, { id, birthDate: "2000-01-01" }],
      ),
    );
    const included = new Set(people.keys());

    const wNarrow = measureFocalChildColumnWidth("a", unions, included, people, 2);
    const wWide = measureFocalChildColumnWidth("b", unions, included, people, 2);
    expect(wWide).toBeGreaterThan(wNarrow);
  });

  it("separates grandchildren of adjacent focal children (Riaz-like)", () => {
    const childIds = ["c1", "c2", "c3"];
    const grandIds: string[] = [];
    const unions: {
      id: string;
      partner1Id: string;
      partner2Id: string;
      childships: { childId: string }[];
    }[] = [
      {
        id: "u-focal",
        partner1Id: "ego",
        partner2Id: "sp",
        childships: childIds.map((id) => ({ childId: id })),
      },
    ];

    childIds.forEach((cid, ci) => {
      unions.push({
        id: `u-${cid}`,
        partner1Id: cid,
        partner2Id: `sp-${cid}`,
        childships: [0, 1, 2].map((gi) => {
          const gid = `g-${ci}-${gi}`;
          grandIds.push(gid);
          return { childId: gid };
        }),
      });
    });

    const people = new Map<string, { id: string; birthDate: string }>();
    for (const id of ["ego", "sp", ...childIds, ...grandIds, "sp-c1", "sp-c2", "sp-c3"]) {
      people.set(id, { id, birthDate: "2000-01-01" });
    }

    const included = collectIncludedPersonIds("ego", unions, 1, 1, 0);
    for (const id of grandIds) included.add(id);
    for (const cid of childIds) included.add(`sp-${cid}`);

    const { positions } = layoutMarriageCentricGraph(
      "ego",
      people,
      unions,
      included,
      0,
      0,
      { maxDescendantGenerations: 2 },
    );

    const childRowY = positions.get("ego")!.y + PEDIGREE_ROW_STEP;
    const grandRowY = childRowY + PEDIGREE_ROW_STEP;
    const gap = minHorizontalGapOnRow(
      positions,
      grandIds,
      grandRowY,
      PEDIGREE_CARD_SMALL_W,
    );
    expect(gap).toBeGreaterThanOrEqual(PEDIGREE_MIN_L_JOG - 0.5);

    const c1x = positions.get("c1")!.x;
    const c3x = positions.get("c3")!.x;
    expect(c3x - c1x).toBeGreaterThan(PEDIGREE_CARD_SMALL_W * 2);

    expect(Math.abs(positions.get("sp-c1")!.y - childRowY)).toBeLessThan(4);
    expect(Math.abs(positions.get("c1")!.y - childRowY)).toBeLessThan(4);
  });

  it("keeps focal children and wing grandchildren separated in the curated demo", () => {
    const dataset = buildCuratedPedigreeDemo();
    const unions = dataset.unions.map((u) => ({
      id: u.id,
      partner1Id: u.partner1Id,
      partner2Id: u.partner2Id,
      childships: dataset.children
        .filter((c) => c.unionId === u.id)
        .map((c) => ({ childId: c.childId })),
    }));
    const included = collectIncludedPersonIds(
      dataset.focalPersonId,
      unions,
      2,
      2,
      1,
      0,
    );
    const people = new Map(
      dataset.persons
        .filter((p) => included.has(p.id))
        .map((p) => [
          p.id,
          { id: p.id, birthDate: p.birthDate, gender: p.gender },
        ]),
    );

    const { positions } = layoutMarriageCentricGraph(
      dataset.focalPersonId,
      people,
      unions,
      included,
      0,
      0,
      {
        phoneSingleParentSide: false,
        maxAncestorGenerations: 2,
        maxDescendantGenerations: 2,
      },
    );

    const kayY = positions.get("cur-kay")!.y;
    const childRowY = kayY + PEDIGREE_ROW_STEP;
    const zara = positions.get("cur-zara")!;
    const noah = positions.get("cur-noah")!;

    expect(Math.abs(zara.y - childRowY)).toBeLessThan(4);
    expect(Math.abs(noah.y - childRowY)).toBeLessThan(4);
    expect(Math.abs(zara.x - noah.x)).toBeGreaterThan(
      PEDIGREE_CARD_SMALL_W + PEDIGREE_MIN_L_JOG - 1,
    );

    const leo = positions.get("cur-leo")!;
    const rayan = positions.get("cur-rayan")!;
    expect(leo.y).toBeGreaterThan(kayY);
    expect(Math.abs(leo.x - rayan.x)).toBeGreaterThan(
      PEDIGREE_CARD_SMALL_W + PEDIGREE_MIN_L_JOG,
    );
  });
});
