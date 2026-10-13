import { useRef, useState } from 'react';
import { Button, Container, Image } from '@inithium/shared-ui-components';
import { ImageCropper, renderCrop, type ImageCrop } from '@inithium/shared-ui-composites';

// A drawn landscape, so the example needs no uploaded file.
const landscape =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#7dd3fc"/>' +
      '<circle cx="880" cy="260" r="110" fill="#fb923c"/><path d="M0 620 L260 380 L460 560 L700 300 L1200 700 V800 H0Z" fill="#0f766e"/></svg>',
  );

export default function ExampleImageCropperRoundAvatar() {
  const crop = useRef<ImageCrop | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const draw = async () => {
    if (!crop.current) return;
    const blob = await renderCrop(landscape, crop.current, { maxSide: 256 });
    if (result) URL.revokeObjectURL(result);
    setResult(URL.createObjectURL(blob));
  };
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={420}>
      <ImageCropper src={landscape} aspect={1} shape="round" height={260} onCropChange={(next) => (crop.current = next)} />
      <Container flex={{ align: 'center', gap: 16 }}>
        <Button leadingIcon="crop" onClick={() => void draw()}>
          Crop
        </Button>
        {result && <Image src={result} alt="The cropped picture" width={72} height={72} radius={{ all: 999 }} />}
      </Container>
    </Container>
  );
}
