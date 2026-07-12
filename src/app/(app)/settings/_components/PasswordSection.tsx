"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SettingsCard } from "./SettingsCard";
import { SaveButton } from "./SaveButton";

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    newPw: z.string().min(8, "Must be at least 8 characters"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPw === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof schema>;

function PasswordInput({
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} placeholder={placeholder} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function PasswordSection() {
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    setSaveState("loading");
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.current, newPassword: data.newPw }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setSaveState("idle");
      setServerError(error ?? "Failed to update password");
      return;
    }
    setSaveState("success");
    setServerError(null);
    toast.success("Password changed successfully");
    reset();
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <SettingsCard title="Password" description="Change your account password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="text-sm font-medium text-zinc-400 block mb-1.5">Current password</label>
          <PasswordInput {...register("current")} placeholder="••••••••" autoComplete="current-password" />
          {errors.current && <p className="text-xs text-red-400 mt-1">{errors.current.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400 block mb-1.5">New password</label>
          <PasswordInput {...register("newPw")} placeholder="Min. 8 characters" autoComplete="new-password" />
          {errors.newPw ? (
            <p className="text-xs text-red-400 mt-1">{errors.newPw.message}</p>
          ) : (
            <p className="text-xs text-zinc-600 mt-1">Must be at least 8 characters</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400 block mb-1.5">Confirm new password</label>
          <PasswordInput {...register("confirm")} placeholder="••••••••" autoComplete="new-password" />
          {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm.message}</p>}
        </div>

        <div className="flex justify-end pt-1">
          <SaveButton state={saveState} label="Update password" successLabel="Updated" />
        </div>
      </form>
    </SettingsCard>
  );
}