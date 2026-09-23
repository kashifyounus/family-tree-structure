import { notFound } from "next/navigation";
import { getSession } from "@/actions/auth";
import { getPersonDetails } from "@/actions/familyTree";
import { PersonWorkspace } from "@/components/records/PersonWorkspace";
import { Breadcrumbs, RecordShell } from "@/components/records/ui";
import { canEditTree } from "@/lib/auth";
import { personName } from "@/lib/records/format";

type PersonPageProps = {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ created?: string }>;
};

export async function generateMetadata({ params }: PersonPageProps) {
  const { personId } = await params;
  const details = await getPersonDetails(personId);
  return { title: details ? personName(details.person) : "Person" };
}

export default async function PersonPage({ params, searchParams }: PersonPageProps) {
  const { personId } = await params;
  const query = await searchParams;
  const [session, details] = await Promise.all([
    getSession(),
    getPersonDetails(personId),
  ]);
  if (!details) notFound();

  return (
    <RecordShell treeCode={details.person.familyCode}>
      <Breadcrumbs
        items={[
          { label: "Family records", href: "/dashboard" },
          { label: "Family tree", href: `/tree/${details.person.familyCode}` },
          { label: personName(details.person) },
        ]}
      />
      <PersonWorkspace
        details={details}
        canEdit={canEditTree(session.role)}
        justCreated={query.created === "1"}
      />
    </RecordShell>
  );
}
