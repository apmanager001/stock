"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calculator,
  Coins,
  LineChart,
  PanelLeft,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";

type CalculatorsShellProps = {
  firstName: string;
};

type CalculatorId =
  | "dividend"
  | "cost-basis"
  | "position-size"
  | "compound-growth"
  | "profit-loss"
  | "break-even"
  | "reinvestment";

type CalculatorDefinition = {
  id: CalculatorId;
  label: string;
  description: string;
  eyebrow: string;
  title: string;
  note: string;
  icon: LucideIcon;
};

const calculatorDefinitions = [
  {
    id: "dividend",
    label: "Dividend",
    description: "Estimate yield and portfolio income from a position.",
    eyebrow: "Income planning",
    title: "Dividend calculator",
    note:
      "Yield is annual dividend per share divided by current share price. Taxes and future dividend changes are not included.",
    icon: Coins,
  },
  {
    id: "cost-basis",
    label: "Cost basis",
    description: "Blend an existing position with a new purchase.",
    eyebrow: "Position management",
    title: "Cost basis calculator",
    note:
      "This assumes you are adding shares to an existing position and want the new weighted average cost.",
    icon: Scale,
  },
  {
    id: "position-size",
    label: "Position size",
    description: "Size a trade from account risk and stop distance.",
    eyebrow: "Risk control",
    title: "Position size calculator",
    note:
      "Share sizing uses your dollar risk budget divided by the difference between entry and stop price.",
    icon: ShieldCheck,
  },
  {
    id: "compound-growth",
    label: "Compound growth",
    description: "Project future value with monthly contributions.",
    eyebrow: "Long-term planning",
    title: "Compound growth calculator",
    note:
      "Returns are compounded monthly and contributions are added at the end of each month.",
    icon: TrendingUp,
  },
  {
    id: "profit-loss",
    label: "Profit / loss",
    description: "Measure net trade outcome before you execute.",
    eyebrow: "Trade planning",
    title: "Profit and loss calculator",
    note:
      "Net profit assumes the fee field represents the total fees for the trade from entry through exit.",
    icon: LineChart,
  },
  {
    id: "break-even",
    label: "Break-even",
    description: "See the rebound needed after a pullback.",
    eyebrow: "Recovery planning",
    title: "Break-even calculator",
    note:
      "Required gain is measured from the current price back to your original entry price.",
    icon: Target,
  },
  {
    id: "reinvestment",
    label: "Reinvestment",
    description: "Model a basic dividend reinvestment path.",
    eyebrow: "Income growth",
    title: "Dividend reinvestment calculator",
    note:
      "This assumes one dividend reinvestment at the end of each year using the year-end price.",
    icon: RefreshCcw,
  },
] satisfies readonly CalculatorDefinition[];

function parseNumberInput(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parsePositiveNumber(value: string) {
  const parsedValue = parseNumberInput(value);
  return typeof parsedValue === "number" && parsedValue > 0
    ? parsedValue
    : null;
}

function parseNonNegativeNumber(value: string) {
  const parsedValue = parseNumberInput(value);
  return typeof parsedValue === "number" && parsedValue >= 0
    ? parsedValue
    : null;
}

function formatPlainNumber(
  value: number | null | undefined,
  maximumFractionDigits = 2,
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatPlainPercent(
  value: number | null | undefined,
  maximumFractionDigits = 2,
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(maximumFractionDigits)}%`;
}

function formatMultiple(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(2)}x`;
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  min?: string;
  step?: string;
};

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min,
  step = "0.01",
}: NumberFieldProps) {
  const hasPrefix = Boolean(prefix);
  const hasSuffix = Boolean(suffix);

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
        {label}
      </span>
      <div className="flex items-stretch">
        {hasPrefix ? (
          <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-base-300/70 bg-base-200/70 px-4 text-sm font-medium text-base-content/58">
            {prefix}
          </span>
        ) : null}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "input input-bordered h-13 w-full bg-base-100/80",
            hasPrefix ? "rounded-l-none" : "rounded-l-2xl",
            hasSuffix ? "rounded-r-none" : "rounded-r-2xl",
          ].join(" ")}
        />
        {hasSuffix ? (
          <span className="inline-flex items-center rounded-r-2xl border border-l-0 border-base-300/70 bg-base-200/70 px-4 text-sm font-medium text-base-content/58">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-sm text-base-content/56">{hint}</p> : null}
    </label>
  );
}

