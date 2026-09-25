import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildHugeDemoDataset } from "../shared/demoDataset/buildHugeDemoDataset";

const outArg = process.argv.find((a) => a.startsWith("--out="));
const targetArg = process.argv.find((a) => a.startsWith("--persons="));
const outPath =
  outArg?.slice("--out=".length) ??
  join(process.cwd(), "family-tree-app/assets/demo/huge-demo.bundle.json");
const targetPersons = Number(targetArg?.slice("--persons=".length) ?? "2500");

const dataset = buildHugeDemoDataset({ targetPersons, seed: 42_026 });
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(dataset, null, 0));
console.log(
  `Wrote ${outPath} — ${dataset.stats.persons} people, ${dataset.stats.unions} unions, ${dataset.stats.childLinks} child links.`,
);
