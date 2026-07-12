# 32 Princess Renovation Dashboard

A live project dashboard for **32 Princess St, Orangeville, ON** — combining the two PDFs:
- `ryes-renovation-todo.pdf` — 21-item sequenced to-do list
- `32-princess-renovation-remaining-costs.pdf` — 27-line material cost workbook

## Features

- **Overview tab** — animated budget summary with low/high/actual columns and a spend-position marker on the range; stage-by-stage progress bars.
- **Costs tab** — live editable table grouped by category. Click the pencil on any row to log the **actual** amount, purchase date, vendor, and notes. Search across items, vendors, categories. Add or delete lines freely.
- **Tasks tab** — 21 jobs from the to-do list, grouped by stage. Click the dot to cycle status (`Not started → In progress → Blocked → Done`). Free-text owner, target date, expandable editor.
- **Persistence** — saves to `localStorage` automatically, plus a share-link that encodes the full state in the URL hash so anyone you send it to sees the same view.
- **Export / Import** — download the full dashboard state as JSON for backup or transfer between devices.
- **Animations** — Framer Motion throughout: gradient title, layoutId tab pill, spring popovers, animated counters, progress bars.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion 12 · lucide-react.

## Data model

- TBD/Open rows in the cost doc (`HVAC`, `Roof`, the three `Misc` placeholders) are kept visible and labeled, but excluded from subtotals exactly as the source PDF treats them.
- Statuses cycle in order: `not_started → in_progress → blocked → done`.
- Owner field is free-text — the seed uses the names from the PDFs but you can put anything.

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

## Deployment

Designed for Vercel. Push the repo and import, or:

```bash
vercel --prod
```

## Notes

Data is per-browser (localStorage). For cross-device sync use the **Share link** button to copy a URL containing the encoded dashboard state, or **Export JSON** to download a snapshot.
