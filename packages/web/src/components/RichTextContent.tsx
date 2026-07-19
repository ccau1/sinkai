'use client';

import React from 'react';

interface LexicalNode {
  type?: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
  url?: string;
  [key: string]: unknown;
}

interface LexicalRoot {
  root: {
    children?: LexicalNode[];
  };
}

function renderNode(node: LexicalNode, key: string): React.ReactNode {
  if (node.type === 'text') {
    let content: React.ReactNode = node.text || '';
    if (node.format && typeof node.format === 'number') {
      if (node.format & 1) content = <strong>{content}</strong>;
      if (node.format & 2) content = <em>{content}</em>;
      if (node.format & 8) content = <u>{content}</u>;
    }
    return <span key={key}>{content}</span>;
  }

  if (node.type === 'paragraph') {
    return (
      <p key={key} className="text-body mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
        {node.children?.map((child, i) => renderNode(child, `${key}-${i}`))}
      </p>
    );
  }

  if (node.type === 'heading' && node.tag) {
    const Tag = node.tag as keyof React.JSX.IntrinsicElements;
    return (
      <Tag key={key} className="text-title font-bold mb-4 mt-8" style={{ color: 'var(--color-text-primary)' }}>
        {node.children?.map((child, i) => renderNode(child, `${key}-${i}`))}
      </Tag>
    );
  }

  if (node.type === 'list') {
    const Tag = node.tag === 'ol' ? 'ol' : 'ul';
    return (
      <Tag key={key} className="list-disc pl-6 mb-4 space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
        {node.children?.map((child, i) => renderNode(child, `${key}-${i}`))}
      </Tag>
    );
  }

  if (node.type === 'listitem') {
    return (
      <li key={key}>
        {node.children?.map((child, i) => renderNode(child, `${key}-${i}`))}
      </li>
    );
  }

  if (node.type === 'link' && node.url) {
    return (
      <a key={key} href={node.url} className="underline" style={{ color: 'var(--color-primary-600)' }}>
        {node.children?.map((child, i) => renderNode(child, `${key}-${i}`))}
      </a>
    );
  }

  if (node.children) {
    return <span key={key}>{node.children.map((child, i) => renderNode(child, `${key}-${i}`))}</span>;
  }

  return null;
}

interface RichTextContentProps {
  content: unknown;
  className?: string;
}

export default function RichTextContent({ content, className }: RichTextContentProps) {
  if (!content || typeof content !== 'object' || !('root' in (content as object))) {
    return null;
  }

  const root = (content as LexicalRoot).root;
  return (
    <div className={className}>
      {root.children?.map((node, i) => renderNode(node, `node-${i}`))}
    </div>
  );
}
