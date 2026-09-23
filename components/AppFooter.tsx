import {
  APP_NAME,
  APP_OWNER,
  APP_OWNER_EMAIL,
  APP_VERSION,
} from "@/lib/appMeta";

export function AppFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 ${className}`}
    >
      <p className="font-medium text-zinc-700 dark:text-zinc-300">{APP_NAME}</p>
      <p className="mt-1">
        Version {APP_VERSION} · Owner {APP_OWNER}
      </p>
      <p className="mt-1">
        <a
          href={`mailto:${APP_OWNER_EMAIL}`}
          className="text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {APP_OWNER_EMAIL}
        </a>
      </p>
    </footer>
  );
}
