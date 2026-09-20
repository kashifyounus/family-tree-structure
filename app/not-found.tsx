import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Member not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Check the family code or search from the home page.
      </p>
      <Link href="/" className="text-indigo-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
