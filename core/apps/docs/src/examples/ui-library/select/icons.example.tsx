import { Container, Select } from '@inithium/shared-ui-components';

export default function ExampleSelectIcons() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
      <Select
        label="Status"
        defaultValue="active"
        options={[
          { value: 'active', label: 'Active', icon: 'circle-check' },
          { value: 'paused', label: 'Paused', icon: 'circle-pause' },
          { value: 'archived', label: 'Archived', icon: 'archive' },
        ]}
      />
      <Select
        label="Language"
        leadingIcon="languages"
        color="secondary"
        options={[
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'pt', label: 'Português' },
        ]}
      />
    </Container>
  );
}
