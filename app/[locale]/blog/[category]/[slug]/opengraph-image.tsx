import { ImageResponse } from 'next/og';
import { getPost, getAllPostSlugs } from '@/lib/blog';

export const alt = 'LocalNomad Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllPostSlugs();
}

const COUNTRY_EMOJI: Record<string, string> = {
  korea: '🇰🇷',
  japan: '🇯🇵',
  taiwan: '🇹🇼',
  china: '🇨🇳',
  sea: '🌏',
  global: '🌍',
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = getPost(category, slug);

  const title = post?.frontmatter.title ?? 'LocalNomad Blog';
  const country = post?.frontmatter.country ?? 'global';
  const emoji = COUNTRY_EMOJI[country] ?? '🌍';
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#1B4965',
          color: '#ffffff',
        }}
      >
        {/* Top: category + country */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '24px',
            opacity: 0.8,
          }}
        >
          <span>{emoji}</span>
          <span>{categoryLabel}</span>
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? '42px' : '52px',
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Bottom: brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '28px', fontWeight: 700, opacity: 0.9 }}>
            LocalNomad
          </span>
          <span style={{ fontSize: '20px', opacity: 0.6 }}>
            localnomad.club
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
