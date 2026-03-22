import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Soft Land in Asia | LocalNomad',
  description:
    'Visa clarity for digital nomads in Japan, Korea, and Taiwan. Free guides and checklists.',
  openGraph: {
    title: 'Soft Land in Asia | LocalNomad',
    description:
      'Visa clarity for digital nomads in Japan, Korea, and Taiwan. Free guides and checklists.',
    url: 'https://localnomad.club',
    siteName: 'LocalNomad',
    type: 'website',
    images: [
      {
        url: 'https://localnomad.club/images/og-landing.jpg',
        width: 1200,
        height: 630,
        alt: 'Soft Land in Asia — LocalNomad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soft Land in Asia | LocalNomad',
    description:
      'Visa clarity for digital nomads in Japan, Korea, and Taiwan. Free guides and checklists.',
    images: ['https://localnomad.club/images/og-landing.jpg'],
  },
};

export default function RootPage() {
  redirect('/en');
}
