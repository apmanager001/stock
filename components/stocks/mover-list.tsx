import Link from "next/link";
import type { StockMover } from "@/lib/backend/stocks/yahoo";
import { StockSparkline } from "@/components/stocks/stock-sparkline";
import { formatCurrency, formatPercent } from "@/lib/stocks/format";

type MoverListProps = {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  iconClassName: string;
  itemLabel?: string;
  stocks: StockMover[];
  emptyMessage: string;
};

export function MoverList({
  eyebrow,
  title,
  icon,
  iconClassName,
  itemLabel,
  stocks,
  emptyMessage,
}: MoverListProps) {
  const resolvedItemLabel =
    itemLabel ?? (title === "Top gainers" ? "Up" : "Down");

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-base-content">
            {title}
          </h2>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-base-300/80 bg-base-100/70 p-8 text-base-content/58">
          {emptyMessage}
        </div>
      ) : (
        <div className="glass-panel min-w-0 overflow-hidden rounded-4xl border border-base-300/70 shadow-lg shadow-primary/5">
          <div className="grid grid-cols-[minmax(0,1fr)_4rem_4rem] gap-3 border-b border-base-300/60 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-base-content/42 sm:grid-cols-[minmax(0,1fr)_7rem_5.5rem] sm:gap-4 sm:px-5 sm:text-[11px]">
            <span>Name</span>
            <span className="text-center">Day</span>
            <span className="text-right">Move</span>
          </div>

          <div className="divide-y divide-base-300/60 bg-base-100/70">
            {stocks.map((stock) => {
              const isPositive = (stock.changePercent ?? 0) >= 0;

              return (
                <Link
                  key={stock.symbol}
                  href={`/stocks/${stock.symbol}`}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_4rem_4rem] items-center gap-3 px-3 py-4 transition-colors hover:bg-base-100/85 sm:grid-cols-[minmax(0,1fr)_7rem_5.5rem] sm:gap-4 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold text-base-content sm:text-lg">
                        {stock.symbol}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm text-base-content/58">
                      {stock.name}
                    </p>
                  </div>

                  <div className="justify-self-center">
                    <StockSparkline
                      symbol={stock.symbol}
                      points={stock.dayChart}
                      positive={isPositive}
                      className="h-10 w-16 sm:h-11 sm:w-28"
                    />
                  </div>

                  <div className="w-16 text-right sm:w-22">
                    <p className="text-sm font-semibold text-base-content sm:text-base">
                      {formatCurrency(stock.price, stock.currency ?? "USD")}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold sm:text-sm ${
                        isPositive ? "text-success" : "text-error"
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
