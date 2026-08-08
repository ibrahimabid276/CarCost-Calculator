# CarCost Calculator

Estimate the true cost of owning and running a car — fuel, maintenance,
insurance, registration/government charges and financing — using live web
research via the SerperDev search API.

## Tech stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS
- Recharts for the donut and projection charts
- SerperDev API for real-time market data (server-side only)

## How it works

1. The user fills in vehicle, location, driving and (optional) financing details.
2. The frontend calls `POST /api/car-cost`.
3. The server route validates the input, builds a handful of targeted search
   queries (fuel price, fuel economy, maintenance, insurance, registration),
   and calls SerperDev for each one **in parallel**.
4. The server extracts plausible numeric values from the search snippets,
   takes a median across results, and falls back to a clearly-labeled
   baseline estimate if search is unavailable or returns nothing usable.
5. The server computes the full ownership breakdown and returns structured
   JSON — the frontend never talks to SerperDev directly.

The `/compare` page runs the same pipeline once per vehicle (2–4 vehicles)
and renders a side-by-side comparison table with the cheapest option
highlighted.

## Getting started locally

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd car-cost-calculator

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.local.example .env.local
# then edit .env.local and set:
# SERPER_API_KEY=your_actual_key

# 4. Run the dev server
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this repository to GitHub (the `.env.local` file is gitignored —
   never commit your real API key).
2. Import the repository into Vercel.
3. In the Vercel project settings, go to **Environment Variables** and add:
   - `SERPER_API_KEY` = your SerperDev API key
4. Deploy. Vercel will build with `next build` and serve the API routes as
   serverless functions automatically.

## Security notes

- `SERPER_API_KEY` is only ever read inside server-side files (`lib/serper.ts`,
  called from `app/api/**/route.ts`). It is never imported into a client
  component and never exposed via `NEXT_PUBLIC_` variables.
- All API input is validated and sanitized in `lib/validation.ts` before use.
- A lightweight in-memory rate limiter protects the API routes from abuse.
  For real production traffic across multiple serverless instances, swap this
  for a shared store such as Upstash Redis.

## Project structure

```
car-cost-calculator/
├── app/
│   ├── page.tsx                # Homepage
│   ├── calculator/page.tsx      # Input form + progress + submit
│   ├── results/page.tsx         # Results dashboard
│   ├── compare/page.tsx         # Multi-car comparison
│   └── api/
│       ├── car-cost/route.ts
│       └── compare-cars/route.ts
├── components/
│   ├── CarForm.tsx
│   ├── CostBreakdown.tsx
│   ├── CostChart.tsx
│   ├── SearchProgress.tsx
│   ├── ComparisonTable.tsx
│   └── ResultsCard.tsx
├── lib/
│   ├── serper.ts                # SerperDev client (server-only)
│   ├── calculations.ts          # Estimation + cost math
│   └── validation.ts            # Input validation + rate limiting
├── types/car.ts
└── README.md
```

## Disclaimer

Estimates are based on user-provided information and available market/web
data. Actual costs may vary depending on fuel prices, driving conditions,
maintenance requirements, insurance provider, government charges and other
factors.
