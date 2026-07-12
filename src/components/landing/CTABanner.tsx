import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="px-6 py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-8 py-16 text-center">
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,92,246,0.1) 0%, transparent 70%)",
          }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Get started
        </p>
        <h2 className="relative mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Stop guessing.{" "}
          <span className="text-zinc-400">Start researching.</span>
        </h2>
        <p className="relative mt-4 text-base text-zinc-500">
          Join founders who research before they build.
        </p>
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ size: "lg" }),
            "relative mt-8 inline-flex gap-2 bg-white text-zinc-950 hover:bg-zinc-100"
          )}
        >
          Get started free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
