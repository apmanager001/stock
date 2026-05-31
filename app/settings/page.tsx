import type { Metadata } from "next";
import { SettingsShell } from "@/components/settings/settings-shell";
import { requireServerSession } from "@/lib/backend/auth/session";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Settings",
  description:
    "Manage your TapeDeck account preferences and notification settings.",
  path: "/settings",
  noIndex: true,
});

export default async function SettingsPage() {
  const session = await requireServerSession();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.email;

  return (
    <section className="section-shell py-8 lg:py-14">
      <SettingsShell firstName={firstName} email={session.user.email} />
    </section>
  );
}