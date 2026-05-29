import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Login",
  description:
    "Sign in to manage your stock wishlist and jump back into your saved tickers.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      badge="Welcome back"
      title="Login to your watchlist"
      description="Your saved stocks live behind Better Auth and MongoDB, so signing in takes you straight back to the tickers, charts, and articles you care about."
      highlights={[
        "Persistent wishlist storage in MongoDB",
        "Protected dashboard with server-side session checks",
        "Stock detail pages with charts and Yahoo Finance news",
      ]}
      alternateHref="/register"
      alternateText="Need an account?"
      alternateLabel="Create one"
    >
      <LoginForm />
    </AuthShell>
  );
}
