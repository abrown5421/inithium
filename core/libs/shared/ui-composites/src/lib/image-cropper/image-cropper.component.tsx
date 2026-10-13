import { useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import type { ColorValue } from '@inithium/shared-contracts';
import { Container, Slider, toCssColor } from '@inithium/shared-ui-components';
import type { ImageCrop } from './image-crop.service';

export type ImageCropperProps = {
  /** The image to crop, e.g. an object URL for a chosen file. */
  src: string;
  /** The shape's width divided by its height, e.g. 1 for an avatar, 16 / 9 for a wide image. */
  aspect: number;
  /** 'round' shows a circle, e.g. for avatars. Default 'rect'. */
  shape?: 'rect' | 'round';
  /**
   * 'crop' (default) fills the shape, cutting off what doesn't fit. 'fit' lets the image shrink inside the shape, with
   * `background` around it.
   */
  mode?: 'crop' | 'fit';
  /** Shown around the image in fit mode. Default surface 900. */
  background?: ColorValue;
  /** The height of the cropping area, in px. Default 320. */
  height?: number;
  /** Called with the area to keep and the rotation whenever they settle. */
  onCropChange: (crop: ImageCrop) => void;
};

/**
 * Crops or fits an image to a shape before it's uploaded (decision 0098): drag to move, scroll or use the slider to
 * zoom, and the second slider to turn it. In fit mode the image can shrink inside the shape, leaving the background
 * around it. Draw the result with `renderCrop()`.
 */
export function ImageCropper({ src, aspect, shape = 'rect', mode = 'crop', background, height = 320, onCropChange }: ImageCropperProps) {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fit = mode === 'fit';
  const minZoom = fit ? 0.2 : 1;
  // Leaving fit mode, zoom back in so the image fills the shape again.
  const shownZoom = Math.max(zoom, minZoom);
  const backdrop = toCssColor(background ?? { color: 'surface', intensity: 900 });

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container position={{ type: 'relative' }} height={height} radius={{ all: 8 }} overflow={{ all: 'hidden' }}>
        {/* react-easy-crop draws its own frame; it's this composite's internals (decision 0092). */}
        <Cropper
          image={src}
          crop={position}
          zoom={shownZoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={shape}
          minZoom={minZoom}
          maxZoom={4}
          restrictPosition={!fit}
          objectFit="contain"
          showGrid={shape === 'rect'}
          onCropChange={setPosition}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={(_area: Area, pixels: Area) => onCropChange({ area: pixels, rotation })}
          style={{ containerStyle: { background: backdrop } }}
        />
      </Container>
      <Container grid={{ columns: { base: 1, sm: 2 }, gap: 16 }}>
        <Slider
          label="Zoom"
          min={minZoom}
          max={4}
          step={0.01}
          value={shownZoom}
          formatValue={(value) => `${Math.round(value * 100)}%`}
          onValueChange={setZoom}
        />
        <Slider
          label="Rotate"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          formatValue={(value) => `${value}°`}
          onValueChange={setRotation}
        />
      </Container>
    </Container>
  );
}
