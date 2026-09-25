import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radio, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-4 px-4">
      <Radio className="h-10 w-10 text-cyan-400" />
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">404 — Route not found</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          The page you&apos;re looking for isn&apos;t on the network graph. Head back to the
          command center overview.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary">
          <Home className="h-4 w-4" /> Back to Overview
        </Button>
      </Link>
    </div>
  );
}
