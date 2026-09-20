import clsx from "clsx";

type UrduTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function UrduText({ children, className }: UrduTextProps) {
  return (
    <span dir="rtl" className={clsx("font-urdu inline-block", className)}>
      {children}
    </span>
  );
}
