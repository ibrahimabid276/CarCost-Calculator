import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guidesContent";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Guide not found" };

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      type: "article",
      publishedTime: guide.publishedDate,
    },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedDate,
    author: { "@type": "Person", name: "Syed Muhammad Ibrahim" },
    publisher: { "@type": "Organization", name: "CarCost Calculator" },
    mainEntityOfPage: `https://car-cost-calculator.site/guides/${guide.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://car-cost-calculator.site/guides" },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `https://car-cost-calculator.site/guides/${guide.slug}`,
      },
    ],
  };

  return (
    <main className="container-page py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/guides" className="text-sm text-ink/50 hover:text-ink">
        ← All guides
      </Link>
      <article className="mt-6 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">{guide.title}</h1>
        {guide.body}
      </article>

      <div className="mt-12 max-w-2xl border-t border-black/5 pt-6 dark:border-white/10">
        <p className="text-sm text-ink/50">More guides:</p>
        <ul className="mt-2 space-y-1">
          {GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="text-sm text-moss underline">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
