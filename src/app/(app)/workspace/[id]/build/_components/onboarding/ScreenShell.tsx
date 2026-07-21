interface Props {
  question: string;
  hint?: string;
  children: React.ReactNode;
}

export function ScreenShell({ question, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{question}</h1>
        {hint && <p className="mt-2 text-sm text-zinc-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
