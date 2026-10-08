import { Container, Icon } from '@inithium/shared-ui-components';

export default function ExampleStatusChips() {
  return (
    <Container flex={{ gap: 12 }}>
      <Icon name="check" size={20} padding={{ all: 8 }} radius={{ all: 999 }} bgColor={{ color: 'emerald', intensity: 100 }} textColor={{ color: 'emerald', intensity: 700 }} />
      <Icon name="triangle-alert" size={20} padding={{ all: 8 }} radius={{ all: 8 }} bgColor={{ color: 'amber', intensity: 100 }} textColor={{ color: 'amber', intensity: 700 }} />
      <Icon name="x" size={20} padding={{ all: 8 }} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor="rose" textColor="rose" />
    </Container>
  );
}
