import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAgeDemographics,
  getCityDistribution,
  getHusbandFamilyReport,
} from "@/actions/reporting";
import { prisma } from "@/lib/prisma";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";
import { APP_NAME } from "@/lib/appMeta";

type PageProps = {
  params: Promise<{ familyCode: string }>;
};

export default async function ReportsPage({ params }: PageProps) {
  const { familyCode } = await params;
  const decoded = decodeURIComponent(familyCode);

  const person = await prisma.person.findUnique({ where: { familyCode: decoded } });
  if (!person) notFound();

  const [city, ages, household] = await Promise.all([
    getCityDistribution(decoded),
    getAgeDemographics(decoded),
    getHusbandFamilyReport(person.id),
  ]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black">
      <nav className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2 sm:px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="font-semibold text-indigo-600">
            {APP_NAME}
          </Link>
          <Link
            href={`/tree/${decoded}`}
            className="text-indigo-600 hover:underline"
          >
            Tree
          </Link>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            Dashboard
          </Link>
        </div>
        <span className="font-mono text-xs text-zinc-500">{decoded}</span>
      </nav>
      <main className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Family reports
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Location analytics, age breakdown, and household metrics for the
          connected family network.
        </p>
        <div className="mt-8">
          <ReportsDashboard city={city} ages={ages} household={household} />
        </div>
      </main>
    </div>
  );
}
