interface Props {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
}

export function PainPointRow({ title }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="mt-px block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
      <span className="text-sm text-zinc-300">{title}</span>
    </div>
  );
}
