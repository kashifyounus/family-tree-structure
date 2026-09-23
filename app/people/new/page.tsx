import { redirect } from "next/navigation";
import { getSession } from "@/actions/auth";
import { CreatePersonForm } from "@/components/records/CreatePersonForm";
import { Breadcrumbs, PageHeader, RecordShell } from "@/components/records/ui";
import { canEditTree } from "@/lib/auth";

export const metadata = { title: "Create person" };

export default async function CreatePersonPage() {
  const session = await getSession();
  if (!canEditTree(session.role)) {
    redirect("/login");
  }

  return (
    <RecordShell>
      <Breadcrumbs
        items={[
          { label: "Family records", href: "/dashboard" },
          { label: "Create person" },
        ]}
      />
      <PageHeader
        title="Create person"
        meta="Enter the personal details you have. Marriage, children, and parents can be added after the person is saved."
      />
      <div className="mt-6">
        <CreatePersonForm mode="create" />
      </div>
    </RecordShell>
  );
}
