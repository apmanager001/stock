"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, MessageSquare, X } from "lucide-react";
import { useMemo, useState } from "react";

const FeedbackPanel = dynamic(
  () => import("@/components/feedback/panel").then((mod) => mod.FeedbackPanel),
  {
    ssr: false,
    loading: () => (
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute inset-0 bg-neutral/28 backdrop-blur-[1px]" />
        <div className="absolute right-0 top-0 flex h-dvh w-full max-w-none items-center justify-center bg-base-100/95 sm:max-w-md sm:rounded-l-4xl sm:border-l sm:border-base-300/70">
          <div className="flex items-center gap-3 rounded-full border border-base-300/70 bg-base-100/82 px-4 py-3 text-sm font-medium text-base-content/68 shadow-lg shadow-primary/10">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading feedback
          </div>
        </div>
      </div>
    ),
  },
);

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonLabel = useMemo(
    () => (isOpen ? "Close feedback form" : "Open feedback form"),
    [isOpen],
  );

  return (
    <>
      {isOpen ? <FeedbackPanel onClose={() => setIsOpen(false)} /> : null}

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 sm:bottom-6 sm:right-6">
        <button
          type="button"
          aria-controls="feedback-panel"
          aria-expanded={isOpen}
          aria-label={buttonLabel}
          onClick={() => setIsOpen((open) => !open)}
          className={[
            "btn btn-circle btn-md shadow-2xl transition-all duration-300 sm:btn-lg",
            isOpen
              ? "btn-neutral scale-95"
              : "btn-primary shadow-primary/30 hover:scale-105",
          ].join(" ")}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageSquare className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}
