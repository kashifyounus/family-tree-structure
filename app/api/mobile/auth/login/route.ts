import { loginMobile } from "@/lib/mobileApiAuth";
import { verifyDemoCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  const session = verifyDemoCredentials(email, password);
  if (!session) {
    return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const token = loginMobile(email, password);
  return Response.json({
    ok: true,
    token,
    role: session.role,
    displayName: session.displayName,
  });
}
