"use client";

interface Props {
  count: number;
  active: number;
  labels: string[];
  onDotClick: (i: number) => void;
}

export function ProgressDots({ count, active, labels, onDotClick }: Props) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          title={labels[i]}
          className="group relative flex items-center justify-end cursor-pointer"
        >
          <span className="absolute right-5 text-[10px] text-zinc-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none pr-1">
            {labels[i]}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ease-out ${
              i === active
                ? "w-2.5 h-2.5 bg-white"
                : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
