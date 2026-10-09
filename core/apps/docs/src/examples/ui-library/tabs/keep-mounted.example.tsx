import { Container, Input } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

export default function ExampleTabsKeepMounted() {
  return (
    <Container maxWidth={420}>
      <Tabs
        keepMounted
        aria-label="Profile"
        tabs={[
          { value: 'about', label: 'About', content: <Input label="Display name" placeholder="Type, then switch tabs" /> },
          { value: 'links', label: 'Links', content: <Input label="Website" type="url" /> },
        ]}
      />
    </Container>
  );
}
