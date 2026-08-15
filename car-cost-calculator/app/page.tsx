import Link from "next/link";
import Image from "next/image";

const whatWeCalculate = [
  { label: "Fuel", detail: "Monthly & annual, from real economy figures" },
  { label: "Maintenance", detail: "Service costs sourced from the market" },
  { label: "Insurance", detail: "Typical annual premiums for your vehicle" },
  { label: "Registration", detail: "Token tax & government charges" },
  { label: "Financing", detail: "Installment cost if you're on a loan" },
  { label: "Cost per KM", detail: "The number that cuts through everything" },
  { label: "3-Year Cost", detail: "What this car costs you by year three" },
  { label: "5-Year Cost", detail: "The long view, before you commit" },
];

const steps = [
  { n: "01", title: "Enter your car", body: "Make, model, variant, engine and fuel type." },
  { n: "02", title: "Tell us how you drive", body: "Daily distance and driving days per month." },
  { n: "03", title: "We research current costs", body: "Live web search for fuel, maintenance, insurance and tax." },
  { n: "04", title: "Get your breakdown", body: "A full ownership report with sources, not guesses." },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(47,93,80,0.08),transparent_60%)]" />
        <div className="container-page pt-20 pb-24 sm:pt-28 sm:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm tracking-wide uppercase text-moss font-medium mb-5 animate-fadeUp">
              Real ownership cost, not a fuel calculator
            </p>
            <h1 className="text-4xl sm:text-6xl font-display font-semibold leading-[1.05] max-w-3xl animate-fadeUp [animation-delay:80ms]">
              What does your car <span className="italic text-rust">really</span> cost you?
            </h1>
            <p className="mt-6 text-lg text-ink/70 max-w-xl animate-fadeUp [animation-delay:160ms]">
              Calculate your monthly, yearly and long-term ownership costs — fuel,
              maintenance, insurance, registration and financing — using your
              driving habits and current market data.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fadeUp [animation-delay:240ms]">
              <Link href="/calculator" className="btn-primary">
                Calculate My Car Cost
              </Link>
              <Link href="/compare" className="btn-secondary">
                Compare Cars
              </Link>
            </div>
          </div>
          <div className="animate-fadeUp [animation-delay:200ms]">
            <Image
              src="/logo-full.png"
              alt="CarCost Calculator — Know the real cost. Drive smarter."
              width={1471}
              height={979}
              className="w-full h-auto max-w-lg mx-auto lg:max-w-none"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20 border-b border-black/5 dark:border-white/10">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <span className="font-mono text-xs text-brass">{s.n}</span>
              <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we calculate */}
      <section className="container-page py-20 border-b border-black/5 dark:border-white/10">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-10">
          What we calculate
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whatWeCalculate.map((item) => (
            <div key={item.label} className="rounded-xl2 border border-black/5 p-5 bg-white/60 dark:border-white/10 dark:bg-white/5">
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1.5 text-sm text-ink/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compare cars teaser */}
      <section className="container-page py-20 border-b border-black/5 dark:border-white/10">
        <div className="card p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-display font-semibold">Compare cars side by side</h2>
            <p className="mt-2 text-ink/60 max-w-lg">
              Corolla vs Civic vs City — see fuel, maintenance, insurance and
              total ownership cost lined up, with the cheapest option highlighted.
            </p>
            <p className="mt-3 text-sm text-ink/50">
              Or skip straight to the{" "}
              <Link href="/leaderboard" className="text-moss underline">
                cheapest cars to own
              </Link>
              .
            </p>
          </div>
          <Link href="/compare" className="btn-primary whitespace-nowrap">
            Compare Cars
          </Link>
        </div>
      </section>

      {/* Guides teaser */}
      <section className="container-page py-20 border-b border-black/5 dark:border-white/10">
        <div className="card p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-display font-semibold">Understand the numbers first</h2>
            <p className="mt-2 text-ink/60 max-w-lg">
              Plain-language explainers on how car ownership cost, cost per
              kilometer and government charges actually work in Pakistan.
            </p>
          </div>
          <Link href="/guides" className="btn-primary whitespace-nowrap">
            Car Cost Guides
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container-page py-14">
        <p className="text-xs text-ink/40 max-w-2xl leading-relaxed">
          Estimates are based on user-provided information and available
          market/web data. Actual costs may vary depending on fuel prices,
          driving conditions, maintenance requirements, insurance provider,
          government charges and other factors.
        </p>
        <p className="mt-3 text-sm text-ink/50">
          New to this?{" "}
          <Link href="/guides/how-to-calculate-car-ownership-cost-pakistan" className="text-moss underline">
            Read how car ownership cost is calculated
          </Link>{" "}
          or see our full{" "}
          <Link href="/methodology" className="text-moss underline">
            methodology
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
