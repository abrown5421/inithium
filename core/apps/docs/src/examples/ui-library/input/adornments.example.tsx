import { useState } from 'react';
import { Container, Input, InputAdornment } from '@inithium/shared-ui-components';

export default function ExampleInputAdornments() {
  const [query, setQuery] = useState('');
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Input label="Email" type="email" leadingIcon="mail" />
      <Input label="Website" type="url" trailingIcon="globe" />
      <Input
        type="search"
        placeholder="Search"
        aria-label="Search"
        value={query}
        onValueChange={setQuery}
        startAdornment={<InputAdornment icon="search" />}
        endAdornment={query && <InputAdornment icon="x" label="Clear search" onClick={() => setQuery('')} />}
      />
    </Container>
  );
}
