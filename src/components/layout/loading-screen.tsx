"use client";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 h-screen w-full gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      Loading...
    </div>
  );
}
