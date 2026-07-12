"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { SettingsCard } from "./SettingsCard";
import { SaveButton } from "./SaveButton";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initialName: string;
  initialEmail: string;
}

export function AccountSection({ initialName, initialEmail }: Props) {
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName, email: initialEmail },
  });

  async function onSubmit(data: FormValues) {
    setSaveState("loading");
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { setSaveState("idle"); toast.error("Failed to save changes"); return; }
    setSaveState("success");
    toast.success("Account updated");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <SettingsCard title="Account" description="Update your name and email address">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-zinc-400 block mb-1.5">Full name</label>
          <Input {...register("name")} placeholder="Your name" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400 block mb-1.5">Email address</label>
          <Input {...register("email")} type="email" placeholder="you@example.com" />
          {errors.email ? (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          ) : (
            <p className="text-xs text-zinc-600 mt-1">Changing your email will require verification</p>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <SaveButton state={saveState} />
        </div>
      </form>
    </SettingsCard>
  );
}