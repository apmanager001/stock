export const siteConfig = {
  name: "Foundry Stack",
  shortName: "Foundry",
  creator: "Your Team",
  locale: "en_US",
  category: "technology",
  tagline:
    "Cloneable Next.js template with auth, analytics, and strong SEO already wired.",
  description:
    "A design-forward Next.js starter with DaisyUI, Better Auth, TanStack Query, MongoDB, Mongoose, Google Analytics, and strong SEO already organized.",
  keywords: [
    "Next.js template",
    "Better Auth starter",
    "MongoDB template",
    "Mongoose starter",
    "DaisyUI template",
    "TanStack Query starter",
    "Google Analytics Next.js",
    "SEO-ready Next.js app",
  ],
  nav: [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  footerLinks: [
    { href: "/", label: "Overview" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/login", label: "Sign in" },
    { href: "/register", label: "Create account" },
  ],
  stack: [
    "Next.js 16",
    "Tailwind 4",
    "DaisyUI 5",
    "Lucide React",
    "Better Auth",
    "TanStack Query",
    "MongoDB",
    "Mongoose",
  ],
} as const;
