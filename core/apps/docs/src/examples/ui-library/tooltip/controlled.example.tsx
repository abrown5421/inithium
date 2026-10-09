import { useState } from 'react';
import { Button, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipControlled() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText('https://example.com/invite/4821');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip content={copied ? 'Copied!' : 'Copy the invite link'} open={copied || undefined}>
      <Button variant="outlined" leadingIcon={copied ? 'check' : 'link'} onClick={copy}>
        Copy invite link
      </Button>
    </Tooltip>
  );
}
