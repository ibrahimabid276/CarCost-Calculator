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
  {
    slug: "petrol-diesel-hybrid-electric-running-cost-differences",
    title: "Petrol vs Diesel vs Hybrid vs Electric: Running Cost Differences",
    description:
      "How fuel type changes your running costs — economy, price per unit, and what actually drives the difference between them.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Fuel type is usually the single biggest lever on a car&apos;s
          running cost, because it changes two numbers at once: how much
          you&apos;re paying per unit, and how far a unit takes you.
        </p>

        <h2 className={proseH2}>Petrol</h2>
        <p className={proseP}>
          The most common choice, with the widest range of available
          vehicles. Petrol engines are generally cheaper to service than
          diesel or hybrid drivetrains, but typically return lower fuel
          economy than a comparable diesel.
        </p>

        <h2 className={proseH2}>Diesel</h2>
        <p className={proseP}>
          Diesel engines usually return meaningfully better fuel economy
          (more kilometers per liter) than petrol, which can offset a higher
          per-liter diesel price — especially for high-mileage driving.
          Diesel vehicles are less common in the passenger car segment in
          Pakistan than in trucks/SUVs, and maintenance can involve different
          service intervals and part costs.
        </p>

        <h2 className={proseH2}>Hybrid</h2>
        <p className={proseP}>
          Hybrids combine a petrol engine with an electric motor and battery,
          typically returning noticeably better fuel economy than an
          equivalent petrol-only car, especially in stop-start city driving.
          The trade-off is usually a higher purchase price and, in some
          cases, specialized maintenance for the hybrid battery system over
          the vehicle&apos;s life.
        </p>

        <h2 className={proseH2}>Electric</h2>
        <p className={proseP}>
          Electric vehicles replace fuel cost with electricity cost,
          calculated differently: energy consumption (kWh per 100km) instead
          of fuel economy, and electricity tariff instead of fuel price. See{" "}
          <a href="/guides/electric-vehicle-ownership-cost-pakistan" className="text-moss underline">
            our EV-specific guide
          </a>{" "}
          for how this changes the calculation.
        </p>

        <h2 className={proseH2}>Why you can&apos;t compare fuel types on price alone</h2>
        <p className={proseP}>
          A lower price at the pump doesn&apos;t automatically mean lower
          running cost — economy matters just as much. This is exactly why
          the{" "}
          <a href="/calculator" className="text-moss underline">
            calculator
          </a>{" "}
          asks for your fuel type separately from your driving habits: the
          two numbers only mean something combined.
        </p>
      </>
    ),
  },
  {
    slug: "how-car-maintenance-costs-are-estimated",
    title: "How Car Maintenance Costs Are Estimated (and Why They're Estimates)",
    description:
      "Why maintenance can't be an exact number, what actually drives it, and how this calculator arrives at a reasonable figure.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Unlike fuel cost, which follows a clean formula, maintenance cost
          genuinely varies — by driving conditions, service provider, part
          availability, and how well a car has been looked after. Any tool
          that gives you an exact-sounding maintenance figure without
          acknowledging this is oversimplifying.
        </p>

        <h2 className={proseH2}>What actually drives maintenance cost</h2>
        <ul className={proseUl}>
          <li>Make and model — some vehicles have cheaper, more available parts than others.</li>
          <li>Age and mileage — older, higher-mileage cars typically need more frequent attention.</li>
          <li>Where you service it — authorized dealerships generally cost more than independent mechanics.</li>
          <li>Driving conditions — stop-start city traffic wears a car differently than highway driving.</li>
        </ul>

        <h2 className={proseH2}>How this calculator handles it</h2>
        <p className={proseP}>
          Maintenance is estimated using current market information for your
          specific make and model rather than a flat guess, and it&apos;s
          clearly labeled as an estimate rather than a guaranteed number. If
          you already know your actual maintenance cost — from your own
          service history — you can enter it manually and the calculator
          will use your number instead.
        </p>

        <p className={proseP}>
          Treat the maintenance line as a reasonable planning figure, not a
          quote from a mechanic.
        </p>
      </>
    ),
  },
  {
    slug: "should-you-include-insurance-when-comparing-cars",
    title: "Should You Include Insurance When Comparing Cars?",
    description:
      "Why insurance is optional in this calculator's comparisons, and when it makes sense to turn it on or off.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Insurance is one of the most variable costs in car ownership —
          the same car can carry very different premiums depending on the
          provider, coverage type, your driving history and how the vehicle
          is used. Because of that, this calculator lets you switch insurance
          on or off when comparing cars, rather than forcing one assumption
          on everyone.
        </p>

        <h2 className={proseH2}>When to leave it off</h2>
        <p className={proseP}>
          If you&apos;re early in deciding between cars and haven&apos;t
          gotten insurance quotes yet, comparing without insurance isolates
          the costs that are more predictable — fuel, maintenance and
          government charges — so you&apos;re not comparing two guesses
          against each other.
        </p>

        <h2 className={proseH2}>When to turn it on</h2>
        <p className={proseP}>
          Once you have a real quote, or want a fuller picture of monthly
          cost, including insurance gives you a more complete comparison —
          just remember the insurance figure is itself an estimate unless
          you&apos;ve entered your own quoted amount.
        </p>

        <p className={proseP}>
          Try both ways on the{" "}
          <a href="/compare" className="text-moss underline">
            Compare Cars
          </a>{" "}
          page and see how much it changes the ranking — sometimes it does,
          sometimes it doesn&apos;t.
        </p>
      </>
    ),
  },
  {
    slug: "car-financing-101-loan-payments-and-real-ownership-cost",
    title: "Car Financing 101: How Loan Payments Affect Real Ownership Cost",
    description:
      "How down payment, interest rate and loan term change your monthly installment, and why financing belongs in your ownership cost.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          If you&apos;re financing a car rather than buying it outright, the
          monthly installment is just as real a cost as fuel or maintenance
          — it&apos;s money leaving your pocket every month because of the
          car, which is exactly why it&apos;s included in total ownership
          cost here.
        </p>

        <h2 className={proseH2}>The three levers</h2>
        <ul className={proseUl}>
          <li>
            <strong>Down payment:</strong> a larger down payment reduces the
            amount you&apos;re borrowing, which directly lowers the monthly
            installment.
          </li>
          <li>
            <strong>Interest / profit rate:</strong> a higher rate increases
            the total cost of borrowing, raising your installment for the
            same loan amount and term.
          </li>
          <li>
            <strong>Loan term:</strong> a longer term lowers the monthly
            installment but usually increases the total amount you pay over
            the life of the loan.
          </li>
        </ul>

        <h2 className={proseH2}>Why this matters for comparing cars</h2>
        <p className={proseP}>
          Two cars with similar cash prices can end up with very different
          monthly costs once financing terms differ. If you&apos;re
          comparing financed options, it&apos;s worth running the same down
          payment and term assumptions across each car so the comparison is
          fair — the{" "}
          <a href="/calculator" className="text-moss underline">
            calculator
          </a>{" "}
          lets you enter these details directly.
        </p>
      </>
    ),
  },
  {
    slug: "electric-vehicle-ownership-cost-pakistan",
    title: "Electric Vehicle Ownership Cost in Pakistan: What's Different",
    description:
      "How EV running costs are calculated differently from petrol or diesel — energy consumption, electricity tariffs and charging losses.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Electric vehicles are calculated on a different basis than fuel
          vehicles, because the underlying inputs are genuinely different.
        </p>

        <h2 className={proseH2}>Energy consumption instead of fuel economy</h2>
        <p className={proseP}>
          Rather than kilometers per liter, EVs are measured in kWh per
          100km — how much electrical energy the vehicle uses to cover that
          distance. A lower kWh/100km figure means a more efficient vehicle,
          the same way a higher km/L figure means a more efficient petrol
          car.
        </p>

        <h2 className={proseH2}>Electricity tariff instead of fuel price</h2>
        <p className={proseP}>
          Instead of a per-liter fuel price, the relevant number is your
          electricity price per unit (kWh). This can vary by province,
          provider and consumption tier, so it&apos;s worth checking your own
          electricity bill for an accurate rate if you&apos;re charging
          primarily at home.
        </p>

        <h2 className={proseH2}>Charging losses</h2>
        <p className={proseP}>
          Not all the electricity that goes into charging ends up as usable
          range — some is lost as heat during charging. This calculator
          accounts for that with a charging-loss assumption, so the
          estimated electricity cost reflects what you&apos;d actually pay,
          not just the theoretical minimum.
        </p>

        <h2 className={proseH2}>Government incentives</h2>
        <p className={proseP}>
          Some locations offer registration or tax incentives for electric
          vehicles. Where the calculator finds evidence of this during its
          search, it will flag it — but incentive availability changes, so
          it&apos;s worth verifying current EV policy with your local excise
          &amp; taxation office before assuming a specific discount applies.
        </p>
      </>
    ),
  },
  {
    slug: "how-to-use-compare-cars-to-choose-between-two-vehicles",
    title: "How to Use Compare Cars to Choose Between Two Vehicles",
    description:
      "A practical walkthrough of the Compare Cars feature, and how to read the results when deciding between vehicles.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Comparing two or three cars side by side is often more useful than
          calculating them one at a time, because it&apos;s easier to see
          exactly where the cost difference actually comes from.
        </p>

        <h2 className={proseH2}>Keep the driving profile the same</h2>
        <p className={proseP}>
          The comparison tool applies the same daily distance, driving days
          and location to every car in the comparison, so the numbers are
          genuinely comparable — the difference in the results comes from
          the cars, not from different assumptions being applied to each
          one.
        </p>

        <h2 className={proseH2}>Look past the total</h2>
        <p className={proseP}>
          The cheapest car overall might still be more expensive to fuel, if
          it makes up for that with lower maintenance or government charges.
          Check the breakdown for each car, not just the bottom-line monthly
          number, to understand why one car comes out ahead.
        </p>

        <h2 className={proseH2}>Toggle insurance to stress-test the ranking</h2>
        <p className={proseP}>
          Since insurance premiums can vary a lot between vehicles, try
          comparing with insurance both included and excluded. If the
          ranking changes, that tells you the decision is more sensitive to
          insurance than to the car&apos;s inherent running cost — useful to
          know before you commit.
        </p>

        <p className={proseP}>
          Ready to try it?{" "}
          <a href="/compare" className="text-moss underline">
            Compare Cars
          </a>{" "}
          now.
        </p>
      </>
    ),
  },
  {
    slug: "hidden-costs-of-car-ownership-people-forget",
    title: "Hidden Costs of Car Ownership People Often Forget",
    description:
      "Real costs beyond fuel and the sticker price that are easy to overlook when budgeting for a car — and which ones this calculator does and doesn't cover.",
    publishedDate: "2026-08-10",
    body: (
      <>
        <p className={proseP}>
          Most people budget for a car based on its price and a rough sense
          of fuel cost. A few real costs tend to get missed entirely — some
          of which this calculator covers, and some of which are worth
          knowing about even though they fall outside a monthly running-cost
          estimate.
        </p>

        <h2 className={proseH2}>Covered by this calculator</h2>
        <ul className={proseUl}>
          <li>Annual recurring token/road tax, separate from one-time registration.</li>
          <li>Maintenance, estimated from current market data for your specific vehicle.</li>
          <li>Financing installments, if you&apos;re paying on a loan.</li>
          <li>Insurance, if you choose to include it.</li>
        </ul>

        <h2 className={proseH2}>Worth knowing, but not part of this estimate</h2>
        <ul className={proseUl}>
          <li>
            <strong>Depreciation</strong> — the vehicle&apos;s resale value
            drop over time is a real cost of ownership, but it&apos;s a
            separate calculation from ongoing running cost, and highly
            specific to condition, mileage and market demand at resale time.
          </li>
          <li>
            <strong>Unplanned repairs</strong> — maintenance estimates cover
            typical scheduled service, not an unexpected major repair.
          </li>
          <li>
            <strong>Parking and tolls</strong> — can add up meaningfully
            depending on where and how you drive, but vary too much by
            individual routine to estimate generically.
          </li>
        </ul>

        <p className={proseP}>
          None of this means the calculator&apos;s numbers are wrong — it
          means they answer a specific question (your running/ownership
          cost) rather than every possible cost a car can involve. Worth
          keeping in mind when you&apos;re budgeting overall, not just
          comparing monthly costs between cars.
        </p>
      </>
    ),
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
