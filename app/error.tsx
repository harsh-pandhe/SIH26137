"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-4 px-4">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Something went wrong</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          This simulation panel hit an unexpected error. You can try again, or navigate back to
          the overview.
        </p>
      </div>
      <Button variant="primary" onClick={reset}>
        <RotateCcw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
