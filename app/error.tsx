"use client"

import { useEffect } from "react";
import { LayoutDashboard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">

        <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="hsl(var(--destructive))"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <p className="text-base font-medium text-foreground mb-2">
          Something went wrong
        </p>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          An unexpected error occurred while loading this page.
        </p>

        {error?.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-md mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {!error?.digest && <div className="mb-6" />}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={reset} className="flex items-center gap-2">
            <RotateCcw size={14} />
            Try again
          </Button>
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </Button>
        </div>

      </div>
    </main>
  );
}
