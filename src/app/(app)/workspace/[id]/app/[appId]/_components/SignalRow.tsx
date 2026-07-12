interface Props {
  title: string;
  severity: string;
  quote: string;
  reviewCount?: number;
  variant: "pain" | "positive";
}

export function SignalRow({ title, quote, reviewCount }: Props) {
  return (
    <div className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2.5">
        <p className="flex-1 text-sm font-medium text-white">{title}</p>
        {reviewCount !== undefined && reviewCount > 0 && (
          <span className="shrink-0 text-[10px] text-zinc-600">
            {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {quote && (
        <p className="text-sm italic leading-relaxed text-zinc-500">
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </div>
  );
}
