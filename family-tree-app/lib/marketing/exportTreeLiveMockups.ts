import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { buildCuratedPedigreeDemo } from "../../../shared/demoDataset/buildCuratedPedigreeDemo";
import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
  type MarriageLayoutUnion,
} from "../../../shared/marriageTreeLayout";
import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import { getExplorationHints } from "@/lib/graph/explorationHints";
import type { KinshipUnionRecord } from "@/lib/kinship/types";
import type { FamilyGraph, FamilyGraphNode } from "@/lib/graph/types";

const REPO_ROOT = join(__dirname, "..", "..", "..");
const OUT_DIR = join(REPO_ROOT, "docs/ui-samples");
const ARTIFACTS = "/opt/cursor/artifacts/family-tree-mockups";

type ExpansionPreset = {
  id: string;
  label: string;
  generationsUp: number;
  generationsDown: number;
  siblingSteps: number;
  cousinDegree: number;
};

const PRESETS: ExpansionPreset[] = [
  {
    id: "curated-default",
    label: "Demo archive — Kay Hassan (default depth)",
    generationsUp: 2,
    generationsDown: 2,
    siblingSteps: 1,
    cousinDegree: 0,
  },
  {
    id: "curated-partial",
    label: "Demo archive — partial tree (load-more ghosts)",
    generationsUp: 1,
    generationsDown: 1,
    siblingSteps: 0,
    cousinDegree: 0,
  },
  {
    id: "curated-full-siblings",
    label: "Full siblings — each with spouse & children (column layout)",
    generationsUp: 2,
    generationsDown: 2,
    siblingSteps: 1,
    cousinDegree: 0,
  },
];

function toKinshipPerson(
  p: ReturnType<typeof buildCuratedPedigreeDemo>["persons"][number],
): KinshipUnionRecord["partner1"] {
  return {
    id: p.id,
    familyCode: `DEMO-${p.id.replace("cur-", "").toUpperCase()}`,
    firstName: p.firstName,
    lastName: p.lastName,
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: p.gender,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    currentCity: p.currentCity,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
}

function toKinshipUnions(
  dataset: ReturnType<typeof buildCuratedPedigreeDemo>,
): KinshipUnionRecord[] {
  const byId = new Map(
    dataset.persons.map((p) => [p.id, toKinshipPerson(p)]),
  );
  return dataset.unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    partner1: byId.get(u.partner1Id)!,
    partner2: byId.get(u.partner2Id)!,
    childships: dataset.children
      .filter((c) => c.unionId === u.id)
      .map((c) => ({
        childId: c.childId,
        child: byId.get(c.childId)!,
        relationshipType: c.relationshipType,
      })),
  }));
}

function toLayoutUnions(
  dataset: ReturnType<typeof buildCuratedPedigreeDemo>,
): MarriageLayoutUnion[] {
  return dataset.unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    childships: dataset.children
      .filter((c) => c.unionId === u.id)
      .map((c) => ({ childId: c.childId })),
  }));
}

