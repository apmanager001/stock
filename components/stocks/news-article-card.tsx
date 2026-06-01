import Image from "next/image";
import Link from "next/link";
import type { StockNewsArticle } from "@/lib/stocks/models";
import { formatDateTime } from "@/lib/stocks/format";

type NewsArticleCardProps = {
  article: StockNewsArticle;
  compact?: boolean;
  showTickerAction?: boolean;
};

export function NewsArticleCard({
  article,
  compact = false,
  showTickerAction = !compact,
}: NewsArticleCardProps) {
  const primaryTicker = article.relatedTickers[0];

  return (
    <article className="group relative overflow-hidden rounded-4xl border border-base-300/70 bg-neutral text-neutral-content shadow-lg shadow-primary/5">
      {article.thumbnailUrl ? (
        <Image
          src={article.thumbnailUrl}
          alt=""
          fill
          sizes={compact ? "(max-width: 1280px) 100vw, 720px" : "(max-width: 1280px) 100vw, 33vw"}
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 24%, transparent) 0%, color-mix(in oklab, var(--color-secondary) 24%, transparent) 100%)",
          }}
        />
      )}

      <a
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Open article: ${article.title}`}
      />

      <div
        className={[
          "pointer-events-none relative z-20 flex flex-col justify-between bg-linear-to-t from-neutral/92 via-neutral/38 to-neutral/8",
          compact ? "min-h-24 gap-4 p-4 sm:p-5" : "min-h-88 p-6",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3 text-xs uppercase tracking-[0.22em] text-neutral-content/72">
          <span className="rounded-full bg-neutral/45 px-3 py-1.5 backdrop-blur-sm">
            {article.publisher}
          </span>
          {primaryTicker ? (
            <span className="rounded-full bg-neutral/45 px-3 py-1.5 backdrop-blur-sm">
              {primaryTicker}
            </span>
          ) : null}
        </div>

        {compact ? (
          <div className="max-w-xl rounded-3xl bg-neutral/68 p-3.5 backdrop-blur-sm sm:p-4">
            <h3 className="text-base font-semibold leading-6 text-neutral-content sm:text-lg sm:leading-7">
              {article.title}
            </h3>

            <p className="mt-2 text-xs text-neutral-content/72 sm:text-sm">
              Published {formatDateTime(article.publishedAt)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {primaryTicker && showTickerAction ? (
              <div className="flex justify-end">
                <Link
                  href={`/stocks/${primaryTicker}`}
                  className="pointer-events-auto btn btn-ghost btn-sm relative z-30 rounded-full border border-neutral-content/22 bg-neutral/38 px-5 text-neutral-content backdrop-blur-sm hover:border-neutral-content/36 hover:bg-neutral/50"
                >
                  View {primaryTicker}
                </Link>
              </div>
            ) : null}

            <div className="max-w-xl rounded-3xl bg-neutral/68 p-5 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold leading-8 text-neutral-content">
                {article.title}
              </h3>

              <p className="mt-3 text-sm text-neutral-content/72">
                Published {formatDateTime(article.publishedAt)}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}