import { Pagination } from '@inithium/shared-ui-composites';

export default function ExamplePaginationCompact() {
  return <Pagination compact pageCount={20} defaultPage={5} showFirstLast aria-label="Compact" />;
}
