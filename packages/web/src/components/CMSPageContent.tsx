'use client';

import React from 'react';
import type { Data } from '@puckeditor/core';
import type { CMSPage } from '@/lib/cms';
import { PuckRenderer } from '@/puck/PuckRenderer';
import RichTextContent from './RichTextContent';

interface CMSPageContentProps {
  page: CMSPage;
}

function hasPuckData(data: unknown): data is Data {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'root' in (data as object) &&
      (data as { content?: unknown }).content !== undefined,
  );
}

export default function CMSPageContent({ page }: CMSPageContentProps) {
  const { title, excerpt, content, puckData } = page;

  if (hasPuckData(puckData)) {
    return <PuckRenderer data={puckData} />;
  }

  return (
    <div>
      <section className="section text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h1>
          {excerpt && (
            <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              {excerpt}
            </p>
          )}
        </div>
      </section>

      {Boolean(content && typeof content === 'object' && 'root' in content) && (
        <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
          <div className="container-main max-w-3xl">
            <RichTextContent content={content} />
          </div>
        </section>
      )}
    </div>
  );
}
