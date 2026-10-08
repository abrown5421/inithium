import { Container, Icon, Text } from '@inithium/shared-ui-components';

export default function ExampleFeatureList() {
  return (
    <Container as="ul" flex={{ direction: 'column', gap: 8 }}>
      {['Unlimited pages', 'Custom domain', 'Email support'].map((feature) => (
        <Container as="li" key={feature} flex={{ align: 'center', gap: 8 }}>
          <Icon name="circle-check" size={20} textColor="secondary" />
          <Text as="span">{feature}</Text>
        </Container>
      ))}
    </Container>
  );
}
