import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'LocalNomad — Soft Land in Asia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const fontPath = join(process.cwd(), 'public', 'fonts', filename);
  const data = await readFile(fontPath);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

async function getHeroSrc(): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), 'public', 'images', 'hero-bg-og.jpg');
    const data = await readFile(filePath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [loraFont, dmSerifFont, heroSrc] = await Promise.all([
    loadFont('Lora-BoldItalic.ttf'),
    loadFont('DMSerifDisplay-Regular.ttf'),
    getHeroSrc(),
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
        {/* Full-bleed hero image */}
        {heroSrc ? (
          <img
            src={heroSrc}
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

        {/* Bottom: tagline in DM Serif Display */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '44px',
            right: '44px',
            display: 'flex',
            fontFamily: '"DM Serif Display"',
            fontSize: '56px',
            fontWeight: 400,
            lineHeight: 1.2,
            textShadow: heavyShadow,
          }}
        >
          Soft Land in Asia
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
