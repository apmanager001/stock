import type { Metadata } from "next";
import {
  Building2,
  Mail,
  MessageSquareMore,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { updateTopCompaniesAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/backend/auth/admin";
import { getRecentFeedbackEntries } from "@/lib/backend/feedback";
import { getHomePageTopCompanySymbols } from "@/lib/backend/stocks/top-companies";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  formatTopCompanySymbolsInput,
  topCompanyTickerLimit,
} from "@/lib/stocks/top-companies";
import { formatDateTime } from "@/lib/stocks/format";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Console",
  description:
    "Manage homepage top companies and review feedback submissions from the public widget.",
  path: "/admin",
  noIndex: true,
});

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return typeof value === "string" ? value : undefined;
}

function getStatusNotice(
  status: string | undefined,
  symbol: string | undefined,
  message: string | undefined,
) {
  if (status === "saved") {
    return {
      className: "border-success/30 bg-success/10 text-success",
      text: "Homepage top companies were updated.",
    };
  }

  if (status === "cleared") {
    return {
      className: "border-base-300/70 bg-base-100/82 text-base-content/72",
      text: "Homepage top companies were cleared.",
    };
  }

  if (status === "stock-not-found") {
    return {
      className: "border-error/30 bg-error/10 text-error",
      text: `Could not resolve ${symbol ?? "that ticker"} against Yahoo Finance.`,
    };
  }

  if (status === "invalid-input") {
    return {
      className: "border-error/30 bg-error/10 text-error",
      text: message ?? "Enter up to six valid stock tickers.",
    };
  }

  return null;
}

function getStatusClassName(status: "new" | "reviewed" | "archived") {
  if (status === "reviewed") {
    return "bg-secondary/12 text-secondary";
  }

  if (status === "archived") {
    return "bg-base-300/70 text-base-content/68";
  }

  return "bg-primary/12 text-primary";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  await requireAdminSession();

  const [feedbackEntries, topCompanySymbols] = await Promise.all([
    getRecentFeedbackEntries(),
    getHomePageTopCompanySymbols(),
  ]);
  const newCount = feedbackEntries.filter(
    (entry) => entry.status === "new",
  ).length;
  const anonymousCount = feedbackEntries.filter(
    (entry) => !entry.isAuthenticated,
  ).length;
  const statusNotice = getStatusNotice(
    getSearchParam(params, "status"),
    getSearchParam(params, "symbol"),
    getSearchParam(params, "message"),
  );

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="space-y-8">
        <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Admin console
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                Homepage controls
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-base-content sm:text-5xl">
                Manage homepage companies and incoming feedback
              </h1>
            </div>

            <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
              Update the curated company list that appears on the homepage, then
              review submissions from every page and see whether the sender was
              signed in.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                Top companies
              </p>
              <p className="mt-3 text-3xl font-semibold text-base-content">
                {topCompanySymbols.length.toString().padStart(2, "0")}
              </p>
            </article>
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

        <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                    Homepage section
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-semibold text-base-content">
                    Top companies
                  </h2>
                </div>
              </div>

              <p className="text-base leading-8 text-base-content/68 sm:text-lg">
                Save up to {topCompanyTickerLimit} tickers for the homepage. The
                database stores the ticker list, then the homepage resolves live
                pricing and daily changes from Yahoo Finance.
              </p>

              {topCompanySymbols.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-base-300/80 bg-base-100/72 p-5 text-sm leading-7 text-base-content/58">
                  No companies are configured right now. Save a few tickers to
                  populate the third homepage column.
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
                    Current tickers
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topCompanySymbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="rounded-full border border-base-300/70 bg-base-100/78 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/68"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              action={updateTopCompaniesAction}
              className="grid gap-4 xl:w-104"
            >
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-base-content">
                  Tickers
                </span>
                <textarea
                  name="symbols"
                  defaultValue={formatTopCompanySymbolsInput(topCompanySymbols)}
                  rows={8}
                  className="textarea min-h-56 rounded-[1.75rem] border border-base-300/70 bg-base-100/78 px-4 py-4 text-sm leading-7 text-base-content shadow-inner shadow-primary/5"
                  placeholder={"AAPL\nMSFT\nNVDA"}
                />
              </label>

              <p className="text-sm leading-7 text-base-content/58">
                Enter one ticker per line or separate them with commas. Leave
                the field empty to clear the homepage list.
              </p>

              {statusNotice ? (
                <div
                  className={[
                    "rounded-[1.6rem] border px-4 py-3 text-sm font-medium",
                    statusNotice.className,
                  ].join(" ")}
                >
                  {statusNotice.text}
                </div>
              ) : null}

              <button
                type="submit"
                className="btn btn-primary rounded-full px-6 shadow-lg shadow-primary/20"
              >
                <Save className="h-4 w-4" />
                Save homepage companies
              </button>
            </form>
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
