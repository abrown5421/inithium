import type { AssetKind, AssetPurpose } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';

/** How each kind of file is drawn when there's no picture of it. */
export const KIND_ICONS: Record<AssetKind, IconName> = {
  image: 'image',
  font: 'type',
  document: 'file-text',
  audio: 'music',
  video: 'film',
};

/** How the CMS names each purpose. */
export const PURPOSE_LABELS: Record<AssetPurpose, string> = {
  content: 'Page content',
  logo: 'Logo',
  favicon: 'Favicon',
  font: 'Font',
  document: 'Document',
  avatar: 'Avatar',
  banner: 'Banner',
};

/** A size in bytes, e.g. '1.4 MB'. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** A shape an image can be cropped to: a label and its width ÷ height, or the image's own shape (`null`). */
export type CropShape = { value: string; label: string; aspect: number | null; round?: boolean };

const ORIGINAL: CropShape = { value: 'original', label: 'Its own shape', aspect: null };
const SHAPES: Record<string, CropShape> = {
  square: { value: 'square', label: 'Square (1:1)', aspect: 1 },
  wide: { value: 'wide', label: 'Wide (16:9)', aspect: 16 / 9 },
  classic: { value: 'classic', label: 'Classic (4:3)', aspect: 4 / 3 },
  photo: { value: 'photo', label: 'Photo (3:2)', aspect: 3 / 2 },
  portrait: { value: 'portrait', label: 'Portrait (3:4)', aspect: 3 / 4 },
  cinema: { value: 'cinema', label: 'Cinema (21:9)', aspect: 21 / 9 },
};

/**
 * The shapes each purpose offers when cropping (decision 0098): fixed for avatars (a circle), banners (a wide strip)
 * and favicons (a square), free for everything else.
 */
export const CROP_SHAPES: Record<AssetPurpose, readonly CropShape[]> = {
  avatar: [{ value: 'avatar', label: 'Avatar (circle)', aspect: 1, round: true }],
  banner: [{ value: 'banner', label: 'Banner (4:1)', aspect: 4 }],
  favicon: [{ ...SHAPES['square'] } as CropShape],
  logo: [ORIGINAL, SHAPES['square'], SHAPES['wide']] as CropShape[],
  content: [ORIGINAL, SHAPES['wide'], SHAPES['classic'], SHAPES['photo'], SHAPES['square'], SHAPES['portrait'], SHAPES['cinema']] as CropShape[],
  font: [],
  document: [],
};

/** Image types the cropper can redraw; SVGs, icons and (animated) GIFs are uploaded as they are. */
export const CROPPABLE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);

/** A theme colour as a plain CSS colour a canvas can use (canvases can't read CSS variables). */
export function resolveCssColor(css: string): string {
  const probe = document.createElement('span');
  probe.style.color = css;
  probe.style.display = 'none';
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}
