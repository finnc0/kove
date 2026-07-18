import { PricingTiers } from "../PricingTiers";
import type { ReportPageData } from "./types";

export function PricingTab({ data }: { data: ReportPageData }) {
  const { report } = data;
  if (!report?.pricingModel) {
    return <p className="text-sm text-zinc-600">No pricing data available for this app.</p>;
  }

  return (
    <div className="max-w-xl">
      <PricingTiers pricingModel={report.pricingModel} tiers={report.pricingTiers ?? []} />
    </div>
  );
}
