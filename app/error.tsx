"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Dashboard crashed:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card-soft rounded-2xl p-8">
        <h1 className="text-gradient text-3xl font-semibold">Something hiccupped</h1>
        <p className="mt-3 text-sm text-steel-300">
          The dashboard ran into unexpected data (likely from a corrupted shared link or
          local edit). Reset to the seed data to get back on track — your last exported
          JSON can be re-imported afterwards.
        </p>
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-white/5 bg-black/30 p-3 text-left text-[11px] text-rust-400">
          {error.message}
          {error.digest ? `\n(digest: ${error.digest})` : ""}
        </pre>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              try {
                window.localStorage.removeItem("princess-renovation-dashboard-v1");
              } catch {}
              window.location.hash = "";
              window.location.reload();
            }}
            className="rounded-lg bg-gradient-to-br from-amber-500 to-rust-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:from-amber-400 hover:to-rust-400"
          >
            Reset & reload
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      </div>
    </main>
  );
}
