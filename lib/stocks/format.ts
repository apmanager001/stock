export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  maximumFractionDigits = 2,
) {
  if (typeof value !== "number") {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatSignedCurrency(
  value: number | null | undefined,
  currency = "USD",
) {
  if (typeof value !== "number") {
    return "--";
  }

  const formatted = formatCurrency(Math.abs(value), currency);
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

export function formatCompactNumber(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}
