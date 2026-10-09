import { useState } from 'react';
import { Pagination } from '@inithium/shared-ui-composites';

export default function ExamplePaginationLinks() {
  const [page, setPage] = useState(3);
  return (
    <Pagination
      pageCount={12}
      page={page}
      onPageChange={setPage}
      getPageHref={(target) => `#results-page-${target}`}
      aria-label="Search results"
    />
  );
}
