"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { KoveLogo } from "@/components/KoveLogo";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const perks = ["Free to start — no credit card required","Reports in under 2 minutes","Export to Markdown or PDF"];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg ?? "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError("Account created — please sign in"); router.push("/sign-in"); return; }
    router.push("/dashboard");
  }

  return (
    <div className="relative z-10 w-full max-w-[380px]">
      <div className="mb-8 flex flex-col items-center gap-1">
        <Link href="/" aria-label="Kove Labs"><KoveLogo className="h-7 w-auto" /></Link>
        <p className="text-sm text-zinc-500">Create your account</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm">
        <button type="button" onClick={()=>signIn("google",{callbackUrl:"/dashboard"})}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:border-white/[0.16]">
          <GoogleIcon />Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1"><Separator /></div>
          <span className="shrink-0 text-xs text-zinc-600">or continue with email</span>
          <div className="flex-1"><Separator /></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@startup.com" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" className="pr-10" required />
              <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={cn(buttonVariants({size:"default"}),"mt-1 w-full bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-60 gap-2")}>
            {loading&&<Loader2 className="h-3.5 w-3.5 animate-spin"/>}
            {loading?"Creating account…":"Create account"}
          </button>
        </form>

        <ul className="mt-5 flex flex-col gap-2 border-t border-white/[0.06] pt-5">
          {perks.map(p=>(
            <li key={p} className="flex items-center gap-2">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.08]"><Check className="h-2.5 w-2.5 text-zinc-300"/></div>
              <span className="text-xs text-zinc-500">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-300 hover:text-white transition-colors">Sign in</Link>
      </p>
      <p className="mt-3 text-center text-xs text-zinc-700">
        By creating an account you agree to our <a href="#" className="hover:text-zinc-500 underline underline-offset-2">Terms</a> and <a href="#" className="hover:text-zinc-500 underline underline-offset-2">Privacy Policy</a>
      </p>
    </div>
  );
}