type ResultTileProps = {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
};

function ResultTile({
  label,
  value,
  hint,
  valueClassName,
}: ResultTileProps) {
  return (
    <div className="rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
        {label}
      </p>
      <p
        className={[
          "mt-2 text-lg font-semibold text-base-content",
          valueClassName ?? "",
        ].join(" ")}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-base-content/56">{hint}</p> : null}
    </div>
  );
}

type CalculatorPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
  fields: React.ReactNode;
  results: React.ReactNode;
  alertMessage?: string | null;
};

function CalculatorPanel({
  eyebrow,
  title,
  description,
  note,
  icon: Icon,
  fields,
  results,
  alertMessage,
}: CalculatorPanelProps) {
  return (
    <div className="glass-panel min-w-0 rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-base-content/62">
            {description}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid gap-4">{fields}</div>

        <div className="space-y-4">
          {alertMessage ? (
            <div className="alert alert-warning rounded-2xl text-sm">
              {alertMessage}
            </div>
          ) : null}

          {results}

          <div className="rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Assumptions
            </p>
            <p className="mt-2 text-sm leading-7 text-base-content/62">{note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  selectedCalculator: CalculatorId;
  onSelect: (calculatorId: CalculatorId) => void;
};

function CalculatorSidebar({ selectedCalculator, onSelect }: SidebarProps) {
  return (
    <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
          Calculator list
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
          Choose a tool
        </h2>
        <p className="mt-3 text-sm leading-7 text-base-content/62">
          Switch between calculators without leaving the page. Nothing here is
          saved to your account.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {calculatorDefinitions.map((calculator) => {
          const isSelected = calculator.id === selectedCalculator;
          const Icon = calculator.icon;

          return (
            <button
              key={calculator.id}
              type="button"
              onClick={() => onSelect(calculator.id)}
              aria-pressed={isSelected}
              className={[
                "w-full rounded-3xl border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary/35 bg-primary/8"
                  : "border-base-300/70 bg-base-100/75 hover:border-primary/20",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    isSelected
                      ? "bg-primary/14 text-primary"
                      : "bg-base-200/70 text-base-content/62",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-base-content">{calculator.label}</p>
                  <p className="mt-1 text-sm leading-6 text-base-content/58">
                    {calculator.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
          Workspace note
        </p>
        <p className="mt-2 text-sm leading-7 text-base-content/62">
          Inputs stay local to this page. Refreshing or leaving the page clears
          your calculator state.
        </p>
      </div>
    </div>
  );
}

export function CalculatorsShell({ firstName }: CalculatorsShellProps) {
  const [selectedCalculator, setSelectedCalculator] =
    useState<CalculatorId>("dividend");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dividendForm, setDividendForm] = useState({
    sharePrice: "180",
    annualDividend: "4.80",
    shares: "25",
  });
  const [costBasisForm, setCostBasisForm] = useState({
    currentShares: "12",
    averageCost: "124.50",
    sharesToBuy: "8",
    purchasePrice: "109.25",
  });
  const [positionSizeForm, setPositionSizeForm] = useState({
    accountSize: "10000",
    riskPercent: "1",
    entryPrice: "52",
    stopPrice: "48.50",
  });
  const [compoundGrowthForm, setCompoundGrowthForm] = useState({
    initialInvestment: "5000",
    monthlyContribution: "250",
    annualReturn: "8",
    years: "10",
  });
  const [profitLossForm, setProfitLossForm] = useState({
    shares: "40",
    entryPrice: "95",
    exitPrice: "108",
    fees: "5",
  });
  const [breakEvenForm, setBreakEvenForm] = useState({
    entryPrice: "100",
    currentPrice: "72",
  });
  const [reinvestmentForm, setReinvestmentForm] = useState({
    initialInvestment: "2500",
    sharePrice: "50",
    dividendYield: "3.5",
    annualPriceGrowth: "6",
    years: "10",
  });

  const dividendSharePrice = parsePositiveNumber(dividendForm.sharePrice);
  const annualDividend = parseNonNegativeNumber(dividendForm.annualDividend);
  const dividendShares = parseNonNegativeNumber(dividendForm.shares);
  const dividendYield =
    dividendSharePrice && annualDividend !== null
      ? (annualDividend / dividendSharePrice) * 100
      : null;
  const annualIncome =
    annualDividend !== null && dividendShares !== null
      ? annualDividend * dividendShares
      : null;
  const quarterlyIncome =
    annualIncome !== null ? annualIncome / 4 : null;
  const monthlyIncome = annualIncome !== null ? annualIncome / 12 : null;
  const dividendPositionCost =
    dividendSharePrice && dividendShares !== null
      ? dividendSharePrice * dividendShares
      : null;

  const currentShares = parseNonNegativeNumber(costBasisForm.currentShares);
  const averageCost = parseNonNegativeNumber(costBasisForm.averageCost);
  const sharesToBuy = parseNonNegativeNumber(costBasisForm.sharesToBuy);
  const purchasePrice = parseNonNegativeNumber(costBasisForm.purchasePrice);
  const existingCost =
    currentShares !== null && averageCost !== null
      ? currentShares * averageCost
      : null;
  const addedCapital =
    sharesToBuy !== null && purchasePrice !== null
      ? sharesToBuy * purchasePrice
      : null;
  const totalShares =
    currentShares !== null && sharesToBuy !== null
      ? currentShares + sharesToBuy
      : null;
  const blendedCostBasis =
    existingCost !== null &&
    addedCapital !== null &&
    typeof totalShares === "number" &&
    totalShares > 0
      ? (existingCost + addedCapital) / totalShares
      : null;
  const basisChange =
    blendedCostBasis !== null && averageCost !== null
      ? blendedCostBasis - averageCost
      : null;

  const accountSize = parsePositiveNumber(positionSizeForm.accountSize);
  const riskPercent = parsePositiveNumber(positionSizeForm.riskPercent);
  const entryPrice = parsePositiveNumber(positionSizeForm.entryPrice);
  const stopPrice = parsePositiveNumber(positionSizeForm.stopPrice);
  const riskBudget =
    accountSize && riskPercent !== null
      ? (accountSize * riskPercent) / 100
      : null;
  const riskPerShare =
    entryPrice !== null && stopPrice !== null
      ? Math.abs(entryPrice - stopPrice)
      : null;
  const hasValidStopDistance =
    typeof riskPerShare === "number" && riskPerShare > 0;
  const maxWholeShares =
    riskBudget !== null && hasValidStopDistance
      ? Math.floor(riskBudget / riskPerShare)
      : null;
  const fractionalShares =
    riskBudget !== null && hasValidStopDistance
      ? riskBudget / riskPerShare
      : null;
  const positionValue =
    entryPrice !== null && maxWholeShares !== null
      ? entryPrice * maxWholeShares
      : null;
  const allocationPercent =
    positionValue !== null && accountSize
      ? (positionValue / accountSize) * 100
      : null;
  const stopDistancePercent =
    entryPrice !== null && hasValidStopDistance
      ? (riskPerShare / entryPrice) * 100
      : null;
  const positionSizeAlert =
    entryPrice !== null && stopPrice !== null && !hasValidStopDistance
      ? "Entry and stop price must be different to calculate a position size."
      : null;

  const initialInvestment = parseNonNegativeNumber(
    compoundGrowthForm.initialInvestment,
  );
  const monthlyContribution = parseNonNegativeNumber(
    compoundGrowthForm.monthlyContribution,
  );
  const compoundAnnualReturn = parseNumberInput(compoundGrowthForm.annualReturn);
  const compoundYears = parsePositiveNumber(compoundGrowthForm.years);
  const compoundMonths =
    typeof compoundYears === "number" ? Math.round(compoundYears * 12) : null;
  const hasValidCompoundRate =
    typeof compoundAnnualReturn === "number" && compoundAnnualReturn > -100;
  const monthlyRate = hasValidCompoundRate
    ? compoundAnnualReturn / 100 / 12
    : null;
  const totalContributions =
    initialInvestment !== null &&
    monthlyContribution !== null &&
    typeof compoundMonths === "number"
      ? initialInvestment + monthlyContribution * compoundMonths
      : null;
  const compoundFutureValue =
    initialInvestment !== null &&
    monthlyContribution !== null &&
    monthlyRate !== null &&
    typeof compoundMonths === "number"
      ? monthlyRate === 0
        ? initialInvestment + monthlyContribution * compoundMonths
        : initialInvestment * (1 + monthlyRate) ** compoundMonths +
          monthlyContribution *
            (((1 + monthlyRate) ** compoundMonths - 1) / monthlyRate)
      : null;
  const compoundGrowth =
    compoundFutureValue !== null && totalContributions !== null
      ? compoundFutureValue - totalContributions
      : null;
  const portfolioMultiple =
    compoundFutureValue !== null && totalContributions !== null && totalContributions > 0
      ? compoundFutureValue / totalContributions
      : null;

  const tradeShares = parsePositiveNumber(profitLossForm.shares);
  const tradeEntryPrice = parsePositiveNumber(profitLossForm.entryPrice);
  const tradeExitPrice = parsePositiveNumber(profitLossForm.exitPrice);
  const tradeFees = parseNonNegativeNumber(profitLossForm.fees);
  const grossCost =
    tradeShares && tradeEntryPrice !== null
      ? tradeShares * tradeEntryPrice
      : null;
  const netProceeds =
    tradeShares && tradeExitPrice !== null && tradeFees !== null
      ? tradeShares * tradeExitPrice - tradeFees
      : null;
  const netProfitLoss =
    tradeShares &&
    tradeEntryPrice !== null &&
    tradeExitPrice !== null &&
    tradeFees !== null
      ? (tradeExitPrice - tradeEntryPrice) * tradeShares - tradeFees
      : null;
  const tradeReturnPercent =
    netProfitLoss !== null && grossCost !== null && grossCost > 0
      ? (netProfitLoss / grossCost) * 100
      : null;
  const breakEvenExit =
    tradeShares && grossCost !== null && tradeFees !== null
      ? (grossCost + tradeFees) / tradeShares
      : null;

  const breakEvenEntryPrice = parsePositiveNumber(breakEvenForm.entryPrice);
  const currentMarketPrice = parsePositiveNumber(breakEvenForm.currentPrice);
  const drawdownPercent =
    breakEvenEntryPrice && currentMarketPrice !== null
      ? ((currentMarketPrice - breakEvenEntryPrice) / breakEvenEntryPrice) * 100
      : null;
  const requiredGainPercent =
    breakEvenEntryPrice && currentMarketPrice !== null
      ? Math.max(0, (breakEvenEntryPrice / currentMarketPrice - 1) * 100)
      : null;
  const recoveryGap =
    breakEvenEntryPrice && currentMarketPrice !== null
      ? Math.max(0, breakEvenEntryPrice - currentMarketPrice)
      : null;

  const dripInitialInvestment = parsePositiveNumber(
    reinvestmentForm.initialInvestment,
  );
  const dripSharePrice = parsePositiveNumber(reinvestmentForm.sharePrice);
  const dripDividendYield = parseNonNegativeNumber(
    reinvestmentForm.dividendYield,
  );
  const dripPriceGrowth = parseNumberInput(reinvestmentForm.annualPriceGrowth);
  const dripYears = parsePositiveNumber(reinvestmentForm.years);
  const hasValidDripGrowth =
    typeof dripPriceGrowth === "number" && dripPriceGrowth > -100;
  let endingDripValue: number | null = null;
  let endingDripShares: number | null = null;
  let totalReinvestedDividends: number | null = null;
  let endingAnnualDividendIncome: number | null = null;
  let dripNewShares: number | null = null;

  if (
    dripInitialInvestment !== null &&
    dripSharePrice !== null &&
    dripDividendYield !== null &&
    hasValidDripGrowth &&
    dripYears !== null
  ) {
    const totalYears = Math.round(dripYears);
    const annualYield = dripDividendYield / 100;
    const annualGrowth = (dripPriceGrowth ?? 0) / 100;
    const initialShares = dripInitialInvestment / dripSharePrice;
    let simulatedShares = initialShares;
    let simulatedPrice = dripSharePrice;
    let simulatedDividends = 0;

    for (let year = 0; year < totalYears; year += 1) {
      const dividendCash = simulatedShares * simulatedPrice * annualYield;
      simulatedPrice *= 1 + annualGrowth;

      if (simulatedPrice <= 0) {
        simulatedShares = 0;
        simulatedDividends = 0;
        break;
      }

      simulatedShares += dividendCash / simulatedPrice;
      simulatedDividends += dividendCash;
    }

    endingDripShares = simulatedShares;
    totalReinvestedDividends = simulatedDividends;
    endingDripValue = simulatedShares * simulatedPrice;
    endingAnnualDividendIncome = simulatedShares * simulatedPrice * annualYield;
    dripNewShares = simulatedShares - initialShares;
  }

  const activeCalculatorDefinition =
    calculatorDefinitions.find((calculator) => calculator.id === selectedCalculator) ??
    calculatorDefinitions[0];

  function handleSelectCalculator(calculatorId: CalculatorId) {
    setSelectedCalculator(calculatorId);
    setIsDrawerOpen(false);
  }

  function renderSelectedCalculator() {
    switch (selectedCalculator) {
      case "dividend":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Estimate how much income a position can generate and what yield that payout represents at the current share price."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Share price"
                  prefix="$"
                  value={dividendForm.sharePrice}
                  onChange={(value) =>
                    setDividendForm((current) => ({ ...current, sharePrice: value }))
                  }
                  min="0"
                />
                <NumberField
                  label="Annual dividend per share"
                  prefix="$"
                  value={dividendForm.annualDividend}
                  onChange={(value) =>
                    setDividendForm((current) => ({
                      ...current,
                      annualDividend: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Shares owned"
                  value={dividendForm.shares}
                  onChange={(value) =>
                    setDividendForm((current) => ({ ...current, shares: value }))
                  }
                  min="0"
                  step="0.0001"
                  hint="Use fractional shares if your brokerage supports them."
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Dividend yield"
                    value={formatPlainPercent(dividendYield)}
                  />
                  <ResultTile
                    label="Annual income"
                    value={formatCurrency(annualIncome)}
                  />
                  <ResultTile
                    label="Quarterly income"
                    value={formatCurrency(quarterlyIncome)}
                  />
                  <ResultTile
                    label="Monthly income"
                    value={formatCurrency(monthlyIncome)}
                  />
                </div>
                <ResultTile
                  label="Estimated position cost"
                  value={formatCurrency(dividendPositionCost)}
                  hint="Share price multiplied by the number of shares entered."
                />
              </>
            }
          />
        );
      case "cost-basis":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Blend your current position and a new buy to see how much the average cost moves before you place the order."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Current shares"
                  value={costBasisForm.currentShares}
                  onChange={(value) =>
                    setCostBasisForm((current) => ({
                      ...current,
                      currentShares: value,
                    }))
                  }
                  min="0"
                  step="0.0001"
                />
                <NumberField
                  label="Current average cost"
                  prefix="$"
                  value={costBasisForm.averageCost}
                  onChange={(value) =>
                    setCostBasisForm((current) => ({
                      ...current,
                      averageCost: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Shares to buy"
                  value={costBasisForm.sharesToBuy}
                  onChange={(value) =>
                    setCostBasisForm((current) => ({
                      ...current,
                      sharesToBuy: value,
                    }))
                  }
                  min="0"
                  step="0.0001"
                />
                <NumberField
                  label="Purchase price"
                  prefix="$"
                  value={costBasisForm.purchasePrice}
                  onChange={(value) =>
                    setCostBasisForm((current) => ({
                      ...current,
                      purchasePrice: value,
                    }))
                  }
                  min="0"
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Existing capital"
                    value={formatCurrency(existingCost)}
                  />
                  <ResultTile
                    label="New capital"
                    value={formatCurrency(addedCapital)}
                  />
                  <ResultTile
                    label="Total shares"
                    value={formatPlainNumber(totalShares, 4)}
                  />
                  <ResultTile
                    label="New average cost"
                    value={formatCurrency(blendedCostBasis)}
                  />
                </div>
                <ResultTile
                  label="Cost basis change"
                  value={formatSignedCurrency(basisChange)}
                  hint="Compared with your current average cost."
                  valueClassName={
                    typeof basisChange === "number"
                      ? basisChange <= 0
                        ? "text-success"
                        : "text-warning"
                      : undefined
                  }
                />
              </>
            }
          />
        );
      case "position-size":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Set a maximum dollar loss for the trade, then size shares against the distance between entry and stop."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            alertMessage={positionSizeAlert}
            fields={
              <>
                <NumberField
                  label="Account size"
                  prefix="$"
                  value={positionSizeForm.accountSize}
                  onChange={(value) =>
                    setPositionSizeForm((current) => ({
                      ...current,
                      accountSize: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Risk per trade"
                  value={positionSizeForm.riskPercent}
                  onChange={(value) =>
                    setPositionSizeForm((current) => ({
                      ...current,
                      riskPercent: value,
                    }))
                  }
                  suffix="%"
                  min="0"
                />
                <NumberField
                  label="Entry price"
                  prefix="$"
                  value={positionSizeForm.entryPrice}
                  onChange={(value) =>
                    setPositionSizeForm((current) => ({
                      ...current,
                      entryPrice: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Stop price"
                  prefix="$"
                  value={positionSizeForm.stopPrice}
                  onChange={(value) =>
                    setPositionSizeForm((current) => ({
                      ...current,
                      stopPrice: value,
                    }))
                  }
                  min="0"
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Risk budget"
                    value={formatCurrency(riskBudget)}
                  />
                  <ResultTile
                    label="Risk per share"
                    value={formatCurrency(riskPerShare)}
                  />
                  <ResultTile
                    label="Max whole shares"
                    value={formatPlainNumber(maxWholeShares, 0)}
                  />
                  <ResultTile
                    label="Fractional share size"
                    value={formatPlainNumber(fractionalShares, 2)}
                  />
                  <ResultTile
                    label="Position value"
                    value={formatCurrency(positionValue)}
                  />
                  <ResultTile
                    label="Account allocation"
                    value={formatPlainPercent(allocationPercent)}
                  />
                </div>
                <ResultTile
                  label="Stop distance"
                  value={formatPlainPercent(stopDistancePercent)}
                  hint="Percentage move between entry and stop price."
                />
              </>
            }
          />
        );
      case "compound-growth":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Project how steady contributions and compounding can grow a portfolio over time."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Initial investment"
                  prefix="$"
                  value={compoundGrowthForm.initialInvestment}
                  onChange={(value) =>
                    setCompoundGrowthForm((current) => ({
                      ...current,
                      initialInvestment: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Monthly contribution"
                  prefix="$"
                  value={compoundGrowthForm.monthlyContribution}
                  onChange={(value) =>
                    setCompoundGrowthForm((current) => ({
                      ...current,
                      monthlyContribution: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Annual return"
                  value={compoundGrowthForm.annualReturn}
                  onChange={(value) =>
                    setCompoundGrowthForm((current) => ({
                      ...current,
                      annualReturn: value,
                    }))
                  }
                  suffix="%"
                  step="0.1"
                />
                <NumberField
                  label="Years"
                  value={compoundGrowthForm.years}
                  onChange={(value) =>
                    setCompoundGrowthForm((current) => ({ ...current, years: value }))
                  }
                  min="0"
                  step="1"
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Future value"
                    value={formatCurrency(compoundFutureValue)}
                  />
                  <ResultTile
                    label="Total contributed"
                    value={formatCurrency(totalContributions)}
                  />
                  <ResultTile
                    label="Growth earned"
                    value={formatSignedCurrency(compoundGrowth)}
                    valueClassName={
                      typeof compoundGrowth === "number" && compoundGrowth >= 0
                        ? "text-success"
                        : undefined
                    }
                  />
                  <ResultTile
                    label="Portfolio multiple"
                    value={formatMultiple(portfolioMultiple)}
                  />
                </div>
                <ResultTile
                  label="Projection window"
                  value={
                    typeof compoundMonths === "number"
                      ? `${compoundMonths} months`
                      : "--"
                  }
                  hint="Months are derived from the years field."
                />
              </>
            }
          />
        );
      case "profit-loss":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Estimate the net outcome of a trade using position size, entry, exit, and total fees."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Shares"
                  value={profitLossForm.shares}
                  onChange={(value) =>
                    setProfitLossForm((current) => ({ ...current, shares: value }))
                  }
                  min="0"
                  step="0.0001"
                />
                <NumberField
                  label="Entry price"
                  prefix="$"
                  value={profitLossForm.entryPrice}
                  onChange={(value) =>
                    setProfitLossForm((current) => ({
                      ...current,
                      entryPrice: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Exit price"
                  prefix="$"
                  value={profitLossForm.exitPrice}
                  onChange={(value) =>
                    setProfitLossForm((current) => ({
                      ...current,
                      exitPrice: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Total fees"
                  prefix="$"
                  value={profitLossForm.fees}
                  onChange={(value) =>
                    setProfitLossForm((current) => ({ ...current, fees: value }))
                  }
                  min="0"
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Position cost"
                    value={formatCurrency(grossCost)}
                  />
                  <ResultTile
                    label="Net proceeds"
                    value={formatCurrency(netProceeds)}
                  />
                  <ResultTile
                    label="Net profit / loss"
                    value={formatSignedCurrency(netProfitLoss)}
                    valueClassName={
                      typeof netProfitLoss === "number"
                        ? netProfitLoss >= 0
                          ? "text-success"
                          : "text-error"
                        : undefined
                    }
                  />
                  <ResultTile
                    label="Return"
                    value={formatPercent(tradeReturnPercent)}
                    valueClassName={
                      typeof tradeReturnPercent === "number"
                        ? tradeReturnPercent >= 0
                          ? "text-success"
                          : "text-error"
                        : undefined
                    }
                  />
                </div>
                <ResultTile
                  label="Break-even exit"
                  value={formatCurrency(breakEvenExit)}
                  hint="Exit price needed to cover the total fees entered."
                />
              </>
            }
          />
        );
      case "break-even":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Check how far a position has fallen and the gain required from the current price to get back to even."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Entry price"
                  prefix="$"
                  value={breakEvenForm.entryPrice}
                  onChange={(value) =>
                    setBreakEvenForm((current) => ({
                      ...current,
                      entryPrice: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Current price"
                  prefix="$"
                  value={breakEvenForm.currentPrice}
                  onChange={(value) =>
                    setBreakEvenForm((current) => ({
                      ...current,
                      currentPrice: value,
                    }))
                  }
                  min="0"
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Drawdown"
                    value={formatPercent(drawdownPercent)}
                    valueClassName={
                      typeof drawdownPercent === "number"
                        ? drawdownPercent >= 0
                          ? "text-success"
                          : "text-error"
                        : undefined
                    }
                  />
                  <ResultTile
                    label="Gain needed"
                    value={formatPlainPercent(requiredGainPercent)}
                  />
                  <ResultTile
                    label="Recovery gap"
                    value={formatCurrency(recoveryGap)}
                  />
                  <ResultTile
                    label="Break-even target"
                    value={formatCurrency(breakEvenEntryPrice)}
                  />
                </div>
                <ResultTile
                  label="Status"
                  value={
                    typeof requiredGainPercent === "number" && requiredGainPercent === 0
                      ? "Already at or above break-even"
                      : "Below break-even"
                  }
                  hint="Break-even is based on price only and does not include fees or dividends."
                />
              </>
            }
          />
        );
      case "reinvestment":
        return (
          <CalculatorPanel
            eyebrow={activeCalculatorDefinition.eyebrow}
            title={activeCalculatorDefinition.title}
            description="Model a simple dividend reinvestment strategy to see how share count and income can compound over time."
            note={activeCalculatorDefinition.note}
            icon={activeCalculatorDefinition.icon}
            fields={
              <>
                <NumberField
                  label="Initial investment"
                  prefix="$"
                  value={reinvestmentForm.initialInvestment}
                  onChange={(value) =>
                    setReinvestmentForm((current) => ({
                      ...current,
                      initialInvestment: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Share price"
                  prefix="$"
                  value={reinvestmentForm.sharePrice}
                  onChange={(value) =>
                    setReinvestmentForm((current) => ({
                      ...current,
                      sharePrice: value,
                    }))
                  }
                  min="0"
                />
                <NumberField
                  label="Dividend yield"
                  value={reinvestmentForm.dividendYield}
                  onChange={(value) =>
                    setReinvestmentForm((current) => ({
                      ...current,
                      dividendYield: value,
                    }))
                  }
                  suffix="%"
                  min="0"
                />
                <NumberField
                  label="Annual price growth"
                  value={reinvestmentForm.annualPriceGrowth}
                  onChange={(value) =>
                    setReinvestmentForm((current) => ({
                      ...current,
                      annualPriceGrowth: value,
                    }))
                  }
                  suffix="%"
                  step="0.1"
                />
                <NumberField
                  label="Years"
                  value={reinvestmentForm.years}
                  onChange={(value) =>
                    setReinvestmentForm((current) => ({ ...current, years: value }))
                  }
                  min="0"
                  step="1"
                  hint="Years are rounded to whole years for the reinvestment loop."
                />
              </>
            }
            results={
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultTile
                    label="Ending value"
                    value={formatCurrency(endingDripValue)}
                  />
                  <ResultTile
                    label="Ending annual income"
                    value={formatCurrency(endingAnnualDividendIncome)}
                  />
                  <ResultTile
                    label="Reinvested dividends"
                    value={formatCurrency(totalReinvestedDividends)}
                  />
                  <ResultTile
                    label="Ending shares"
                    value={formatPlainNumber(endingDripShares, 4)}
                  />
                </div>
                <ResultTile
                  label="New shares from DRIP"
                  value={formatPlainNumber(dripNewShares, 4)}
                  hint="Additional shares created from reinvested dividends over the full period."
                />
              </>
            }
          />
        );
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <Calculator className="h-4 w-4" />
            Calculator workspace
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
              Run the numbers before you place the trade.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
              {firstName}, use quick stock calculators for yield, cost basis,
              risk, compounding, and trade planning. Everything updates live in
              the browser and nothing from these tools is saved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="btn btn-outline rounded-full px-6 lg:hidden"
          >
            <PanelLeft className="h-4 w-4" />
            Choose calculator
          </button>
          <Link href="/dashboard" className="btn btn-ghost rounded-full px-6">
            Wishlist
          </Link>
          <Link
            href="/paper-money"
            className="btn btn-outline rounded-full px-6"
          >
            Paper Money
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)] lg:items-start">
        <aside className="hidden lg:block lg:min-w-0">
          <CalculatorSidebar
            selectedCalculator={selectedCalculator}
            onSelect={handleSelectCalculator}
          />
        </aside>

        <div className="min-w-0">{renderSelectedCalculator()}</div>
      </div>

      {isDrawerOpen ? (
        <div
          className="fixed inset-0 z-50 bg-neutral/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-[88vw] max-w-sm p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-ghost btn-circle border border-base-300/60 bg-base-100/85"
                aria-label="Close calculators drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CalculatorSidebar
              selectedCalculator={selectedCalculator}
              onSelect={handleSelectCalculator}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}