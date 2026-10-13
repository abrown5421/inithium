import { useState } from 'react';
import type { PolyPattern } from '@inithium/shared-contracts';
import { Text } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';

// A drawn landscape standing in for an upload, so the example needs no file.
const picture =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400"><rect width="1600" height="400" fill="#0ea5e9"/><path d="M0 330 L500 120 L900 300 L1250 90 L1600 330 V400 H0Z" fill="#14532d"/></svg>',
  );

export default function ExamplePolyBannerUploadedPicture() {
  const [pattern, setPattern] = useState<PolyPattern>({ cellSize: 80, variance: 0.7, xColors: [{ color: 'primary', intensity: 300 }, { color: 'primary', intensity: 700 }], seed: 'banner' });
  const [image, setImage] = useState<{ src: string } | undefined>({ src: picture });

  return (
    <PolyBanner
      editable
      value={pattern}
      onChange={(next) => {
        setPattern(next);
        setImage(undefined);
      }}
      image={image}
      onUpload={() => setImage({ src: picture })}
      height={160}
      radius={{ all: 12 }}
      label="Banner"
    >
      <Text as="p" padding={{ all: 16 }} fontSize={14} textColor={{ color: 'surface', intensity: 50 }}>
        {image ? 'An uploaded picture' : 'The generated pattern'}
      </Text>
    </PolyBanner>
  );
}
