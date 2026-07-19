import { locales, type Locale } from '@/i18n/config';
import { fetchBlogs, fetchBlogForRedirect } from '@/lib/cms';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const params: { locale: string; slugName: string }[] = [];
  for (const locale of locales) {
    const blogs = await fetchBlogs(locale as Locale);
    for (const blog of blogs) {
      params.push({ locale, slugName: blog.slugName });
    }
  }
  return params;
}

export default async function OldBlogRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slugName: string }>;
}) {
  const { locale, slugName } = await params;
  const redirectInfo = await fetchBlogForRedirect(slugName, locale as Locale);

  const destination = redirectInfo
    ? `/${locale}/blog/${redirectInfo.slugName}/${redirectInfo.shortId}/`
    : `/${locale}/blog/`;

  return (
    <div className="container-main py-20 text-center">
      <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
        Redirecting to <a href={destination} className="underline" style={{ color: 'var(--color-primary-600)' }}>{destination}</a>...
      </p>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(destination)})` }} />
    </div>
  );
}
