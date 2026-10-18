'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { categories, faqs, articles } from '@/lib/help/content';

// ─── Search filter ────────────────────────────────────────────────────────────

function useSearch(query: string) {
  return useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { matchedArticles: articles, matchedFaqs: faqs, isSearching: false };
    return {
      matchedArticles: articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      ),
      matchedFaqs: faqs.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      ),
      isSearching: true,
    };
  }, [query]);
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex flex-wrap gap-y-2 items-center justify-between py-4 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <p className="text-sm text-slate-600 leading-relaxed pb-5 pr-8">{answer}</p>
      )}
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ slug, title, summary, tags }: { slug: string; title: string; summary: string; tags: string[] }) {
  return (
    <Link
      href={`/help/${slug}`}
      className="group block bg-white rounded-xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-md transition-all"
    >
      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">
        {title}
      </h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{summary}</p>
      <div className="flex items-center gap-1 flex-wrap">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[12px] md:text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto text-xs font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Read <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const { matchedArticles, matchedFaqs, isSearching } = useSearch(query);
  const hasResults = matchedArticles.length > 0 || matchedFaqs.length > 0;

  const toggleFaq = (key: string) => setOpenFaq((prev) => (prev === key ? null : key));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500">
        {/* Subtle dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-4">
            Help Center
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            How can we help?
          </h1>
          <p className="text-blue-100 mb-10 text-lg">
            Search articles, FAQs, and guides across all SORMALITICS features.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search e.g. EMP201, invoice VAT, team permissions…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenFaq(null);
              }}
              className="w-full pl-12 pr-5 py-4 bg-white text-slate-800 placeholder-slate-400 rounded-2xl shadow-xl shadow-blue-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20"
            />
          </div>
        </div>
      </section>

      {/* ── Category grid — hidden while searching ── */}
      {!isSearching && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Browse by topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="group flex flex-col gap-3 bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {cat.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{cat.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                    View articles <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Search results ── */}
      {isSearching && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {hasResults ? (
              <div className="space-y-10">
                {matchedFaqs.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-4">
                      FAQs{' '}
                      <span className="text-slate-400 font-normal text-sm">
                        ({matchedFaqs.length})
                      </span>
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-100 px-6 divide-y divide-slate-100">
                      {matchedFaqs.map((faq) => {
                        const key = `search-${faq.question}`;
                        return (
                          <FaqItem
                            key={key}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openFaq === key}
                            onToggle={() => toggleFaq(key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {matchedArticles.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-4">
                      Articles{' '}
                      <span className="text-slate-400 font-normal text-sm">
                        ({matchedArticles.length})
                      </span>
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchedArticles.map((a) => (
                        <ArticleCard key={a.slug} {...a} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Try different keywords — e.g.{' '}
                  <button
                    onClick={() => setQuery('EMP201')}
                    className="text-blue-600 hover:underline"
                  >
                    EMP201
                  </button>
                  ,{' '}
                  <button
                    onClick={() => setQuery('VAT')}
                    className="text-blue-600 hover:underline"
                  >
                    VAT
                  </button>
                  , or{' '}
                  <button
                    onClick={() => setQuery('payroll')}
                    className="text-blue-600 hover:underline"
                  >
                    payroll
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FAQ accordion — shown when not searching ── */}
      {!isSearching && (
        <section className="py-14 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Frequently asked questions</h2>
            <p className="text-sm text-slate-500 mb-8">
              Grouped by topic. Click any question to expand the answer.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const catFaqs = faqs.filter((f) => f.categorySlug === cat.slug);
                return (
                  <div key={cat.slug} className="bg-white rounded-2xl border border-slate-100 px-6 py-2">
                    <div className="flex items-center gap-2 py-4 border-b border-slate-100 mb-1">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {cat.title}
                      </span>
                    </div>
                    {catFaqs.map((faq) => {
                      const key = `faq-${cat.slug}-${faq.question}`;
                      return (
                        <FaqItem
                          key={key}
                          question={faq.question}
                          answer={faq.answer}
                          isOpen={openFaq === key}
                          onToggle={() => toggleFaq(key)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse articles — shown when not searching ── */}
      {!isSearching && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-slate-800 mb-8">Browse all articles</h2>

            <div className="space-y-12">
              {categories.map((cat) => {
                const catArticles = articles.filter((a) => a.categorySlug === cat.slug);
                if (!catArticles.length) return null;
                return (
                  <div key={cat.slug} id={cat.slug}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="text-base font-bold text-slate-800">{cat.title}</h3>
                      <span className="text-xs text-slate-400">
                        {catArticles.length} article{catArticles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catArticles.map((a) => (
                        <ArticleCard key={a.slug} {...a} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Still need help CTA ── */}
      <section className="py-14 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 rounded-3xl p-10 text-center text-white relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
              <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto">
                Our team typically responds within 24 hours on the Free plan, and within 4 hours on
                Business. Enterprise customers get an SLA-backed response.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex flex-wrap items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg shadow-blue-900/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact support
                </Link>
                <a
                  href="mailto:support@sormalitics.com"
                  className="inline-flex flex-wrap items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  support@sormalitics.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
