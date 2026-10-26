import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { site } from '@/content/site';

// The default sharing card: the Thrive logo on paper over a band of Thrive green. Pages with
// their own image (projects) override it.
export const alt = `${site.name} logo`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/brand/thrive-logo.png'), 'base64');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f1ea' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={`data:image/png;base64,${logo}`} width={820} height={257} alt="" />
        </div>
        <div style={{ height: 36, background: '#6a9a36' }} />
      </div>
    ),
    size,
  );
}
