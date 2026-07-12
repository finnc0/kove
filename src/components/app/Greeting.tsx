"use client";

import { useState, useEffect } from "react";

interface GreetingProps {
  firstName: string;
}

export function Greeting({ firstName }: GreetingProps) {
  const [timeOfDay, setTimeOfDay] = useState("morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">
        Good {timeOfDay}, {firstName}
      </h1>
      <p className="text-sm text-zinc-500 mt-1">What market are you researching today?</p>
    </div>
  );
}
