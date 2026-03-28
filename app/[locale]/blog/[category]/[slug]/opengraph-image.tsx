import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getPost, getAllPostSlugs } from '@/lib/blog';

export const alt = 'LocalNomad Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllPostSlugs();
}

async function getCoverImageSrc(coverImage?: string): Promise<string | null> {
  if (!coverImage) return null;
  try {
    const filePath = join(process.cwd(), 'public', coverImage);
    const data = await readFile(filePath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const fontPath = join(process.cwd(), 'public', 'fonts', filename);
  const data = await readFile(fontPath);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  const post = getPost(category, slug, locale);

  const title = post?.frontmatter.title ?? 'LocalNomad Blog';
  const coverSrc = await getCoverImageSrc(post?.frontmatter.coverImage);
  const [loraFont, dmSerifFont] = await Promise.all([
    loadFont('Lora-BoldItalic.ttf'),
    loadFont('DMSerifDisplay-Regular.ttf'),
  ]);

  const heavyShadow =
    '0 2px 4px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), 0 8px 40px rgba(0,0,0,0.5)';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1B4965',
          color: '#ffffff',
        }}
      >
        {/* Full-bleed cover image */}
        {coverSrc ? (
          <img
            src={coverSrc}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '630px',
              objectFit: 'cover',
            }}
          />
        ) : null}

        {/* Top-left: LocalNomad logo */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: '44px',
            display: 'flex',
            fontFamily: '"Lora"',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '32px',
            textShadow: heavyShadow,
          }}
        >
          LocalNomad
        </div>

        {/* Bottom: title in DM Serif Display */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '44px',
            right: '44px',
            display: 'flex',
            fontFamily: '"DM Serif Display"',
            fontSize: title.length > 60 ? '38px' : '48px',
            fontWeight: 400,
            lineHeight: 1.2,
            textShadow: heavyShadow,
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Lora',
          data: loraFont,
          style: 'italic',
          weight: 700,
        },
        {
          name: 'DM Serif Display',
          data: dmSerifFont,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
