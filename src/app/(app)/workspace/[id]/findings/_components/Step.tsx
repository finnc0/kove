import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function StepShell({ children }: Props) {
  return (
    <div
      className="max-w-2xl w-full px-8 py-12 overflow-y-auto"
      style={{
        maxHeight: "calc(100vh - 104px)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
