'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { type Locale } from '@/i18n/config';

interface Props {
  post: any;
  translation: any;
  relatedPosts: any[];
  locale: string;
}

export default function BlogPostContent({ post, translation, relatedPosts, locale }: Props) {
  const t = useTranslations('blog');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current!.querySelectorAll('.reveal'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[] = [];
    let inTable = false;
    let listItems: React.ReactNode[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-4 space-y-1">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(renderTable(tableRows, elements.length));
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(
          <h2 key={`h-${i}`} className="reveal text-title font-bold mt-10 mb-4"
            style={{ color: 'var(--color-primary-700)' }}>
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(
          <h3 key={`h3-${i}`} className="reveal font-semibold text-lg mt-6 mb-3"
            style={{ color: 'var(--color-text-primary)' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={`li-${i}`} className="ml-5" style={{ color: 'var(--color-text-secondary)', listStyleType: 'disc' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('- ', '')) }} />
          </li>
        );
      } else if (trimmed.startsWith('|')) {
        flushList();
        inTable = true;
        tableRows.push(trimmed);
      } else if (trimmed === '') {
        // skip
      } else {
        flushList();
        flushTable();
        elements.push(
          <p key={`p-${i}`} className="reveal mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          </p>
        );
      }
    });

    flushList();
    flushTable();
    return elements;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[300px]">
        <Image src={post.coverImage} alt={translation.title} fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute inset-0 flex items-end">
          <div className="container-main pb-12">
            <p className="text-label mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {post.date}
            </p>
            <h1 className="text-headline font-bold text-white max-w-3xl">
              {translation.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            <article ref={contentRef} className="prose-blog">
              <p className="reveal text-body-lg mb-8" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                {translation.excerpt}
              </p>
              {renderContent(translation.content)}
            </article>

            {/* Sidebar */}
            <aside>
              <div className="sticky top-24">
                <Link href={`/${locale}/blog`}
                  className="reveal inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors"
                  style={{ color: 'var(--color-primary-600)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-700)'; }}>
                  ← {t('backToBlog')}
                </Link>

                <div className="reveal p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {t('relatedPosts')}
                  </h4>
                  <div className="space-y-4">
                    {relatedPosts.map((rp) => {
                      const rt = rp.translations[locale as Locale] || rp.translations['en'];
                      return (
                        <Link key={rp.slug} href={`/${locale}/blog/${rp.slug}`}
                          className="block group">
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                            <Image src={rp.coverImage} alt={rt.title} fill className="object-cover" />
                          </div>
                          <p className="text-sm font-medium transition-colors group-hover:text-[var(--color-primary-600)]"
                            style={{ color: 'var(--color-text-primary)' }}>
                            {rt.title}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text-primary)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderTable(rows: string[], key: number): React.ReactNode {
  if (rows.length < 2) return null;
  const headers = rows[0].split('|').map((h) => h.trim()).filter(Boolean);
  const dataRows = rows.slice(2).filter((r) => !r.includes('---'));

  return (
    <div key={`table-${key}`} className="reveal overflow-x-auto mb-6">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-primary-400)' }}>
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => {
            const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
            return (
              <tr key={ri} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {cells.map((c, ci) => (
                  <td key={ci} className="py-2 px-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {c}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
