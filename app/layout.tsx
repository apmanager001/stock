import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Manrope, Space_Grotesk } from "next/font/google";
import { GoogleAnalyticsWebVitals } from "@/components/analytics/google-web-vitals";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/lib/config/site";
import {
  getGoogleAnalyticsId,
  getGoogleSiteVerification,
  getSiteUrl,
} from "@/lib/seo/metadata";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const googleAnalyticsId = getGoogleAnalyticsId();
const googleSiteVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  category: siteConfig.category,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
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
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="cinder"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
    >
      <body className="min-h-screen bg-base-100 font-sans text-base-content">
        <AppProviders>
          {googleAnalyticsId ? <GoogleAnalyticsWebVitals /> : null}
          <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
            <div className="ambient-grid" />
            <div className="ambient-glow ambient-glow-primary" />
            <div className="ambient-glow ambient-glow-secondary" />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
      {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
    </html>
  );
}