function buildGraphForPreset(preset: ExpansionPreset): FamilyGraph {
  const dataset = buildCuratedPedigreeDemo();
  const focalId = dataset.focalPersonId;
  const unions = toLayoutUnions(dataset);
  const kinshipUnions = toKinshipUnions(dataset);
  const included = collectIncludedPersonIds(
    focalId,
    unions,
    preset.generationsUp,
    preset.generationsDown,
    preset.siblingSteps,
    preset.cousinDegree,
  );

  const people = new Map(
    dataset.persons
      .filter((p) => included.has(p.id))
      .map((p) => [
        p.id,
        { id: p.id, birthDate: p.birthDate, gender: p.gender },
      ]),
  );

  const cousinNetworkPosterSpread =
    preset.cousinDegree >= 1 || preset.generationsUp >= 3;

  const { positions, edges, focalPartnerIds, focalUnionIds } =
    layoutMarriageCentricGraph(focalId, people, unions, included, 0, 0, {
      phoneSingleParentSide: false,
      maxAncestorGenerations: preset.generationsUp,
      maxDescendantGenerations: preset.generationsDown,
      cousinNetworkPosterSpread,
    });

  const nodes: FamilyGraphNode[] = [];
  for (const personId of included) {
    const pos = positions.get(personId);
    const p = dataset.persons.find((x) => x.id === personId);
    if (!pos || !p) continue;
    const hints = getExplorationHints(personId, included, kinshipUnions);
    nodes.push({
      id: personId,
      type: "person",
      position: { x: pos.x, y: pos.y },
      data: {
        person: {
          id: p.id,
          familyCode: `DEMO-${p.id.replace("cur-", "").toUpperCase()}`,
          firstName: p.firstName,
          lastName: p.lastName,
          urduFirstName: null,
          urduLastName: null,
          nickname: null,
          gender: p.gender,
          birthDate: p.birthDate,
          deathDate: p.deathDate,
          currentCity: p.currentCity,
          isLiving: !p.deathDate,
        },
        isFocal: personId === focalId,
        isDeceased: !!p.deathDate,
        hasUnexpandedParents: hints.hasUnexpandedParents,
        hasUnexpandedChildren: hints.hasUnexpandedChildren,
        hasUnexpandedSiblings: hints.hasUnexpandedSiblings,
      },
    });
  }

  const focalMarriageBands = focalPartnerIds.map((partnerId) => ({
    partnerId,
    label: "Married",
  }));

  return {
    focalPersonId: focalId,
    focalPartnerIds,
    focalUnionIds,
    focalMarriageBands,
    focalMarriageLabel: "Married",
    nodes,
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      label: e.label,
    })),
  };
}

