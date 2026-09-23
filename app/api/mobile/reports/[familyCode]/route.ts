import {
  getAgeDemographics,
  getCityDistribution,
  getHusbandFamilyReport,
} from "@/actions/reporting";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ familyCode: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { familyCode } = await context.params;
  const decoded = decodeURIComponent(familyCode);
  const person = await prisma.person.findUnique({ where: { familyCode: decoded } });
  if (!person) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [city, ages, household] = await Promise.all([
    getCityDistribution(decoded),
    getAgeDemographics(decoded),
    getHusbandFamilyReport(person.id),
  ]);

  return Response.json({ city, ages, household, focalFamilyCode: decoded });
}
