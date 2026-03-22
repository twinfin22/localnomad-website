import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'LocalNomad — Soft Land in Asia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const filePath = join(process.cwd(), 'public', 'images', 'og-landing.jpg');
  const data = await readFile(filePath);
  const src = `data:image/jpeg;base64,${data.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#0f1e32',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src={src}
          width={1800}
          height={945}
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-300px',
            width: '1800px',
            height: '945px',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
