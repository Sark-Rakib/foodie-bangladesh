"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }) {
useEffect(() => {
  // Log a plain string (not the raw Error instance). Passing the object to
  // console.error lets the Next.js dev error overlay try to serialize/append a
  // DOM node, which can itself throw and mask the real error.
  const detail =
    (error && (error.stack || error.message)) || String(error ?? "Unknown error");
  console.error(`[boundary] ${detail}`);
}, [error]);

  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-forest">কিছু একটা ভুল হয়েছে</h1>
      <p className="mt-3 text-sm text-ink/65">Something went wrong. Please try again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep"
      >
        <RotateCcw className="h-4 w-4" />
        আবার চেষ্টা / Try again
      </button>
    </div>
  );
}
