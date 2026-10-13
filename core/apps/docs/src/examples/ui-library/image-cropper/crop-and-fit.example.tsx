import { useState } from 'react';
import { Container, RadioGroup, Text } from '@inithium/shared-ui-components';
import { ImageCropper, type ImageCrop } from '@inithium/shared-ui-composites';

// A drawn landscape, so the example needs no uploaded file.
const landscape =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#7dd3fc"/>' +
      '<circle cx="880" cy="260" r="110" fill="#fb923c"/><path d="M0 620 L260 380 L460 560 L700 300 L1200 700 V800 H0Z" fill="#0f766e"/></svg>',
  );

export default function ExampleImageCropperCropAndFit() {
  const [mode, setMode] = useState<'crop' | 'fit'>('crop');
  const [crop, setCrop] = useState<ImageCrop | null>(null);
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={560}>
      <RadioGroup
        label="Mode"
        orientation="horizontal"
        value={mode}
        onValueChange={(value) => setMode(value as 'crop' | 'fit')}
        options={[
          { value: 'crop', label: 'Crop to fill' },
          { value: 'fit', label: 'Fit inside' },
        ]}
      />
      <ImageCropper src={landscape} aspect={16 / 9} mode={mode} background={{ color: 'surface', intensity: 200 }} height={260} onCropChange={setCrop} />
      <Text fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
        {crop ? `Keeps ${Math.round(crop.area.width)} × ${Math.round(crop.area.height)} px from (${Math.round(crop.area.x)}, ${Math.round(crop.area.y)}), turned ${crop.rotation}°` : 'Move or zoom the image.'}
      </Text>
    </Container>
  );
}
