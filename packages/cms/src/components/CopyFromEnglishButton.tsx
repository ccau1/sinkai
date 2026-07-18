'use client'

import { useForm } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import React, { useCallback } from 'react'

type CopyFromEnglishButtonProps = UIFieldClientProps & {
  targetSuffix: string
  fieldBases: string[]
}

export const CopyFromEnglishButton: React.FC<CopyFromEnglishButtonProps> = ({
  targetSuffix,
  fieldBases,
}) => {
  const { dispatchFields, getDataByPath, setModified } = useForm()

  const handleCopy = useCallback(() => {
    for (const base of fieldBases) {
      const sourcePath = `${base}En`
      const targetPath = `${base}${targetSuffix}`
      const value = getDataByPath(sourcePath)
      if (value !== undefined && value !== null) {
        dispatchFields({
          type: 'UPDATE',
          path: targetPath,
          value,
        })
      }
    }
    setModified(true)
  }, [dispatchFields, getDataByPath, setModified, targetSuffix, fieldBases])

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={handleCopy}
        type="button"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--theme-elevation-100, #f3f3f3)',
          border: '1px solid var(--theme-elevation-200, #e1e1e1)',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Copy from English
      </button>
    </div>
  )
}
