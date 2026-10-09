import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';
import { Pagination } from '@inithium/shared-ui-composites';

export default function ExamplePaginationBasic() {
  const [page, setPage] = useState(5);
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Pagination pageCount={20} page={page} onPageChange={setPage} />
      <Text fontSize={14}>Showing page {page} of 20.</Text>
    </Container>
  );
}
