import { Image } from '@inithium/shared-ui-components';

// A drawn landscape, so the example needs no uploaded file.
const landscape =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#7dd3fc"/>' +
      '<circle cx="880" cy="260" r="110" fill="#fb923c"/><path d="M0 620 L260 380 L460 560 L700 300 L1200 700 V800 H0Z" fill="#0f766e"/></svg>',
  );

export default function ExampleImageStyled() {
  return (
    <Image
      src={landscape}
      alt="Hills under an orange sun"
      width={{ base: 'full', md: 420 }}
      radius={{ all: 999 }}
      shadow="xl"
      borderWidth={{ all: 4 }}
      borderColor={{ color: 'primary', intensity: 500 }}
      aspectRatio={1}
      animation={{ entrance: { name: 'zoomIn', when: 'inView' } }}
    />
  );
}
