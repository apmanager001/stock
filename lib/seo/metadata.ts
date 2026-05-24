import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

const gaIdPattern = /^G-[A-Z0-9]+$/i;
const gaPlaceholderId = "G-XXXXXXXXXX";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function getSiteUrl() {
  return new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000",
  );
}

export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function getGoogleAnalyticsId() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return gaId && gaId !== gaPlaceholderId && gaIdPattern.test(gaId)
    ? gaId
    : null;
}

export function getGoogleSiteVerification() {
  const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return verification || null;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}