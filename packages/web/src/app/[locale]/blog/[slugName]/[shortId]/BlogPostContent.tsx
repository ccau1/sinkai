'use client';

import Link from 'next/link';
import Image from 'next/image';
import CmsImage from '@/components/CmsImage';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { CMSBlog, CMSMedia } from '@/lib/cms';
import { getBlogTitle, getBlogExcerpt, getBlogContent, getInstallationTitle, getMediaAlt } from '@/lib/cms';


interface Props {
  post: CMSBlog;
}

interface LexicalNode {
  type?: string
  children?: LexicalNode[]
  text?: string
  format?: number
  tag?: string
  url?: string
  alt?: string
  src?: string
  caption?: { root?: { children?: LexicalNode[] } }
  [key: string]: unknown
}

interface LexicalRoot {
  root: {
    children?: LexicalNode[]
  }
}

export default function BlogPostContent({ post }: Props) {
  const t = useTranslations('blog');
  const currentLocale = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const title = getBlogTitle(post);
  const excerpt = getBlogExcerpt(post);
  const content = getBlogContent(post);
  const coverUrl = post.coverImage?.url || '';

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

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setLightbox(null);
        if (e.key === 'ArrowLeft') setLightbox(prev => prev ? { ...prev, index: Math.max(0, prev.index - 1) } : null);
        if (e.key === 'ArrowRight') setLightbox(prev => prev ? { ...prev, index: Math.min(prev.images.length - 1, prev.index + 1) } : null);
      };
      document.addEventListener('keydown', handler);
      return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }
  }, [lightbox]);

  const renderContent = (content: unknown) => {
    if (typeof content === 'string') {
      return renderLegacyContent(content);
    }
    if (content && typeof content === 'object' && 'root' in content) {
      return renderLexicalContent(content as LexicalRoot);
    }
    return null;
  };

  const renderLegacyContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[] = [];
    let inTable = false;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-4 space-y-1">
            {listItems}
          </ul>
        );
        listItems = [];
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
        listItems.push(
          <li key={`li-${i}`} className="ml-5" style={{ color: 'var(--color-text-secondary)', listStyleType: 'disc' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('- ', '')) }} />
          </li>
        );
      } else if (trimmed.startsWith('|')) {
        flushList();
        inTable = true;
        tableRows.push(trimmed);
      } else if (trimmed.startsWith('![') && trimmed.includes('](')) {
        flushList();
        flushTable();
        const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, alt, src] = match;
          elements.push(
            <div key={`img-${i}`} className="reveal my-6 rounded-xl overflow-hidden">
              <CmsImage src={src} alt={alt} width={800} height={600} transformWidth={800} transformFormat="auto" transformQuality={85} className="w-full h-auto object-cover" />
              {alt && <p className="text-sm text-center mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{alt}</p>}
            </div>
          );
        }
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

  const renderLexicalContent = (rootNode: LexicalRoot) => {
    return <div className="reveal">{renderLexicalNodes(rootNode.root.children || [])}</div>;
  };

  const renderLexicalNodes = (nodes: LexicalNode[]): React.ReactNode[] => {
    return nodes.map((node, i) => renderLexicalNode(node, i));
  };

  const renderLexicalNode = (node: LexicalNode, i: number): React.ReactNode => {
    if (!node) return null;
    const key = `${node.type}-${i}`;

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={key} className="reveal mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {renderLexicalNodes(node.children || [])}
          </p>
        );
      case 'heading':
        const children = renderLexicalNodes(node.children || []);
        const headingClass = node.tag === 'h2'
          ? 'reveal text-title font-bold mt-10 mb-4'
          : 'reveal font-semibold text-lg mt-6 mb-3';
        const headingStyle = node.tag === 'h2'
          ? { color: 'var(--color-primary-700)' }
          : { color: 'var(--color-text-primary)' };
        if (node.tag === 'h2') {
          return <h2 key={key} className={headingClass} style={headingStyle}>{children}</h2>;
        }
        if (node.tag === 'h3') {
          return <h3 key={key} className={headingClass} style={headingStyle}>{children}</h3>;
        }
        return <h4 key={key} className={headingClass} style={headingStyle}>{children}</h4>;
      case 'list':
        const ListTag = node.listType === 'number' ? 'ol' : 'ul';
        return (
          <ListTag key={key} className="reveal mb-4 ml-5 space-y-1" style={{ color: 'var(--color-text-secondary)', listStyleType: node.listType === 'number' ? 'decimal' : 'disc' }}>
            {renderLexicalNodes(node.children || [])}
          </ListTag>
        );
      case 'listitem':
        return <li key={key}>{renderLexicalNodes(node.children || [])}</li>;
      case 'link':
        return (
          <a key={key} href={node.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--color-primary-600)' }}>
            {renderLexicalNodes(node.children || [])}
          </a>
        );
      case 'text': {
        let text: React.ReactNode = node.text;
        const format = node.format || 0;
        if (format & 1) text = <strong>{text}</strong>;
        if (format & 2) text = <em>{text}</em>;
        if (format & 4) text = <u>{text}</u>;
        if (format & 8) text = <s>{text}</s>;
        if (format & 16) text = <code>{text}</code>;
        return <span key={key}>{text}</span>;
      }
      case 'upload':
        if (!node.value) return null;
        const media = node.value as CMSMedia;
        return (
          <div key={key} className="reveal my-6 rounded-xl overflow-hidden">
            <CmsImage src={media.url || ''} alt={getMediaAlt(media)} width={800} height={600} transformWidth={800} transformFormat="auto" transformQuality={85} className="w-full h-auto object-cover" />
          </div>
        );
      default:
        if (node.children) {
          return <span key={key}>{renderLexicalNodes(node.children)}</span>;
        }
        return null;
    }
  };

  const renderTable = (rows: string[], keyOffset: number) => {
    const cells = rows.map(row =>
      row.split('|').map(c => c.trim()).filter(Boolean)
    );
    if (cells.length < 2) return null;
    const [header, ...body] = cells;
    return (
      <div key={`table-${keyOffset}`} className="reveal overflow-x-auto my-6">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid var(--color-border)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-surface)' }}>
              {header.map((h, i) => (
                <th key={i} className="p-3 text-left font-semibold" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.filter(row => !row.every(c => c.replace(/-/g, '').trim() === '')).map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci} className="p-3" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  };

  // Extract inline images from legacy/markdown content for lightbox
  const contentImages: string[] = [];
  if (typeof content === 'string') {
    const matches = content.matchAll(/!\[.*?\]\((.*?)\)/g);
    for (const match of matches) {
      contentImages.push(match[1]);
    }
  }

  const allImages = contentImages;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[300px]">
        <CmsImage src={coverUrl} alt={title} fill transformWidth={1200} transformFormat="auto" transformQuality={85} className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute inset-0 flex items-end">
          <div className="container-main pb-12">
            <p className="text-label mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {post.date}
            </p>
            <h1 className="text-headline font-bold text-white max-w-3xl">
              {title}
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
                {excerpt}
              </p>
              {renderContent(content)}

              {/* Installations */}
              {post.installations && post.installations.length > 0 && (
                <div className="reveal mt-10 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {t('relatedInstallations')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.installations.map((inst) => (
                      <Link
                        key={inst.id}
                        href={`/${currentLocale}/installations/#${inst.slug}`}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        {getInstallationTitle(inst)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <Link
                  href={`/${currentLocale}/blog/`}
                  className="inline-flex items-center gap-2 text-sm font-medium mb-6"
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  ← {t('backToBlog')}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl"
            onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: Math.max(0, prev.index - 1) } : null); }}
            aria-label="Previous"
          >
            ‹
          </button>
          <Image
            src={lightbox.images[lightbox.index]}
            alt=""
            width={1200}
            height={800}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl"
            onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: Math.min(prev.images.length - 1, prev.index + 1) } : null); }}
            aria-label="Next"
          >
            ›
          </button>
          <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
            {lightbox.index + 1} / {lightbox.images.length}
          </p>
        </div>
      )}
    </div>
  );
}
