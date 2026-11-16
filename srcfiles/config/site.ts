export const siteConfig = {
  name: "Capital Car Sharing",
  shortName: "Capital",
  description:
    "Rent verified cars from vetted owners and fleet partners, or list your own vehicle and earn when it's parked.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** ISO 4217 code used by formatPrice(). Change once the launch market is decided. */
  currency: "USD",
  locale: "en-US",
  /** IANA time zone the branches operate in. Used for "now" when validating pickup times. */
  timeZone: "UTC",
  /** Placeholder contact details. Replace before launch. */
  contact: {
    email: "hello@capitalcarsharing.example",
    phone: "+00 000 000 0000",
    hours: "Daily, 8am to 10pm",
  },
} as const;

export type NavItem = { label: string; href: string };

/**
 * Cars is a real route now. Partners and About are still landing-page anchors;
 * point them at their routes when those pages exist.
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Partners", href: "/#partners" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Rent a car",
    links: [
      { label: "Browse cars", href: "/cars" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Driver verification", href: "/#how-it-works" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "List your car", href: "/#partners" },
      { label: "Partner benefits", href: "/#partners" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];
