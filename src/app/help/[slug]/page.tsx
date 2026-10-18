import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { articles, categories } from '@/lib/help/content';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: 'Article Not Found — SORMALITICS Help' };
  return {
    // `absolute` skips the root "%s | SORMALITICS" template (the title already
    // ends in "SORMALITICS Help"); the canonical is set here so the article does
    // not inherit /help from help/layout.tsx.
    title: { absolute: `${article.title} — SORMALITICS Help` },
    description: article.summary,
    alternates: { canonical: `/help/${slug}` },
    openGraph: {
      title: `${article.title} — SORMALITICS Help`,
      description: article.summary,
      type: 'article',
      url: `/help/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const category = categories.find((c) => c.slug === article.categorySlug);

  // Related articles: same category, excluding current
  const related = articles
    .filter((a) => a.categorySlug === article.categorySlug && a.slug !== article.slug)
    .slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-4 gap-10">

        {/* ── Article body ── */}
        <article className="lg:col-span-3">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
            <Link href="/help" className="hover:text-blue-600 transition-colors">
              Help Center
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/help#${category.slug}`} className="hover:text-blue-600 transition-colors">
                  {category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-600 truncate">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            {category && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{category.icon}</span>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {category.title}
                </span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">{article.summary}</p>
          </header>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-blue-100 via-teal-100 to-transparent mb-10" />

          {/* Body */}
          <div className="prose prose-slate max-w-none space-y-5">
            {article.body.map((paragraph, i) => (
              <p key={i} className="text-slate-700 leading-7 text-base">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center gap-3 flex-wrap">
              <Tag className="w-4 h-4 text-slate-300 flex-shrink-0" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-y-2 items-center justify-between">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-1 space-y-6">

          {/* Related articles */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Related articles
              </h3>
              <div className="space-y-3">
                {related.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/help/${a.slug}`}
                    className="group flex items-start gap-3"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 mt-0.5 flex-shrink-0 transition-colors" />
                    <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors leading-snug">
                      {a.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Browse by category */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              All topics
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/help#${cat.slug}`}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                    cat.slug === article.categorySlug
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Still need help */}
          <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl p-5 text-white">
            <h3 className="text-sm font-bold mb-2">Still need help?</h3>
            <p className="text-xs text-blue-100 mb-4 leading-relaxed">
              Our support team is ready to assist with any questions not covered here.
            </p>
            <Link
              href="/contact"
              className="block text-center bg-white text-blue-700 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact support
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
