import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Verified cars, trusted owners`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#0B1B33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
