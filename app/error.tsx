"use client";
import { useEffect } from "react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

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
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <ErrorMessage
          message="Something went wrong loading the Pokédex. Please try again."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
