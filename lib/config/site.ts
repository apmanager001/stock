export const siteConfig = {
  name: "TapeDeck",
  shortName: "TapeDeck",
  creator: "Your Team",
  locale: "en_US",
  category: "finance",
  tagline:
    "Track market movers, save a personal stock wishlist, and inspect charts plus news in one place.",
  description:
    "TapeDeck is a stock watchlist app built with Next.js, Better Auth, MongoDB, Mongoose, Yahoo Finance data, and a polished public market dashboard.",
  keywords: [
    "stock watchlist app",
    "Yahoo Finance Next.js",
    "MongoDB wishlist",
    "Better Auth stock app",
    "stock charts and news",
    "market movers dashboard",
  ],
  nav: [
    { href: "/", label: "Market" },
    { href: "/dashboard", label: "Wishlist" },
  ],
  footerLinks: [
    { href: "/", label: "Market" },
    { href: "/dashboard", label: "Wishlist" },
    { href: "/login", label: "Sign in" },
    { href: "/register", label: "Create account" },
  ],
  stack: [
    "Next.js 16",
    "React 19",
    "Tailwind 4",
    "DaisyUI 5",
    "Better Auth",
    "TanStack Query",
    "MongoDB",
    "Mongoose",
    "Yahoo Finance",
  ],
} as const;
