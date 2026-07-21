import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand ISR revalidation endpoint, called by the CMS
 * (packages/cms/src/hooks/triggerWebRevalidate.ts) whenever content that is
 * rendered on the site changes. Marks the whole site stale; pages are
 * regenerated on the next visit. The site is small, so revalidating from the
 * root layout is simpler and more robust than mapping collections to paths.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('[revalidate] REVALIDATE_SECRET is not set on the web worker.');
    return NextResponse.json({ error: 'Revalidation is not configured' }, { status: 500 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let context: unknown = null;
  try {
    context = await request.json();
  } catch {
    // The request body is optional and used for logging only.
  }
  console.log('[revalidate] On-demand revalidation triggered:', JSON.stringify(context));

  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
