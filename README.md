# SEATS — Standby subscription MVP

Phase 1 is a responsive React + TypeScript frontend prototype for airline-authorised standby discovery. The IDR–DEL inventory, dates, fares, seat counts, and membership price are illustrative demo data only. No airline integration, booking, ticketing, login, or payment processing is present.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The date search filters the demo route examples; it never checks live availability.

## Build and lint

```sh
npm run build
npm run lint
```

## Project structure

```text
src/
  components/  Reusable navigation, search, branding, and flight card UI
  data/        Isolated fictional demo route and inventory
  types/       Shared TypeScript interfaces
  App.tsx      Page composition and local demo date filtering
  index.css    Tailwind base plus responsive design system
  main.tsx     React entry point
```

Tailwind CSS 3.4 is configured with PostCSS and works with the Vite 5 toolchain. The interface uses custom CSS for its visual styling and Tailwind's base reset/utilities pipeline.
