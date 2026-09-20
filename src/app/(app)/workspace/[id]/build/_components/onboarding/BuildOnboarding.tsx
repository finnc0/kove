"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ScreenIdea } from "./ScreenIdea";
import { ScreenTargetUser } from "./ScreenTargetUser";
import { ScreenCoreValue } from "./ScreenCoreValue";
import { ScreenMonetization } from "./ScreenMonetization";
import { ScreenPlatform } from "./ScreenPlatform";
import { ScreenPalette } from "./ScreenPalette";
import { OnboardingComplete } from "./OnboardingComplete";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_SCREENS = 6;

type BuildPlanData = {
  id?: string;
  idea?: string | null;
  ideaSourceGap?: string | null;
  targetUser?: string | null;
  coreValue?: string | null;
  monetization?: string | null;
  platform?: string | null;
  designDirection?: string | null;
  onboardingComplete?: boolean;
};

interface Props {
  workspaceId: string;
  workspaceName: string;
  initialPlan: BuildPlanData | null;
}

export function BuildOnboarding({ workspaceId, workspaceName, initialPlan }: Props) {
  const router = useRouter();
  const reduced = useReducedMotion();

  // Start at the first incomplete screen
  const firstIncomplete = () => {
    if (!initialPlan) return 0;
    if (!initialPlan.idea) return 0;
    if (!initialPlan.targetUser) return 1;
    if (!initialPlan.coreValue) return 2;
    if (!initialPlan.monetization) return 3;
    if (!initialPlan.platform) return 4;
    if (!initialPlan.designDirection) return 5;
    return 6;
  };

  const [screen, setScreen] = useState(firstIncomplete);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (patch: Partial<BuildPlanData>) => {
      setSaving(true);
      try {
        await fetch(`/api/workspaces/${workspaceId}/build`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } finally {
        setSaving(false);
      }
    },
    [workspaceId],
  );

  const advance = useCallback(
    async (patch: Partial<BuildPlanData>) => {
      await save(patch);
      setDirection(1);
      setScreen((s) => s + 1);
    },
    [save],
  );

  const complete = useCallback(
    async (patch: Partial<BuildPlanData>) => {
      await save({ ...patch, onboardingComplete: true });
      setDirection(1);
      setScreen(TOTAL_SCREENS); // complete screen
    },
    [save],
  );

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      y: reduced ? 0 : dir > 0 ? 32 : -32,
    }),
    center: { opacity: 1, y: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      y: reduced ? 0 : dir > 0 ? -32 : 32,
    }),
  };

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.38, ease: EASE };

  const screenProps = { workspaceId, onAdvance: advance };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Progress dots */}
      {screen < TOTAL_SCREENS && (
        <div className="fixed top-8 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === screen ? "24px" : "6px",
                backgroundColor:
                  i < screen
                    ? "#2dd4bf"
                    : i === screen
                      ? "#2dd4bf"
                      : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      )}

      {/* Screen content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={screen}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="w-full max-w-lg"
        >
          {screen === 0 && (
            <ScreenIdea
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              initialValue={initialPlan?.idea ?? ""}
              onAdvance={(idea, ideaSourceGap) =>
                advance({ idea, ideaSourceGap: ideaSourceGap ?? null })
              }
            />
          )}
          {screen === 1 && (
            <ScreenTargetUser
              initialValue={initialPlan?.targetUser ?? ""}
              onAdvance={(targetUser) => advance({ targetUser })}
            />
          )}
          {screen === 2 && (
            <ScreenCoreValue
              initialValue={initialPlan?.coreValue ?? ""}
              onAdvance={(coreValue) => advance({ coreValue })}
            />
          )}
          {screen === 3 && (
            <ScreenMonetization
              initialValue={initialPlan?.monetization ?? ""}
              onAdvance={(monetization) => advance({ monetization })}
            />
          )}
          {screen === 4 && (
            <ScreenPlatform
              initialValue={initialPlan?.platform ?? ""}
              onAdvance={(platform) => advance({ platform })}
            />
          )}
          {screen === 5 && (
            <ScreenPalette
              initialValue={initialPlan?.designDirection ?? ""}
              onAdvance={(designDirection) => complete({ designDirection })}
              saving={saving}
            />
          )}
          {screen === TOTAL_SCREENS && (
            <OnboardingComplete
              workspaceId={workspaceId}
              onEnter={() => router.push(`/workspace/${workspaceId}/build`)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
