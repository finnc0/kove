import { cn } from "@/lib/utils";

interface Props {
  visible: boolean;
  children: React.ReactNode;
}

export function StepTransition({ visible, children }: Props) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out w-full",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      )}
    >
      {children}
    </div>
  );
}
