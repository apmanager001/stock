"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";
import { ModalPortal } from "@/components/ui/modal-portal";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ModalShell({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalShellProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="pointer-events-auto absolute inset-0 bg-neutral/52 opacity-100 backdrop-blur-sm"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={[
              "pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-xl border border-base-300/70 bg-base-100/96 shadow-2xl shadow-neutral/20 backdrop-blur-xl",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-start justify-between gap-4 border-b border-base-300/60 p-5 sm:p-6">
              <div>
                <h2
                  id={titleId}
                  className="font-display text-2xl font-semibold text-base-content"
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="mt-3 max-w-xl text-sm leading-6 text-base-content/68"
                  >
                    {description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6">{children}</div>
          </section>
        </div>
      </div>
    </ModalPortal>
  );
}
