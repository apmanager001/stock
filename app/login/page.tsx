import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Login",
  description:
    "Sign in to the template dashboard using Better Auth email and password authentication.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      badge="Welcome back"
      title="Login to keep building"
      description="Email and password auth is scaffolded with Better Auth and a Mongo-backed route handler, so you can move from template to product without reworking the shell."
      highlights={[
        "Better Auth client methods wired into the UI",
        "TanStack Query ready for session-aware components",
        "MongoDB and Mongoose utilities already organized",
      ]}
      alternateHref="/register"
      alternateText="Need an account?"
      alternateLabel="Create one"
    >
      <LoginForm />
    </AuthShell>
  );
}