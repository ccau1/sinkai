import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '善啟慈善基金會 · Sin Kai Funds Ltd',
  description: '善啟慈善基金會成立於1998年，致力於中國貴州省貧困山區助學建校。零行政費，100%善款直達山區。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
