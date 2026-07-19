import type { CollectionAfterChangeHook } from 'payload'
import type { Form, SubmissionValue } from '@payloadcms/plugin-form-builder/types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contact@sinkai.org'
const DEFAULT_NOTIFICATION_EMAIL = process.env.CONTACT_EMAIL_TO || 'calvin@tribalorigin.com'

interface ContactSettingsDoc {
  fromEmail?: string
  notificationEmail?: string
}

function getFieldValue(
  submissionData: SubmissionValue[] | undefined,
  fieldName: string,
): string | undefined {
  const entry = submissionData?.find((item) => item.field === fieldName)
  if (!entry) return undefined
  const value = entry.value
  if (value === null || value === undefined) return undefined
  return String(value).trim() || undefined
}

export const sendContactSubmissionEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  if (!RESEND_API_KEY) {
    req.payload.logger.info(
      '[sendContactSubmissionEmail] RESEND_API_KEY not set; skipping contact email notification.',
    )
    return doc
  }

  let form: Form | undefined
  const formRef = doc.form

  try {
    if (typeof formRef === 'string' || typeof formRef === 'number') {
      form = (await req.payload.findByID({
        collection: 'forms',
        id: formRef,
        depth: 0,
        req,
      })) as unknown as Form
    } else if (formRef && typeof formRef === 'object') {
      form = formRef as unknown as Form
    }
  } catch (err) {
    req.payload.logger.error(
      { err },
      '[sendContactSubmissionEmail] Failed to resolve form for submission; skipping email.',
    )
    return doc
  }

  if (!form || (form.title ?? '').toLowerCase() !== 'contact') {
    return doc
  }

  let settings: ContactSettingsDoc = {}
  try {
    settings = (await req.payload.findGlobal({
      slug: 'contact-settings',
      overrideAccess: true,
      req,
    })) as unknown as ContactSettingsDoc
  } catch (err) {
    req.payload.logger.warn(
      { err },
      '[sendContactSubmissionEmail] Could not load contact-settings global; using env defaults.',
    )
  }

  const fromEmail = settings.fromEmail || DEFAULT_FROM_EMAIL
  const toEmail = settings.notificationEmail || DEFAULT_NOTIFICATION_EMAIL

  const submissionData =
    Array.isArray(doc.submissionData) && doc.submissionData.length > 0 ? doc.submissionData : []

  const name = getFieldValue(submissionData, 'name') || 'Anonymous'
  const email = getFieldValue(submissionData, 'email')
  const phone = getFieldValue(submissionData, 'phone')
  const subject = getFieldValue(submissionData, 'subject') || 'New contact form submission'
  const message = getFieldValue(submissionData, 'message') || ''

  const textLines = [
    `New message from ${name} <${email || 'no email'}>`,
    phone ? `Phone: ${phone}` : null,
    `Subject: ${subject}`,
    '',
    message,
  ].filter(Boolean)

  const htmlBody = [
    '<p><strong>New contact form submission</strong></p>',
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : '',
    phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : '',
    `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
    '<hr/>',
    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  ].join('')

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Contact Form <${fromEmail}>`,
        to: toEmail,
        ...(email ? { reply_to: email } : {}),
        subject: `[Contact] ${subject}`,
        text: textLines.join('\n'),
        html: htmlBody,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      req.payload.logger.error(
        { status: response.status, body },
        '[sendContactSubmissionEmail] Resend API returned an error.',
      )
    } else {
      req.payload.logger.info(
        '[sendContactSubmissionEmail] Contact notification email sent successfully.',
      )
    }
  } catch (err) {
    req.payload.logger.error(
      { err },
      '[sendContactSubmissionEmail] Failed to send contact notification email.',
    )
  }

  return doc
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
