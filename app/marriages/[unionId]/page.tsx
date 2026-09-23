import { notFound } from "next/navigation";
import { getSession } from "@/actions/auth";
import { getMarriage } from "@/actions/familyTree";
import { MarriageEditor } from "@/components/records/MarriageEditor";
import { Breadcrumbs, RecordShell } from "@/components/records/ui";
import { canEditTree } from "@/lib/auth";
import { personName } from "@/lib/records/format";

type MarriagePageProps = {
  params: Promise<{ unionId: string }>;
};

export async function generateMetadata({ params }: MarriagePageProps) {
  const { unionId } = await params;
  const marriage = await getMarriage(unionId);
  if (!marriage) return { title: "Marriage" };
  return {
    title: `${personName(marriage.partner1)} and ${personName(marriage.partner2)}`,
  };
}

export default async function MarriagePage({ params }: MarriagePageProps) {
  const { unionId } = await params;
  const [session, marriage] = await Promise.all([
    getSession(),
    getMarriage(unionId),
  ]);
  if (!marriage) notFound();

  return (
    <RecordShell treeCode={marriage.partner1.familyCode}>
      <Breadcrumbs
        items={[
          { label: "Family records", href: "/dashboard" },
          { label: personName(marriage.partner1), href: `/people/${marriage.partner1.id}` },
          { label: "Marriage" },
        ]}
      />
      <MarriageEditor marriage={marriage} canEdit={canEditTree(session.role)} />
    </RecordShell>
  );
}
