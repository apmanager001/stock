import type { Metadata } from "next";
import { CalculatorsShell } from "@/components/calculators/calculators-shell";
import { requireServerSession } from "@/lib/backend/auth/session";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Calculators",
  description:
    "Use private stock calculators for dividends, cost basis, position sizing, compounding, and trade planning.",
  path: "/calculators",
  noIndex: true,
});

export default async function CalculatorsPage() {
  const session = await requireServerSession();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.email;

  return (
    <section className="section-shell py-8 lg:py-14">
      <CalculatorsShell firstName={firstName} />
    </section>
  );
}
