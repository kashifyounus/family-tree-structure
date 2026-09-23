export default function TreeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tree-shell flex h-dvh max-h-dvh flex-col overflow-hidden">
      {children}
    </div>
  );
}
