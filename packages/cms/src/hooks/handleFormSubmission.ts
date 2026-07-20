import type { CollectionAfterChangeHook } from 'payload'
import type { Form, FormSubmission, SubmissionValue } from '@payloadcms/plugin-form-builder/types'
import type { Donation } from '../payload-types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contact@sinkai.org'
const DEFAULT_NOTIFICATION_EMAIL = process.env.CONTACT_EMAIL_TO || 'calvin@tribalorigin.com'

interface ContactSettingsDoc {
  fromEmail?: string | null
  notificationEmail?: string | null
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

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

async function resolveForm(
  formRef: unknown,
  req: Parameters<CollectionAfterChangeHook>[0]['req'],
): Promise<Form | undefined> {
  try {
    if (typeof formRef === 'string' || typeof formRef === 'number') {
      return (await req.payload.findByID({
        collection: 'forms',
        id: formRef,
        depth: 0,
        req,
      })) as unknown as Form
    } else if (formRef && typeof formRef === 'object') {
      return formRef as Form
    }
  } catch (err) {
    req.payload.logger.error(
      { err },
      '[handleFormSubmission] Failed to resolve form for submission.',
    )
  }
  return undefined
}

async function loadContactSettings(
  req: Parameters<CollectionAfterChangeHook>[0]['req'],
): Promise<ContactSettingsDoc> {
  try {
    return (await req.payload.findGlobal({
      slug: 'contact-settings',
      overrideAccess: true,
      req,
    })) as unknown as ContactSettingsDoc
  } catch (err) {
    req.payload.logger.warn(
      { err },
      '[handleFormSubmission] Could not load contact-settings global; using env defaults.',
    )
    return {}
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function sendEmail(params: {
  from: string
  to: string
  replyTo?: string
  subject: string
  text: string
  html: string
  req: Parameters<CollectionAfterChangeHook>[0]['req']
}) {
  if (!RESEND_API_KEY) {
    params.req.payload.logger.info(
      '[handleFormSubmission] RESEND_API_KEY not set; skipping email notification.',
    )
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Resend API error ${response.status}: ${body}`)
    }
  } catch (err) {
    params.req.payload.logger.error({ err }, '[handleFormSubmission] Failed to send email.')
  }
}

async function handleContactSubmission(
  doc: Record<string, unknown>,
  req: Parameters<CollectionAfterChangeHook>[0]['req'],
) {
  const settings = await loadContactSettings(req)
  const fromEmail = settings.fromEmail || DEFAULT_FROM_EMAIL
  const toEmail = settings.notificationEmail || DEFAULT_NOTIFICATION_EMAIL

  const submissionData =
    (Array.isArray(doc.submissionData) ? doc.submissionData : []) as SubmissionValue[]

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

  await sendEmail({
    from: `Contact Form <${fromEmail}>`,
    to: toEmail,
    ...(email ? { replyTo: email } : {}),
    subject: `[Contact] ${subject}`,
    text: textLines.join('\n'),
    html: htmlBody,
    req,
  })
}

function getUploadIds(
  submissionDoc: FormSubmission,
  fieldName: string,
): (number | string)[] | undefined {
  const entry = submissionDoc.submissionUploads?.find((u) => u.field === fieldName)
  if (!entry?.value?.length) return undefined

  return entry.value
    .map((item) => {
      // The declared type is `number | string`, but with depth > 0 Payload may
      // return the populated document object instead of a bare ID.
      const raw: unknown = item.value
      if (typeof raw === 'number' || typeof raw === 'string') return raw
      if (raw && typeof raw === 'object' && 'id' in raw) {
        return (raw as { id: number | string }).id
      }
      return undefined
    })
    .filter((id): id is number | string => id !== undefined && id !== '')
}

async function handleDonationSubmission(
  doc: Record<string, unknown>,
  req: Parameters<CollectionAfterChangeHook>[0]['req'],
) {
  const submissionData =
    (Array.isArray(doc.submissionData) ? doc.submissionData : []) as SubmissionValue[]

  const name = getFieldValue(submissionData, 'name')
  const email = getFieldValue(submissionData, 'email')
  const phone = getFieldValue(submissionData, 'phone')
  const amount = parseNumber(getFieldValue(submissionData, 'amount'))
  const currency = getFieldValue(submissionData, 'currency') || 'HKD'
  const transferDate = getFieldValue(submissionData, 'transferDate')
  const paymentMethod = getFieldValue(submissionData, 'paymentMethod')
  const message = getFieldValue(submissionData, 'message')

  if (!name || amount === undefined) {
    req.payload.logger.warn(
      '[handleFormSubmission] Donation submission missing required fields; skipping donation record creation.',
    )
    return
  }

  const receiptIds = getUploadIds(doc as unknown as FormSubmission, 'receipt')

  let donation: Donation | undefined
  try {
    donation = (await req.payload.create({
      collection: 'donations',
      data: {
        name,
        email,
        phone,
        amount,
        currency,
        transferDate,
        paymentMethod,
        message,
        status: 'pending',
        ...(receiptIds?.length ? { receipts: receiptIds } : {}),
      },
      overrideAccess: true,
      req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as unknown as Donation
  } catch (err) {
    req.payload.logger.error({ err }, '[handleFormSubmission] Failed to create donation record.')
  }

  const settings = await loadContactSettings(req)
  const fromEmail = settings.fromEmail || DEFAULT_FROM_EMAIL
  const toEmail = settings.notificationEmail || DEFAULT_NOTIFICATION_EMAIL

  const textLines = [
    'New donation form submission',
    '',
    `Donor: ${name}`,
    email ? `Email: ${email}` : null,
    phone ? `Phone: ${phone}` : null,
    `Amount: ${amount} ${currency}`,
    transferDate ? `Transfer Date: ${transferDate}` : null,
    paymentMethod ? `Payment Method: ${paymentMethod}` : null,
    message ? `Message: ${message}` : null,
    donation ? `Donation record ID: ${donation.id}` : null,
  ].filter(Boolean)

  const htmlBody = [
    '<p><strong>New donation form submission</strong></p>',
    `<p><strong>Donor:</strong> ${escapeHtml(name)}</p>`,
    email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : '',
    phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : '',
    `<p><strong>Amount:</strong> ${escapeHtml(String(amount))} ${escapeHtml(currency)}</p>`,
    transferDate ? `<p><strong>Transfer Date:</strong> ${escapeHtml(transferDate)}</p>` : '',
    paymentMethod ? `<p><strong>Payment Method:</strong> ${escapeHtml(paymentMethod)}</p>` : '',
    message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : '',
    donation ? `<p><strong>Donation record ID:</strong> ${donation.id}</p>` : '',
  ].join('')

  await sendEmail({
    from: `Donation Form <${fromEmail}>`,
    to: toEmail,
    ...(email ? { replyTo: email } : {}),
    subject: `[Donation] New donation from ${name}`,
    text: textLines.join('\n'),
    html: htmlBody,
    req,
  })
}

export const handleFormSubmission: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const form = await resolveForm(doc.form, req)
  if (!form) return doc

  const title = (form.title || '').toLowerCase().trim()

  if (title === 'contact') {
    await handleContactSubmission(doc, req)
  } else if (title === 'donation') {
    await handleDonationSubmission(doc, req)
  }

  return doc
}
