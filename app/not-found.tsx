import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="relative mb-8 select-none">
          <p className="text-[120px] font-semibold leading-none tracking-tighter text-muted/60">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[120px] font-semibold leading-none tracking-tighter text-muted-foreground/30 blur-xs">
            404
          </p>
        </div>

        <p className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Button className="text-lg py-3 px-4 h-auto" asChild>
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="size-6" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}
