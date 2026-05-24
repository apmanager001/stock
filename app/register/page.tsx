import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Register",
  description:
    "Create an account in the template app to test Better Auth, MongoDB, and the protected dashboard flow.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      badge="New workspace"
      title="Create your account"
      description="Registering is the first step toward turning this starter into a real product. The form is ready for Better Auth email and password flows."
      highlights={[
        "Client-side validation with Zod",
        "Better Auth route scaffold at /api/auth/[...all]",
        "Global header and footer shared across every route",
      ]}
      alternateHref="/login"
      alternateText="Already have an account?"
      alternateLabel="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
