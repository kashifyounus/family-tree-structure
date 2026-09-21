import { listMembersForDashboard } from "@/actions/familyTree";
import { authFromAuthorizationHeader } from "@/lib/mobileApiAuth";

export async function GET(request: Request) {
  const auth = authFromAuthorizationHeader(
    request.headers.get("authorization"),
  );
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  const members = await listMembersForDashboard(query, 100);
  return Response.json({
    members,
    viewer: auth ?? { isAuthenticated: false, role: "GUEST" },
  });
}
