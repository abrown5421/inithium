import { Footer } from '@inithium/shared-ui-composites';

export default function ExampleFooterCentred() {
  return (
    <Footer
      align="center"
      links={[
        { label: 'Trails', href: '/trails' },
        { label: 'Gear', href: '/gear' },
        { label: 'About', href: '/about' },
      ]}
      secondaryLinks={[{ label: 'Terms', href: '/terms' }]}
      copyright="Peak Outfitters"
      copyrightStartYear={2019}
      bgColor={{ color: 'primary', intensity: 50 }}
      onNavigate={() => undefined}
    />
  );
}
