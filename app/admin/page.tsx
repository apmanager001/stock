import type { Metadata } from "next";
import { Mail, MessageSquareMore, ShieldCheck, UserRound } from "lucide-react";
import { requireAdminSession } from "@/lib/backend/auth/admin";
import { getRecentFeedbackEntries } from "@/lib/backend/feedback";
import { createPageMetadata } from "@/lib/seo/metadata";
import { formatDateTime } from "@/lib/stocks/format";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Feedback",
  description: "Review feedback submissions from the public feedback widget.",
  path: "/admin",
  noIndex: true,
});

function getStatusClassName(status: "new" | "reviewed" | "archived") {
  if (status === "reviewed") {
    return "bg-secondary/12 text-secondary";
  }

  if (status === "archived") {
    return "bg-base-300/70 text-base-content/68";
  }

  return "bg-primary/12 text-primary";
}

export default async function AdminFeedbackPage() {
  await requireAdminSession();

  const feedbackEntries = await getRecentFeedbackEntries();
  const newCount = feedbackEntries.filter(
    (entry) => entry.status === "new",
  ).length;
  const anonymousCount = feedbackEntries.filter(
    (entry) => !entry.isAuthenticated,
  ).length;

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="space-y-8">
        <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Admin inbox
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                Feedback review
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-base-content sm:text-5xl">
                Manage incoming product feedback
              </h1>
            </div>

            <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
              Review submissions from every page, see whether the sender was
              signed in, and use MongoDB to flip `status` or `admin` fields as
              needed.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                Total submissions
              </p>
              <p className="mt-3 text-3xl font-semibold text-base-content">
                {feedbackEntries.length.toString().padStart(2, "0")}
              </p>
            </article>
            <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                New items
              </p>
              <p className="mt-3 text-3xl font-semibold text-base-content">
                {newCount.toString().padStart(2, "0")}
              </p>
            </article>
            <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                Anonymous senders
              </p>
              <p className="mt-3 text-3xl font-semibold text-base-content">
                {anonymousCount.toString().padStart(2, "0")}
              </p>
            </article>
          </div>
        </div>

        {feedbackEntries.length === 0 ? (
          <div className="glass-panel rounded-4xl border border-dashed border-base-300/80 p-8 text-sm leading-7 text-base-content/58 shadow-lg shadow-primary/5">
            Feedback submissions will appear here once people start sending
            them.
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackEntries.map((entry) => (
              <article
                key={entry.id}
                className="glass-panel rounded-4xl border border-base-300/70 p-5 shadow-lg shadow-primary/5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                          getStatusClassName(entry.status),
                        ].join(" ")}
                      >
                        {entry.status}
                      </span>
                      <span className="rounded-full bg-base-100/82 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/58">
                        {entry.isAuthenticated ? "Signed in" : "Anonymous"}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-base-content/42">
                        {formatDateTime(entry.submittedAt)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-base-content sm:text-2xl">
                        {entry.submitterName}
                      </h2>
                      <p className="mt-1 text-sm text-base-content/58">
                        Sent from {entry.pagePath}
                      </p>
                    </div>

                    <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/82 p-4 text-sm leading-7 text-base-content/76 whitespace-pre-wrap wrap-break-word">
                      {entry.message}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:w-72">
                    <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/78 p-4">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                        <UserRound className="h-4 w-4" />
                        Sender
                      </p>
                      <p className="mt-3 text-sm font-semibold text-base-content">
                        {entry.submitterName}
                      </p>
                    </div>

                    <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/78 p-4">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                        <Mail className="h-4 w-4" />
                        Contact
                      </p>
                      {entry.contactEmail ? (
                        <a
                          href={`mailto:${entry.contactEmail}`}
                          className="mt-3 block break-all text-sm font-semibold text-primary hover:text-primary/78"
                        >
                          {entry.contactEmail}
                        </a>
                      ) : (
                        <p className="mt-3 text-sm text-base-content/58">
                          No email provided
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/78 p-4">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                        <MessageSquareMore className="h-4 w-4" />
                        Source page
                      </p>
                      <p className="mt-3 break-all text-sm font-semibold text-base-content">
                        {entry.pagePath}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
