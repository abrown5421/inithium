import { Container } from '@inithium/shared-ui-components';
import { Pagination } from '@inithium/shared-ui-composites';

export default function ExamplePaginationFirstLast() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Pagination pageCount={50} defaultPage={25} showFirstLast aria-label="With first and last" />
      <Pagination pageCount={50} defaultPage={25} siblingCount={2} color="secondary" aria-label="Two neighbours each side" />
    </Container>
  );
}
