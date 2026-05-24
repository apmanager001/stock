"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useReportWebVitals } from "next/web-vitals";

const gaIdPattern = /^G-[A-Z0-9]+$/i;
const gaPlaceholderId = "G-XXXXXXXXXX";

export function GoogleAnalyticsWebVitals() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

  useReportWebVitals((metric) => {
    if (!gaId || gaId === gaPlaceholderId || !gaIdPattern.test(gaId)) {
      return;
    }

    sendGAEvent("event", "web_vital", {
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value:
        metric.name === "CLS"
          ? Math.round(metric.value * 1000)
          : Math.round(metric.value),
      metric_delta: Math.round(metric.delta),
      non_interaction: true,
    });
  });

  return null;
}
