"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchMembers } from "@/actions/familyTree";
import type { SearchResult } from "@/types/family";

type SearchBarProps = {
  className?: string;
  placeholder?: string;
};

export function SearchBar({
  className = "",
  placeholder = "Search by name, family code, or birth year…",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const hits = await searchMembers(query);
        setResults(hits);
        setOpen(true);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = useCallback(
    (code: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/tree/${code}`);
    },
    [router],
  );

  return (
    <div className={`relative ${className}`}>
      <label className="sr-only" htmlFor="member-search">
        Search members
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        <input
          id="member-search"
          data-testid="member-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          autoComplete="off"
        />
        {isPending && (
          <span className="text-xs text-zinc-400" aria-live="polite">
            …
          </span>
        )}
      </div>
      {open && results.length > 0 && (
        <ul
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
        >
          {results.map((r) => (
            <li key={r.id} role="option" aria-selected={false}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => onSelect(r.familyCode)}
              >
                <span>
                  {r.firstName} {r.lastName}
                  {r.nickname && (
                    <span className="text-zinc-400"> &quot;{r.nickname}&quot;</span>
                  )}
                  {(r.urduFirstName || r.urduLastName) && (
                    <span className="ml-2 font-urdu text-zinc-500" dir="rtl">
                      {[r.urduFirstName, r.urduLastName].filter(Boolean).join(" ")}
                    </span>
                  )}
                  {r.birthYear != null && (
                    <span className="ml-2 text-zinc-400">b. {r.birthYear}</span>
                  )}
                </span>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                  {r.familyCode}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
