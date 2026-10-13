import { Container, Image, Text } from '@inithium/shared-ui-components';

// A drawn landscape, so the example needs no uploaded file.
const landscape =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#7dd3fc"/>' +
      '<circle cx="880" cy="260" r="110" fill="#fb923c"/><path d="M0 620 L260 380 L460 560 L700 300 L1200 700 V800 H0Z" fill="#0f766e"/></svg>',
  );

export default function ExampleImageFitAndAspectRatio() {
  return (
    <Container flex={{ direction: 'row', wrap: 'wrap', gap: 16 }}>
      {(['cover', 'contain', 'fill'] as const).map((fit) => (
        <Container key={fit} flex={{ direction: 'column', gap: 6 }}>
          <Image src={landscape} alt="" decorative fit={fit} width={160} aspectRatio={1} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500 }} />
          <Text fontSize={13}>{fit}</Text>
        </Container>
      ))}
    </Container>
  );
}
