import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Register",
  description:
    "Create an account to save stock tickers to your personal wishlist.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      badge="New watchlist"
      title="Create your account"
      description="Create an account to start saving stock symbols, tracking their price action, and opening detailed quote pages whenever you need them."
      highlights={[
        "Email and password auth with Better Auth",
        "Mongo-backed wishlist persistence",
        "A public homepage for movers and market headlines",
      ]}
      alternateHref="/login"
      alternateText="Already have an account?"
      alternateLabel="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
