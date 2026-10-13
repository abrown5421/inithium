/** Part of an image, in its own pixels (of its rotated bounding box, when rotated). */
export type CropArea = { x: number; y: number; width: number; height: number };

/** What the cropper settled on: the area to keep and how far the image is turned. */
export type ImageCrop = { area: CropArea; rotation: number };

export type RenderCropOptions = {
  /** Fills around the image in fit mode (any CSS colour, already resolved: canvases can't read CSS variables). */
  background?: string;
  /** The longest side of the result, in px. Default 2560, the largest the server keeps. */
  maxSide?: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be read'));
    image.src = src;
  });
}

/**
 * Draws an image's crop to a new image (decision 0098), in the browser: turned by the rotation, cut to the area,
 * scaled down to `maxSide`, with `background` filling anything outside the image (fit mode). Resolves a WebP blob
 * (PNG where the browser can't write WebP); the server then re-encodes it under 2 MB.
 */
export async function renderCrop(src: string, crop: ImageCrop, options: RenderCropOptions = {}): Promise<Blob> {
  const image = await loadImage(src);
  const radians = (crop.rotation * Math.PI) / 180;
  // The rotated image's bounding box, which the crop area is measured against.
  const boxWidth = Math.abs(Math.cos(radians) * image.naturalWidth) + Math.abs(Math.sin(radians) * image.naturalHeight);
  const boxHeight = Math.abs(Math.sin(radians) * image.naturalWidth) + Math.abs(Math.cos(radians) * image.naturalHeight);

  const scale = Math.min(1, (options.maxSide ?? 2560) / Math.max(crop.area.width, crop.area.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(crop.area.width * scale));
  canvas.height = Math.max(1, Math.round(crop.area.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser can’t crop images');

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingQuality = 'high';
  context.scale(scale, scale);
  context.translate(-crop.area.x + boxWidth / 2, -crop.area.y + boxHeight / 2);
  context.rotate(radians);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image could not be cropped'))), 'image/webp', 0.92),
  );
}
