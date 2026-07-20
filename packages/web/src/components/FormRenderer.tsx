'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { CMSForm, CMSFormField, CMSFormUploadField } from '@/lib/cms';
import RichTextContent from '@/components/RichTextContent';

interface FormRendererProps {
  form: CMSForm;
}

const inputClassName =
  'w-full text-sm py-3 bg-transparent outline-none transition-colors disabled:opacity-50';

const inputStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
};

export default function FormRenderer({ form }: FormRendererProps) {
  const t = useTranslations('forms');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleFilesChange = (fieldName: string, selected: File[]) => {
    setFiles((prev) => ({ ...prev, [fieldName]: selected }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    // Honeypot: if the hidden field is filled, silently "succeed" without sending.
    const honeypot = String(formData.get('company') || '').trim();
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    const uploadFieldNames = new Set(
      (form.fields || [])
        .filter((f): f is CMSFormUploadField => f.blockType === 'upload')
        .map((f) => f.name),
    );

    const submissionData: { field: string; value: string }[] = [];
    for (const field of form.fields || []) {
      if (field.blockType === 'message' || field.blockType === 'upload') continue;

      const name = field.name;
      if (field.blockType === 'checkbox') {
        const checked = formData.get(name) === 'true';
        submissionData.push({ field: name, value: String(checked) });
      } else {
        const value = formData.get(name);
        submissionData.push({ field: name, value: value === null ? '' : String(value) });
      }
    }

    try {
      const base = (process.env.NEXT_PUBLIC_CMS_API_URL || '').replace(/\/$/, '');
      if (!base) {
        throw new Error('NEXT_PUBLIC_CMS_API_URL is not configured');
      }

      let body: FormData | string;
      const headers: Record<string, string> = {};

      if (uploadFieldNames.size > 0) {
        body = new FormData();
        body.append('_payload', JSON.stringify({ form: form.id, submissionData }));
        for (const name of uploadFieldNames) {
          for (const file of files[name] || []) {
            body.append(name, file);
          }
        }
      } else {
        body = JSON.stringify({ form: form.id, submissionData });
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${base}/api/form-submissions`, {
        method: 'POST',
        headers,
        body,
      });

      if (!res.ok) {
        throw new Error(`Submission failed: ${res.status}`);
      }

      if (form.confirmationType === 'redirect' && form.redirect?.url) {
        window.location.assign(form.redirect.url);
        return;
      }

      setSubmitted(true);
      formEl.reset();
    } catch (err) {
      console.error('Form submission failed:', err);
      setError(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-6 rounded-xl text-center"
        style={{ backgroundColor: 'var(--color-primary-50)' }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3
          className="text-title font-semibold mt-4 mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('successTitle')}
        </h3>
        {form.confirmationType === 'message' && !!form.confirmationMessage && (
          <div className="max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
            <RichTextContent content={form.confirmationMessage} />
          </div>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {form.fields?.map((field, index) => (
        <FieldInput
          key={field.id || `field-${index}`}
          field={field}
          disabled={submitting}
          onFilesChange={handleFilesChange}
        />
      ))}

      {/* Honeypot field */}
      <div className="absolute opacity-0 -z-10" aria-hidden="true">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-error, #dc2626)' }}>
          {error}
        </p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? t('sending') : form.submitButtonLabel || t('submit')}
        </button>
      </div>
    </form>
  );
}

const MAX_UPLOAD_FILES = 2;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function formatAccept(mimeTypes?: CMSFormUploadField['mimeTypes']): string {
  if (!mimeTypes || mimeTypes.length === 0) return 'image/*';
  return mimeTypes.map((m) => m.mimeType).join(',');
}

function UploadFieldInput({
  field,
  disabled,
  onChange,
}: {
  field: CMSFormUploadField;
  disabled?: boolean;
  onChange: (files: File[]) => void;
}) {
  const t = useTranslations('forms');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = field.maxFileSize || DEFAULT_MAX_FILE_SIZE;
  const accept = formatAccept(field.mimeTypes);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const chosen = Array.from(e.target.files || []);
    if (chosen.length > MAX_UPLOAD_FILES) {
      setError(t('fileTooMany', { max: MAX_UPLOAD_FILES }));
      onChange(chosen.slice(0, MAX_UPLOAD_FILES));
      return;
    }
    const oversized = chosen.find((file) => file.size > maxFileSize);
    if (oversized) {
      const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      setError(t('fileTooLarge', { name: oversized.name, sizeMB }));
      onChange(chosen.filter((file) => file.size <= maxFileSize));
      return;
    }
    onChange(chosen);
  };

  const labelText = field.label || field.name;

  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {labelText}
        {field.required && <span style={{ color: 'var(--color-primary-500)' }}> *</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        name={field.name}
        accept={accept}
        multiple={!!field.multiple}
        disabled={disabled}
        onChange={handleChange}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
        style={{ color: 'var(--color-text-secondary)' }}
      />
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('uploadHint', { max: MAX_UPLOAD_FILES, sizeMB: (maxFileSize / (1024 * 1024)).toFixed(0) })}
      </p>
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-error, #dc2626)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

function FieldInput({
  field,
  disabled,
  onFilesChange,
}: {
  field: CMSFormField;
  disabled: boolean;
  onFilesChange?: (name: string, files: File[]) => void;
}) {
  const t = useTranslations('forms');

  if (field.blockType === 'message') {
    return (
      <div className="py-2">
        <RichTextContent content={field.message} />
      </div>
    );
  }

  const labelText = field.label || field.name;
  const required = !!field.required;

  const label = (
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {labelText}
      {required && <span style={{ color: 'var(--color-primary-500)' }}> *</span>}
    </label>
  );

  switch (field.blockType) {
    case 'textarea':
      return (
        <div>
          {label}
          <textarea
            name={field.name}
            defaultValue={field.defaultValue || ''}
            required={required}
            rows={4}
            disabled={disabled}
            suppressHydrationWarning
            className={`${inputClassName} resize-y`}
            style={{ ...inputStyle, minHeight: '120px' }}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          {label}
          <select
            name={field.name}
            defaultValue={field.defaultValue || ''}
            required={required}
            disabled={disabled}
            suppressHydrationWarning
            className={inputClassName}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          >
            {!field.defaultValue && (
              <option value="" disabled>
                {field.placeholder || t('selectPlaceholder')}
              </option>
            )}
            {field.options?.map((option) => (
              <option key={option.id || option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name={field.name}
            value="true"
            defaultChecked={!!field.defaultValue}
            required={required}
            disabled={disabled}
            className="mt-1 h-4 w-4"
          />
          <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {labelText}
            {required && <span style={{ color: 'var(--color-primary-500)' }}> *</span>}
          </label>
        </div>
      );

    case 'number':
      return (
        <div>
          {label}
          <input
            type="number"
            name={field.name}
            defaultValue={field.defaultValue ?? ''}
            required={required}
            disabled={disabled}
            suppressHydrationWarning
            className={inputClassName}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          />
        </div>
      );

    case 'email':
      return (
        <div>
          {label}
          <input
            type="email"
            name={field.name}
            required={required}
            disabled={disabled}
            suppressHydrationWarning
            className={inputClassName}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          />
        </div>
      );

    case 'country':
    case 'state':
      return (
        <div>
          {label}
          <input
            type="text"
            name={field.name}
            required={required}
            disabled={disabled}
            suppressHydrationWarning
            className={inputClassName}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          />
        </div>
      );

    case 'upload':
      return (
        <UploadFieldInput
          field={field as CMSFormUploadField}
          disabled={disabled}
          onChange={(selected) => onFilesChange?.(field.name, selected)}
        />
      );

    case 'text':
    default:
      return (
        <div>
          {label}
          <input
            type="text"
            name={field.name}
            defaultValue={field.defaultValue || ''}
            required={required}
            disabled={disabled}
            suppressHydrationWarning
            className={inputClassName}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-border)';
            }}
          />
        </div>
      );
  }
}
