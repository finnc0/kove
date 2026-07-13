"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { SettingsCard } from "./SettingsCard";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

interface Props {
  googleConnected: boolean;
  hasPassword: boolean;
}

export function ConnectedSection({ googleConnected, hasPassword }: Props) {
  const [connected, setConnected] = useState(googleConnected);
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    await signIn("google", { callbackUrl: "/settings" });
  }

  async function handleDisconnect() {
    if (!hasPassword) {
      toast.error("Set a password before disconnecting Google.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/disconnect-google", { method: "POST" });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Failed to disconnect.");
        return;
      }
      setConnected(false);
      toast.success("Google account disconnected.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsCard title="Connected accounts" description="Manage third-party sign-in methods">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GoogleIcon />
          <div>
            <p className="text-sm font-medium text-white">Google</p>
            <span
              className={`text-xs rounded-full px-2 py-0.5 inline-block mt-0.5 ${
                connected
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-white/[0.06] text-zinc-500"
              }`}
            >
              {connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>

        <button
          onClick={connected ? handleDisconnect : handleConnect}
          disabled={loading}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            connected
              ? "border-white/[0.08] text-zinc-400 hover:text-red-400 hover:border-red-400/30"
              : "border-white/[0.12] text-zinc-300 hover:border-white/25 hover:text-white"
          }`}
        >
          {loading ? "..." : connected ? "Disconnect" : "Connect"}
        </button>
      </div>

      <p className="text-xs text-zinc-600 mt-4">
        Connected accounts can be used to sign in to Kove
      </p>
    </SettingsCard>
  );
}
