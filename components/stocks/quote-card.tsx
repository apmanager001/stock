import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { StockQuoteCard } from "@/lib/backend/stocks/yahoo";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";

type StockQuoteCardProps = {
  stock: StockQuoteCard;
  href?: string;
};

export function QuoteCard({ stock, href }: StockQuoteCardProps) {
  const isPositive = (stock.changePercent ?? 0) >= 0;
  const changeClass = isPositive ? "text-success" : "text-error";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
            {stock.symbol}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-base-content">
            {stock.name}
          </h3>
          <p className="mt-1 text-sm text-base-content/58">{stock.exchange}</p>
        </div>

        {href ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-base-300/70 bg-base-100/80 text-base-content/60 transition-colors group-hover:border-primary/40 group-hover:text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
            {formatCurrency(stock.price, stock.currency ?? "USD")}
          </p>
          <p className={`mt-2 text-sm font-medium ${changeClass}`}>
            {formatSignedCurrency(stock.change, stock.currency ?? "USD")} ·{" "}
            {formatPercent(stock.changePercent)}
          </p>
        </div>

        <div className="text-right text-xs uppercase tracking-[0.22em] text-base-content/42">
          <p>State</p>
          <p className="mt-2 text-sm font-medium tracking-normal text-base-content/72">
            {stock.marketState ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-base-300/70 bg-base-100/75 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
            Volume
          </p>
          <p className="mt-2 text-lg font-semibold text-base-content">
            {formatCompactNumber(stock.volume)}
          </p>
        </div>
        <div className="rounded-2xl border border-base-300/70 bg-base-100/75 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
            Market cap
          </p>
          <p className="mt-2 text-lg font-semibold text-base-content">
            {formatCompactNumber(stock.marketCap)}
          </p>
        </div>
      </div>
    </>
  );

  if (!href) {
    return (
      <article className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5">
        {content}
      </article>
    );
  }

  return (
    <article className="group glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5 transition-transform duration-200 hover:-translate-y-1">
      <Link href={href} className="block">
        {content}
      </Link>
    </article>
  );
}
