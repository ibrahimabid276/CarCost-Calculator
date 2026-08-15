import { ReactNode } from "react";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  publishedDate: string; // ISO date — when this explainer article was written, not a market-data timestamp
  body: ReactNode;
}

const proseH2 = "mt-10 text-xl font-display font-semibold";
const proseP = "mt-3 text-ink/70 leading-relaxed";
const proseUl = "mt-3 space-y-2 text-ink/70 leading-relaxed list-disc pl-5";

export const GUIDES: Guide[] = [
  {
    slug: "how-to-calculate-car-ownership-cost-pakistan",
    title: "How to Calculate Car Ownership Cost in Pakistan",
    description:
      "A plain-language walkthrough of what actually goes into the real cost of owning a car in Pakistan — fuel, maintenance, insurance, government charges and financing.",
    publishedDate: "2026-08-01",
    body: (
      <>
        <p className={proseP}>
          Most people price a car by its sticker price and maybe a rough fuel
          estimate. That leaves out most of what a car actually costs to keep
          on the road. Car ownership cost is the full picture: everything you
          spend to own and run the vehicle over time, not just what you spend
          at the pump.
        </p>

        <h2 className={proseH2}>The five components</h2>
        <ul className={proseUl}>
          <li>
            <strong>Fuel (or electricity):</strong> your daily distance divided
            by the vehicle&apos;s fuel economy, multiplied by the current fuel
            price. Driving more or choosing a thirstier engine raises this
            directly.
          </li>
          <li>
            <strong>Maintenance:</strong> an estimate based on typical service
            costs for that make and model, since maintenance varies with
            driving conditions and the workshop you use.
          </li>
          <li>
            <strong>Insurance:</strong> optional, and only included if you
            choose to include it — some owners self-insure or already have a
            policy quote elsewhere.
          </li>
          <li>
            <strong>Government charges:</strong> split into a one-time
            registration fee (paid once) and an annual recurring token/road
            tax (paid every year). These are two different kinds of cost and
            shouldn&apos;t be added together as if they were the same thing.
          </li>
          <li>
            <strong>Financing:</strong> if you&apos;re paying for the car on a
            loan, the monthly installment is part of what it costs you to
            drive it — even though it&apos;s not a running cost in the same
            sense as fuel.
          </li>
        </ul>

        <h2 className={proseH2}>Why this matters when comparing cars</h2>
        <p className={proseP}>
          Two cars with a similar price tag can cost very differently to
          actually own. A car with worse fuel economy or a bigger engine
          (which usually means a higher annual token tax) can end up costing
          more per month than a pricier car that&apos;s cheaper to run. Looking
          at the full monthly ownership number — not just the purchase price —
          is what actually tells you what a car will cost you.
        </p>

        <p className={proseP}>
          You can run these numbers for your own car on the{" "}
          <a href="/calculator" className="text-moss underline">
            car cost calculator
          </a>
          , or line up two or three cars side by side on the{" "}
          <a href="/compare" className="text-moss underline">
            comparison page
          </a>
          .
        </p>
      </>
    ),
  },
  {
    slug: "car-cost-per-kilometer-explained",
    title: "Car Cost Per Kilometer, Explained",
    description:
      "What cost-per-kilometer actually measures, how it's calculated, and why it's often a better number to compare cars by than the sticker price.",
    publishedDate: "2026-08-01",
    body: (
      <>
        <p className={proseP}>
          Cost per kilometer answers a simple question: for every kilometer
          you drive, how much of your total ownership cost does that
          represent? It&apos;s calculated as your total annual ownership cost
          divided by your total annual kilometers driven.
        </p>

        <h2 className={proseH2}>Why it's useful</h2>
        <p className={proseP}>
          A car that costs more per month isn&apos;t necessarily more
          expensive to drive — it depends on how much you actually use it.
          Someone driving 30km a day and someone driving 80km a day will get
          very different value out of the same car. Cost per kilometer
          normalizes for that, so you can compare a low-mileage driver&apos;s
          situation against a high-mileage driver&apos;s on the same basis.
        </p>

        <h2 className={proseH2}>What affects it</h2>
        <ul className={proseUl}>
          <li>Fuel economy — a thirstier engine raises the fuel portion.</li>
          <li>
            How much you drive — fixed costs like insurance, registration and
            financing get spread over more kilometers if you drive more,
            which actually lowers your cost per km even though your total
            monthly cost is the same or higher.
          </li>
          <li>
            Whether you&apos;re financing the vehicle — a loan installment adds
            a fixed monthly cost regardless of how far you drive.
          </li>
        </ul>

        <p className={proseP}>
          You can see your own car&apos;s cost per kilometer on the{" "}
          <a href="/calculator" className="text-moss underline">
            calculator
          </a>{" "}
          — it&apos;s calculated automatically from your driving habits and the
          same cost breakdown used for the monthly and yearly totals.
        </p>
      </>
    ),
  },
  {
    slug: "car-registration-government-charges-pakistan",
    title: "Vehicle Registration & Government Charges in Pakistan",
    description:
      "The difference between one-time registration fees and annual token tax, and why they shouldn't be combined into a single monthly number.",
    publishedDate: "2026-08-01",
    body: (
      <>
        <p className={proseP}>
          Government-related vehicle costs in Pakistan generally fall into two
          separate categories, and mixing them up is one of the most common
          ways people miscalculate their real ownership cost.
        </p>

        <h2 className={proseH2}>One-time registration</h2>
        <p className={proseP}>
          This is paid once, when you first register the vehicle. It should
          never be divided by 12 and treated as a recurring monthly expense —
          it&apos;s a single upfront cost, similar in spirit to a down payment.
        </p>

        <h2 className={proseH2}>Annual recurring token tax</h2>
        <p className={proseP}>
          This is a yearly charge that recurs every year you own the vehicle,
          and it&apos;s the part that genuinely belongs in a monthly ownership
          estimate (divided across 12 months). Rates vary by province, engine
          size and vehicle value, and can change with local government policy
          — always something worth verifying with your local excise &amp;
          taxation office for an exact figure.
        </p>

        <h2 className={proseH2}>Why the calculator keeps them separate</h2>
        <p className={proseP}>
          The car cost calculator shows the one-time registration fee
          separately from the recurring annual charge, specifically so the
          monthly and yearly totals reflect only genuinely recurring costs.
          Folding a one-time fee into a monthly average would understate what
          you pay in year one and overstate every year after that.
        </p>

        <p className={proseP}>
          Run your own vehicle&apos;s numbers on the{" "}
          <a href="/calculator" className="text-moss underline">
            calculator
          </a>{" "}
          to see this breakdown for your specific car and location.
        </p>
      </>
    ),
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
