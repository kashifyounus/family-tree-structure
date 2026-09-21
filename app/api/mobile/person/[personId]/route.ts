import { getPersonDetails } from "@/actions/familyTree";

type RouteContext = { params: Promise<{ personId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { personId } = await context.params;
  const details = await getPersonDetails(personId);
  if (!details) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ details });
}
