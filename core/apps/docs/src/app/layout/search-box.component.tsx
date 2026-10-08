import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { searchManual } from '../manual/manual.service';

/** Searches page titles, headings and text across the manual. */
export function SearchBox() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchManual(query), [query]);
  const open = query.trim().length > 0;

  return (
    <Container position={{ type: 'relative' }} width={{ base: 'full', md: 420 }}>
      <Container
        flex={{ align: 'center', gap: 8 }}
        padding={{ x: 12, y: 6 }}
        radius={{ all: 8 }}
        bgColor={{ color: 'surface', intensity: 100 }}
        borderWidth={{ all: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
        textColor={{ color: 'surface', intensity: 600 }}
      >
        <Icon name="search" size={16} />
        <input
          className="docs-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
          placeholder="Search the manual"
          aria-label="Search the manual"
        />
      </Container>

      {open && (
        <Container
          as="ul"
          role="listbox"
          position={{ type: 'absolute', top: 44, left: 0, right: 0, z: 30 }}
          maxHeight={420}
          overflow={{ y: 'auto' }}
          padding={{ all: 6 }}
          radius={{ all: 10 }}
          bgColor={{ color: 'surface', intensity: 50 }}
          borderWidth={{ all: 1 }}
          borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
          shadow="xl"
        >
          {results.length === 0 && (
            <Container as="li" padding={{ all: 12 }}>
              <Text textColor={{ color: 'surface', intensity: 600 }}>No pages match “{query}”.</Text>
            </Container>
          )}
          {results.map((result) => (
            <Container as="li" key={result.page.slug}>
              <Link to={`/${result.page.slug}${result.anchor ? `#${result.anchor}` : ''}`} onClick={() => setQuery('')}>
                <Container
                  flex={{ direction: 'column', gap: 2 }}
                  padding={{ x: 12, y: 8 }}
                  radius={{ all: 6 }}
                  bgColor={{ base: 'transparent', hover: { color: 'primary', intensity: 50 } }}
                >
                  <Text as="span" fontWeight={600} textColor={{ color: 'surface', intensity: 950 }}>
                    {result.page.title}
                  </Text>
                  <Text as="span" fontSize={12} truncate={1} textColor={{ color: 'surface', intensity: 600 }}>
                    {result.snippet}
                  </Text>
                </Container>
              </Link>
            </Container>
          ))}
        </Container>
      )}
    </Container>
  );
}
