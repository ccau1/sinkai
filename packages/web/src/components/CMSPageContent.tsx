'use client';

import React from 'react';
import type { CMSPage } from '@/lib/cms';
import RichTextContent from './RichTextContent';

interface CMSPageContentProps {
  page: CMSPage;
}

export default function CMSPageContent({ page }: CMSPageContentProps) {
  return (
    <div>
      <section className="section text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              {page.excerpt}
            </p>
          )}
        </div>
      </section>

      {Boolean(page.content && typeof page.content === 'object' && 'root' in page.content) && (
        <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
          <div className="container-main max-w-3xl">
            <RichTextContent content={page.content} />
          </div>
        </section>
      )}
    </div>
  );
}
