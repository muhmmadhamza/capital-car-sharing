# Capital Car Sharing

A car sharing and rental platform. Phase 1 is the project structure and a responsive landing page. There is no backend, authentication, booking logic, payments or API yet.

Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run typecheck`.

## What's here

- Landing page: navbar, hero, search card, featured cars, how it works, why choose us, partner section, call to action, footer.
- Placeholder car data in `src/data/featured-cars.ts`. Cars are drawn as SVG illustrations until real photos exist.
- Empty, named folders for the Customer, Partner and Admin dashboards, bookings, verification, payments, availability and the mobile API.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the folder map and where each future feature goes.

## Before launch

- Replace the placeholder contact details and currency in `src/config/site.ts`.
- Replace the placeholder cars and illustrations with real listings and photos.
