"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type SignOutButtonProps = {
  className?: string;
  variant?: "primary" | "menu";
};

export function SignOutButton({
  className,
  variant = "primary",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const variantClassName =
    variant === "menu"
      ? "btn-ghost w-full justify-start rounded-xl border-0 bg-transparent px-3 text-base font-medium text-error shadow-none hover:bg-error/10 hover:text-error"
      : "btn-primary rounded-full px-6";

  async function handleSignOut() {
    setIsPending(true);

    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className={["btn", variantClassName, className].filter(Boolean).join(" ")}
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {isPending ? "Signing out" : "Sign out"}
    </button>
  );
}
