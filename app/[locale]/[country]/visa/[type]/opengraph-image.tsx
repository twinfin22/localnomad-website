import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getVisaData, getAvailableVisas } from '@/lib/visa-data';
import { routing } from '@/i18n/routing';
import type { Country } from '@/lib/types/visa';

export const alt = 'LocalNomad Visa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;

const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  japan: 'Japan',
  taiwan: 'Taiwan',
};

export async function generateStaticParams() {
  const params: { locale: string; country: string; type: string }[] = [];
  for (const locale of routing.locales) {
    for (const country of VALID_COUNTRIES) {
      const visas = await getAvailableVisas(country, locale);
      for (const visa of visas) {
        params.push({ locale, country, type: visa.type });
      }
    }
  }
  return params;
}

const CATEGORY_ICON: Record<string, string> = {
  'digital-nomad': '💻',
  work: '💼',
  study: '🎓',
  residence: '🏠',
  'job-seeking': '🔍',
  'working-holiday': '🎒',
  business: '🏛️',
  family: '👨‍👩‍👧',
  'ethnic-korean': '🇰🇷',
  'language-study': '🗣️',
  'gold-card': '🥇',
  investment: '💰',
  visitor: '🛬',
};

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const fontPath = join(process.cwd(), 'public', 'fonts', filename);
  const data = await readFile(fontPath);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

async function getVisaBgSrc(country: string): Promise<string | null> {
  try {
    const filePath = join(
      process.cwd(), 'public', 'images', 'visa', `${country}-visa-bg.jpg`,
    );
    const data = await readFile(filePath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; country: string; type: string }>;
}) {
  const { locale, country, type } = await params;
  const visa = await getVisaData(country as Country, locale, type);

  const year = new Date().getFullYear();
  const displayName = COUNTRY_DISPLAY[country] ?? country;
  const title = visa
    ? `${displayName} ${visa.shortName} Visa — Requirements & Guide ${year}`
    : `${displayName} ${type.toUpperCase()} Visa`;
  const icon = CATEGORY_ICON[visa?.category ?? ''] ?? '📋';

  const bgSrc = await getVisaBgSrc(country);
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
        {/* Full-bleed visa background */}
        {bgSrc ? (
          <img
            src={bgSrc}
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

        {/* Bottom: visa title */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '44px',
            right: '44px',
            display: 'flex',
            fontFamily: '"DM Serif Display"',
            fontSize: title.length > 50 ? '40px' : '48px',
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
