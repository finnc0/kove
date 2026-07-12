"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { Canvas as CanvasType } from "./Canvas";

const Canvas = dynamic(
  () => import("./Canvas").then((m) => ({ default: m.Canvas })),
  { ssr: false },
);

export function CanvasLoader(props: ComponentProps<typeof CanvasType>) {
  return <Canvas {...props} />;
}
