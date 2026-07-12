import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-sm text-white shadow-xs transition-colors outline-none placeholder:text-zinc-600 focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06] focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 autofill:bg-zinc-900",
        className
      )}
      {...props}
    />
  )
}

export { Input }