function buildMockupBoardHtml(
  bundle: Record<
    string,
    { label: string; payload: ReturnType<typeof buildPedigreeCanvasPayload> }
  >,
): string {
  const payloadJson = JSON.stringify(bundle).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Kuriosity — live tree canvas mockups</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #d8d0c4; padding: 40px; color: #1a1814; }
    h1 { font-size: 26px; margin-bottom: 8px; }
    .sub { color: #5c5346; margin-bottom: 32px; max-width: 720px; line-height: 1.5; }
    .grid { display: flex; flex-wrap: wrap; gap: 40px; justify-content: center; }
    figure { text-align: center; }
    figcaption { margin-top: 12px; font-weight: 600; font-size: 14px; max-width: 390px; }
    .device { width: 390px; height: 844px; border-radius: 44px; background: #111; padding: 12px; box-shadow: 0 24px 64px rgba(0,0,0,.35); }
    .screen { width: 100%; height: 100%; border-radius: 36px; overflow: hidden; background: #f6f1e7; display: flex; flex-direction: column; }
    .status { height: 44px; background: #fffdf8; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-size: 13px; font-weight: 600; }
    .nav { padding: 10px 16px; background: #fffdf8; border-bottom: 1px solid #ddd3c4; font-weight: 600; font-size: 16px; }
    .expand { padding: 8px 12px; background: #fffdf8; border-bottom: 1px solid rgba(27,67,50,.08); }
    .expand .row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
    .pill { background: #1b4332; color: #fff; font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 999px; }
    .pill.outline { background: transparent; color: #1b4332; border: 1.5px solid #1b4332; }
    .pill.ghost { background: transparent; color: #1b4332; }
    .canvas-wrap { flex: 1; position: relative; min-height: 380px; }
    canvas { width: 100%; height: 100%; display: block; }
    .legend { padding: 6px 12px; background: rgba(255,253,248,.92); border-top: 1px solid rgba(27,67,50,.08); font-size: 10px; color: #374151; text-align: left; }
    .legend-title { font-weight: 600; color: #4b5563; margin-bottom: 4px; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { display: flex; align-items: center; gap: 4px; }
    .sw { width: 14px; height: 8px; border-radius: 2px; }
    .tabs { display: flex; background: #fffdf8; border-top: 1px solid #ddd3c4; padding: 10px 0 14px; }
    .tab { flex: 1; text-align: center; font-size: 11px; color: #5c5346; }
    .tab.on { color: #1b4332; font-weight: 700; }
  </style>
  <script src="pedigree-canvas-runtime.js"></script>
</head>
<body>
  <h1>Family tree — production canvas</h1>
  <p class="sub">Rendered with the same <code>buildPedigreeCanvasPayload</code> + WebView canvas code as the mobile app (curated demo archive, focal Kay Hassan).</p>
  <div class="grid" id="mockup-grid"></div>
  <script>
    const BUNDLE = ${payloadJson};
    const LEGEND = [
      ["#E6B428","Great-grandparents"],
      ["#B83C3C","Grandparents"],
      ["#328C50","Paternal / siblings"],
      ["#D46B8A","Maternal line"],
      ["#1B4332","Focal person"],
      ["#2D6A4F","Parents / siblings line"],
      ["#E6A817","Children line"],
      ["#8B2E3C","Marriage (dashed)"]
    ];
    const grid = document.getElementById("mockup-grid");
    for (const [id, entry] of Object.entries(BUNDLE)) {
      const fig = document.createElement("figure");
      fig.id = "mockup-" + id;
      fig.innerHTML = \`
        <div class="device"><div class="screen">
          <div class="status"><span>9:41</span><span>100%</span></div>
          <div class="nav">Tree · Kay Hassan</div>
          <div class="expand">
            <div class="row"><span class="pill">Load more</span><span class="pill outline">Load full tree</span></div>
            <div class="row"><span class="pill ghost">Load parents</span><span class="pill ghost">Load siblings</span><span class="pill ghost">Load children</span></div>
          </div>
          <div class="canvas-wrap"><canvas></canvas></div>
          <div class="legend">
            <div class="legend-title">Legend</div>
            <div class="chips">\${LEGEND.map(([c,l]) => '<span class="chip"><span class="sw" style="background:'+c+'"></span>'+l+'</span>').join('')}</div>
          </div>
          <div class="tabs"><div class="tab">Home</div><div class="tab on">Tree</div><div class="tab">Members</div><div class="tab">Tools</div></div>
        </div></div>
        <figcaption>\${entry.label}</figcaption>\`;
      grid.appendChild(fig);
      const canvas = fig.querySelector("canvas");
      const renderer = window.createPedigreeCanvasRenderer(canvas);
      renderer.loadPayload(entry.payload);
      window.addEventListener("resize", () => renderer.resize());
    }
  </script>
</body>
</html>`;
}

/** Writes JSON payloads + interactive HTML board (production tree renderer). */
export function writeTreeLiveMockupArtifacts(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(ARTIFACTS, { recursive: true });

  const bundle: Record<
    string,
    { label: string; payload: ReturnType<typeof buildPedigreeCanvasPayload> }
  > = {};

  for (const preset of PRESETS) {
    const graph = buildGraphForPreset(preset);
    const payload = buildPedigreeCanvasPayload(graph);
    bundle[preset.id] = { label: preset.label, payload };
    const path = join(OUT_DIR, `tree-live-${preset.id}.json`);
    writeFileSync(path, JSON.stringify(payload));
    writeFileSync(
      join(ARTIFACTS, `tree-live-${preset.id}.json`),
      JSON.stringify(payload),
    );
  }

  writeFileSync(join(OUT_DIR, "tree-live-bundle.json"), JSON.stringify(bundle));
  writeFileSync(
    join(ARTIFACTS, "tree-live-bundle.json"),
    JSON.stringify(bundle),
  );

  const html = buildMockupBoardHtml(bundle);
  writeFileSync(join(OUT_DIR, "tree-live-mockup-board.html"), html);
  writeFileSync(join(ARTIFACTS, "tree-live-mockup-board.html"), html);
}
