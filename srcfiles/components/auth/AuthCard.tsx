import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Centered card used by login, register and forgot-password. */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="bg-surface py-10 sm:py-16">
      <Container>
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-8">
            <div className="mb-1 h-1 w-12 rounded-full bg-gold-500" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
          {footer ? <p className="mt-6 text-center text-sm text-navy-700">{footer}</p> : null}
        </div>
      </Container>
    </section>
  );
}
