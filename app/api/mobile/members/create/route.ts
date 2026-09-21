import { createStandalonePerson } from "@/actions/familyTree";
import { requireMobileAuth } from "@/lib/mobileApiAuth";
import { canEditTree } from "@/lib/auth";
import type { Gender } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const auth = requireMobileAuth(request.headers.get("authorization"));
    if (!canEditTree(auth.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      gender?: Gender;
      urduFirstName?: string;
      urduLastName?: string;
      currentCity?: string;
      occupation?: string;
      bio?: string;
    };
    if (!body.firstName || !body.lastName || !body.gender) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await createStandalonePerson({
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      urduFirstName: body.urduFirstName,
      urduLastName: body.urduLastName,
      currentCity: body.currentCity,
      occupation: body.occupation,
      bio: body.bio,
    });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
