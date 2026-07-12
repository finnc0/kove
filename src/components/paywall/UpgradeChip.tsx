interface Props {
  className?: string;
}

export function UpgradeChip({ className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-[#2dd4bf]/80 ring-1 ring-[#2dd4bf]/20 ${className}`}
    >
      Pro
    </span>
  );
}
