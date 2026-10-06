# Capital Car Sharing: architecture

Phase 1 is the project structure and the marketing landing page. There is no backend, authentication, booking logic, payments or API yet. This document records where each of those pieces goes so they can be added without moving existing code.

## Folder map

```
src/
  app/                      Routes only (Next.js App Router). Keep pages thin.
    (marketing)/            Public site: landing page now; cars, partners, about, contact later
    (auth)/                 Sign in, sign up, password reset
    (customer)/dashboard/   Customer dashboard: trips, documents, payment methods
    (partner)/partner/      Partner dashboard: listings, calendar, earnings
    (admin)/admin/          Admin dashboard: verification queue, users, bookings, payouts
    api/v1/                 Versioned route handlers, shared by the web app and the future mobile app
  components/
    ui/                     Generic building blocks (Button, Container, icons)
    layout/                 Navbar, Footer, Logo, later dashboard shells
    cars/                   Car-specific UI (CarCard, CarIllustration)
    marketing/              Landing page sections
  features/                 Domain logic, one folder per feature (see below)
  services/                 API client and data access used by pages and features
  hooks/                    Shared React hooks
  lib/                      Pure helpers (cn, formatPrice)
  config/                   Site settings, navigation
  data/                     Placeholder data until the backend exists
  types/                    Shared TypeScript types (Car, later Booking, User)
```

Route groups such as `(customer)` do not appear in the URL, so each area can have its own layout (navigation, auth guard) without changing paths: `/dashboard`, `/partner`, `/admin`.

## Where each planned feature lives

| Feature | Folder | Notes |
| --- | --- | --- |
| Customer, Partner, Admin dashboards | `app/(customer)`, `app/(partner)`, `app/(admin)` | Each group gets its own `layout.tsx` with a sidebar shell from `components/layout`. |
| Authentication and roles | `features/auth`, `app/(auth)` | Roles: customer, partner, admin. Enforce them in each group's layout and in `api/v1`. |
| Booking system | `features/bookings` | Search, quote, create, cancel. The landing page search card calls this later. |
| Online verification | `features/verification` | Licence and ID upload, review status, admin review queue. |
| Payments | `features/payments` | Provider integration behind one interface so the provider can change. |
| Availability calendar | `features/availability` | Owner-managed calendars; the search query reads from here. |
| Cars and listings | `features/cars`, `features/partners` | Listing creation, photos, pricing rules. |
| Admin tools | `features/admin` | Cross-cutting views: users, disputes, payouts. |
| Mobile app API | `app/api/v1` | Keep handlers thin and call into `features/*`, so web and mobile share one code path. |

## Conventions

- Pages in `app/` compose components and call into `features/`; they hold no business logic.
- Each feature folder owns its components, server actions, validation and types. Share only through `types/` and `components/ui`.
- Replace `src/data/*` with calls from `src/services/*` when the backend lands. Components keep the same props.
- Currency and locale come from `config/site.ts`. Change them there.
- Contact details in `config/site.ts` are placeholders.

## Design tokens

Defined in `tailwind.config.ts`.

| Token | Value | Use |
| --- | --- | --- |
| `navy-900` | `#0B1B33` | Primary: navbar, hero, partner section, headings |
| `white` | `#FFFFFF` | Secondary: page background, cards |
| `gold-500` | `#C9A24B` | Accent: primary buttons, rules, highlights on navy |
| `gold-700` | `#856521` | Gold text or icons on white (meets contrast) |
| `surface` | `#F3F5F9` | Alternate section background |

Fonts are Bricolage Grotesque (headings) and Figtree (body), bundled through `@fontsource-variable` so builds need no network access to Google Fonts.
