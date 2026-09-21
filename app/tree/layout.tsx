export default function TreeLayout({ children }: { children: React.ReactNode }) {
  return <div className="tree-shell flex min-h-dvh flex-col overflow-hidden">{children}</div>;
}
