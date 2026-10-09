import { Container } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';

export default function ExamplePolyBannerRecipes() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      {/* A regular grid: variance 0. */}
      <PolyBanner
        height={140}
        radius={{ all: 8 }}
        defaultValue={{
          cellSize: 100,
          variance: 0,
          xColors: [
            { color: 'violet', intensity: 50 },
            { color: 'pink', intensity: 400 },
            { color: 'rose', intensity: 900 },
          ],
          yColors: [
            { color: 'violet', intensity: 100 },
            { color: 'fuchsia', intensity: 700 },
          ],
          seed: 'grid',
        }}
      />
      {/* Light at the top left, deep green at the bottom right. */}
      <PolyBanner
        height={140}
        radius={{ all: 8 }}
        defaultValue={{
          cellSize: 75,
          variance: 0.75,
          xColors: [
            { color: 'teal', intensity: 50 },
            { color: 'emerald', intensity: 300 },
            { color: 'green', intensity: 600 },
          ],
          yColors: [
            { color: 'sky', intensity: 50 },
            { color: 'emerald', intensity: 400 },
            { color: 'green', intensity: 900 },
          ],
          seed: 'meadow',
        }}
      />
      {/* Big, very random cells across five colours. */}
      <PolyBanner
        height={140}
        radius={{ all: 8 }}
        defaultValue={{
          cellSize: 150,
          variance: 1,
          xColors: [
            { color: 'red', intensity: 700 },
            { color: 'orange', intensity: 400 },
            { color: 'yellow', intensity: 200 },
            { color: 'lime', intensity: 400 },
            { color: 'green', intensity: 700 },
          ],
          seed: 'sunset',
        }}
      />
    </Container>
  );
}
