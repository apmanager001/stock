"use client";

import { createPortal } from "react-dom";

type ModalPortalProps = {
  children: React.ReactNode;
};

export function ModalPortal({ children }: ModalPortalProps) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}
