import { getFamilyGraph, getPersonDetailsByFamilyCode } from "@/actions/familyTree";

type RouteContext = { params: Promise<{ familyCode: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { familyCode } = await context.params;
  const decoded = decodeURIComponent(familyCode);

  const [graph, details] = await Promise.all([
    getFamilyGraph(decoded),
    getPersonDetailsByFamilyCode(decoded),
  ]);

  if (!graph || !details) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ graph, details });
}
