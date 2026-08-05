'use client'

import React from 'react'

import './AdminDocsAction.scss'

export default function AdminDocsAction() {
  return (
    <button
      aria-label="開啟管理員說明文件"
      className="admin-docs-action"
      onClick={() => window.open('/admin/docs', '_blank', 'noopener,noreferrer')}
      title="管理員說明文件"
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </button>
  )
}
