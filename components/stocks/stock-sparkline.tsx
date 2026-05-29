import type { StockChartPoint } from "@/lib/stocks/models";

type StockSparklineProps = {
  symbol: string;
  points: StockChartPoint[];
  positive: boolean;
  className?: string;
};

const sparklineWidth = 120;
const sparklineHeight = 44;
const sparklinePadding = 4;

export function StockSparkline({
  symbol,
  points,
  positive,
  className = "h-11 w-20 sm:w-28",
}: StockSparklineProps) {
  const stroke = positive ? "var(--color-success)" : "var(--color-error)";

  if (points.length < 2) {
    const fallbackY = sparklineHeight / 2;

    return (
      <svg
        viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
        className={className}
        role="img"
        aria-label={`${symbol} intraday chart unavailable`}
      >
        <path
          d={`M${sparklinePadding} ${fallbackY} L${sparklineWidth - sparklinePadding} ${fallbackY}`}
          fill="none"
          stroke="color-mix(in oklab, var(--color-base-content) 25%, transparent)"
          strokeDasharray="4 5"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  const closes = points.map((point) => point.close);
  const minimum = Math.min(...closes);
  const maximum = Math.max(...closes);
  const spread = maximum - minimum || 1;
  const usableWidth = sparklineWidth - sparklinePadding * 2;
  const usableHeight = sparklineHeight - sparklinePadding * 2;

  const path = points
    .map((point, index) => {
      const x =
        sparklinePadding +
        (index / Math.max(points.length - 1, 1)) * usableWidth;
      const y =
        sparklineHeight -
        sparklinePadding -
        ((point.close - minimum) / spread) * usableHeight;

      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
      className={className}
      role="img"
      aria-label={`${symbol} intraday chart`}
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.75"
      />
    </svg>
  );
}
