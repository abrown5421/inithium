import { useState } from 'react';
import { Container, Input, InputAdornment } from '@inithium/shared-ui-components';

const newKey = () => `key_${Math.random().toString(36).slice(2, 12)}`;

export default function ExampleInputAdornmentButtons() {
  const [key, setKey] = useState('key_7d2f9a1c4e');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
  };

  return (
    <Container maxWidth={420}>
      <Input
        label="API key"
        value={key}
        readOnly
        startAdornment={<InputAdornment icon="key-round" />}
        endAdornment={
          <>
            <InputAdornment icon={copied ? 'check' : 'copy'} label="Copy key" onClick={copy} />
            <InputAdornment icon="refresh-cw" label="Generate a new key" onClick={() => { setKey(newKey()); setCopied(false); }} />
          </>
        }
      />
    </Container>
  );
}
