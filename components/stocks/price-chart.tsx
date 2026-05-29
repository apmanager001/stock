"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";
import type { StockChartPoint } from "@/lib/stocks/models";
import { formatCurrency } from "@/lib/stocks/format";

type PriceChartProps = {
  symbol: string;
  currency: string;
  points: StockChartPoint[];
  positive: boolean;
};

const chartWidth = 760;
const chartHeight = 300;
const chartPadding = 20;

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const intradayHoverDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const longRangeHoverDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function PriceChart({
  symbol,
  currency,
  points,
  positive,
}: PriceChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-base-300/80 bg-base-100/70 p-8 text-center text-base-content/58">
        Yahoo Finance did not return enough data points to draw this chart yet.
      </div>
    );
  }

  const closes = points.map((point) => point.close);
  const minimum = Math.min(...closes);
  const maximum = Math.max(...closes);
  const spread = maximum - minimum || 1;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;
  const stroke = positive ? "var(--color-success)" : "var(--color-error)";
  const fillId = `chart-fill-${symbol.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const coordinates = points.map((point, index) => {
    const x =
      chartPadding + (index / Math.max(points.length - 1, 1)) * usableWidth;
    const y =
      chartHeight -
      chartPadding -
      ((point.close - minimum) / spread) * usableHeight;

    return { x, y };
  });

  const linePath = coordinates
    .map((coordinate, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`;
    })
    .join(" ");

  const firstCoordinate = coordinates[0];
  const lastCoordinate = coordinates.at(-1);
  const latestPoint = points.at(-1) ?? points[0];
  const selectedIndex = hoveredIndex ?? points.length - 1;
  const selectedPoint = points[selectedIndex] ?? latestPoint;
  const selectedCoordinate = coordinates[selectedIndex] ?? lastCoordinate;
  const isIntradayRange =
    new Date(latestPoint.date).getTime() - new Date(points[0].date).getTime() <=
    1000 * 60 * 60 * 48;
  const selectedDateLabel = Number.isNaN(new Date(selectedPoint.date).getTime())
    ? "Date unavailable"
    : (isIntradayRange
        ? intradayHoverDateFormatter
        : longRangeHoverDateFormatter
      ).format(new Date(selectedPoint.date));

  const areaPath = lastCoordinate
    ? `${linePath} L${lastCoordinate.x.toFixed(2)} ${(chartHeight - chartPadding).toFixed(2)} L${firstCoordinate.x.toFixed(2)} ${(chartHeight - chartPadding).toFixed(2)} Z`
    : linePath;

  function updateHoveredPoint(event: ReactPointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (!bounds.width) {
      return;
    }

    const relativeX =
      ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const clampedX = Math.min(
      Math.max(relativeX, chartPadding),
      chartWidth - chartPadding,
    );
    const ratio = (clampedX - chartPadding) / usableWidth;
    const nextIndex = Math.round(ratio * Math.max(points.length - 1, 1));

    setHoveredIndex(nextIndex);
  }

  return (
    <div className="rounded-4xl border border-base-300/70 bg-base-100/75 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="max-w-40">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
            Price history
          </p>
          <p className="mt-2 text-sm text-base-content/62">
            Hover or drag across the chart to inspect each price point.
          </p>
        </div>

        <div className="text-right text-sm text-base-content/62">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
            {hoveredIndex === null ? "Latest close" : "Hovered price"}
          </p>
          <p className="mt-2 text-lg font-semibold text-base-content">
            {formatCurrency(selectedPoint.close, currency)}
          </p>
          <p className="mt-2 text-xs text-base-content/56">
            {selectedDateLabel}
          </p>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-64 w-full touch-pan-y sm:h-80"
          role="img"
          aria-label={`${symbol} price chart`}
          onPointerDown={updateHoveredPoint}
          onPointerMove={updateHoveredPoint}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.24" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
          />

          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = chartPadding + usableHeight * ratio;

            return (
              <line
                key={ratio}
                x1={chartPadding}
                x2={chartWidth - chartPadding}
                y1={y}
                y2={y}
                stroke="color-mix(in oklab, var(--color-base-content) 10%, transparent)"
                strokeDasharray="5 6"
              />
            );
          })}

          <path d={areaPath} fill={`url(#${fillId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hoveredIndex !== null && selectedCoordinate ? (
            <>
              <line
                x1={selectedCoordinate.x}
                x2={selectedCoordinate.x}
                y1={chartPadding}
                y2={chartHeight - chartPadding}
                stroke="color-mix(in oklab, var(--color-base-content) 20%, transparent)"
                strokeDasharray="5 6"
              />
              <circle
                cx={selectedCoordinate.x}
                cy={selectedCoordinate.y}
                r="7"
                fill="var(--color-base-100)"
                stroke={stroke}
                strokeWidth="4"
              />
            </>
          ) : null}
        </svg>

        {hoveredIndex !== null && selectedCoordinate ? (
          <div
            className={[
              "pointer-events-none absolute top-3 z-10 rounded-2xl border border-base-300/70 bg-base-100/92 px-3 py-2 text-xs shadow-lg shadow-primary/10 backdrop-blur-sm",
              selectedCoordinate.x > chartWidth * 0.72
                ? "-translate-x-full"
                : "translate-x-0",
            ].join(" ")}
            style={{
              left: `${(selectedCoordinate.x / chartWidth) * 100}%`,
            }}
          >
            <p className="font-semibold text-base-content">
              {formatCurrency(selectedPoint.close, currency)}
            </p>
            <p className="mt-1 text-base-content/58">{selectedDateLabel}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-base-content/56">
        <span>{shortDateFormatter.format(new Date(points[0].date))}</span>
        <span>
          {shortDateFormatter.format(
            new Date(points.at(-1)?.date ?? points[0].date),
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-base-content/40">
        <span>High {formatCurrency(maximum, currency)}</span>
        <span>Low {formatCurrency(minimum, currency)}</span>
      </div>
    </div>
  );
}
