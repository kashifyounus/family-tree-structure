import { getPersonDetailsByFamilyCode } from "@/actions/familyTree";

type RouteContext = { params: Promise<{ familyCode: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { familyCode } = await context.params;
  const decoded = decodeURIComponent(familyCode);
  const details = await getPersonDetailsByFamilyCode(decoded);
  if (!details) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ details });
}
