"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { KoveLogo } from "@/components/KoveLogo";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="relative z-10 w-full max-w-[380px]">
      <div className="mb-8 flex flex-col items-center gap-1">
        <Link href="/" aria-label="Kove Labs"><KoveLogo className="h-7 w-auto" /></Link>
        <p className="text-sm text-zinc-500">Reset your password</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm">
        {submitted ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] mb-4">
              <CheckCircle className="h-5 w-5 text-zinc-300" />
            </div>
            <p className="text-sm font-medium text-white">Check your email</p>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-[260px] leading-relaxed">
              If <span className="text-zinc-300">{email}</span> has an account, you&apos;ll receive a reset link shortly.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
          >
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter the email associated with your account and we&apos;ll send you a reset link.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@startup.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={cn(buttonVariants({ size: "default" }), "mt-1 w-full bg-white text-zinc-950 hover:bg-zinc-100")}
            >
              Send reset link
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-zinc-600">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
