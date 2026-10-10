import { PolyBanner } from '@inithium/shared-ui-composites';

export default function ExamplePolyBannerBasic() {
  return (
    <PolyBanner
      radius={{ all: 12 }}
      defaultValue={{
        cellSize: 75,
        variance: 0.75,
        xColors: [
          { color: 'primary', intensity: 200 },
          { color: 'primary', intensity: 500 },
          { color: 'primary', intensity: 800 },
        ],
        seed: 'inithium',
      }}
    />
  );
}
