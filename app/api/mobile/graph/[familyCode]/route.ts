import { getFamilyGraph, getPersonDetailsByFamilyCode } from "@/actions/familyTree";

type RouteContext = { params: Promise<{ familyCode: string }> };

function parseIntParam(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function GET(request: Request, context: RouteContext) {
  const { familyCode } = await context.params;
  const decoded = decodeURIComponent(familyCode);
  const url = new URL(request.url);
  const depth = parseIntParam(url.searchParams.get("depth"), 2);
  const siblingSteps = parseIntParam(url.searchParams.get("siblingSteps"), 0);

  const [graph, details] = await Promise.all([
    getFamilyGraph(decoded, depth, siblingSteps),
    getPersonDetailsByFamilyCode(decoded),
  ]);

  if (!graph || !details) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ graph, details });
}
