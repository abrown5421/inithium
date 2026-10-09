import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';
import { Pagination } from '@inithium/shared-ui-composites';

const people = Array.from({ length: 87 }, (_, index) => `Member ${String(index + 1).padStart(2, '0')}`);

export default function ExamplePaginationTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const rows = people.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container as="ul" flex={{ direction: 'column', gap: 4 }}>
        {rows.map((person) => (
          <Container as="li" key={person} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor={{ color: 'surface', intensity: 200 }}>
            <Text as="span" fontSize={14}>{person}</Text>
          </Container>
        ))}
      </Container>
      <Pagination
        pageCount={Math.ceil(people.length / pageSize)}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 25]}
        totalItems={people.length}
        aria-label="Members"
      />
    </Container>
  );
}
