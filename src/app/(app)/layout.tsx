import { TopNav } from "@/components/app/TopNav";
import { SessionProvider } from "@/components/app/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-zinc-950">
        <TopNav />
        <main>{children}</main>
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </SessionProvider>
  );
}
