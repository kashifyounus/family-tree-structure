import { getSession } from "@/actions/auth";
import { listMembersForDashboard } from "@/actions/familyTree";
import { DashboardShell } from "@/components/DashboardShell";
import { MemberAdminPanel } from "@/components/dashboard/MemberAdminPanel";
import { canEditTree } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getSession();
  const [members, sample] = await Promise.all([
    listMembersForDashboard("", 100),
    prisma.person.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  const reportsCode = sample?.familyCode ?? "FAM-10004";

  return (
    <DashboardShell
      session={session}
      title="Family records dashboard"
      description="Create people, open a record, and move from a person to their marriages, parents, and children."
      sampleFamilyCode={reportsCode}
    >
      <MemberAdminPanel
        initialMembers={members}
        canEdit={canEditTree(session.role)}
        defaultReportsFamilyCode={reportsCode}
      />
    </DashboardShell>
  );
}
