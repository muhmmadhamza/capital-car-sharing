import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Everything under /customer sits behind AuthGuard: dashboard, reservations,
 * reservation details and profile. Add new customer pages here and they are
 * protected automatically.
 */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-950"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="bg-surface">
        <Container className="py-8 lg:py-12">
          <AuthGuard>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <CustomerNav />
              <div className="min-w-0">{children}</div>
            </div>
          </AuthGuard>
        </Container>
      </main>
      <Footer />
    </>
  );
}
