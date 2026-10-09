import { Container } from '@inithium/shared-ui-components';
import { Pagination } from '@inithium/shared-ui-composites';

export default function ExamplePaginationShortAndSingle() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Pagination pageCount={5} defaultPage={2} aria-label="Five pages" />
      <Pagination pageCount={1} aria-label="One page" />
    </Container>
  );
}
