import { Container, Input } from '@inithium/shared-ui-components';
import { AutoIncrementingList } from '@inithium/shared-ui-composites';

export default function ExampleAutoIncrementingListEmails() {
  return (
    <Container maxWidth={480}>
      <AutoIncrementingList
        label="Invite by email"
        helperText="Up to five people at a time."
        itemLabel="email"
        max={5}
        createItem={() => ''}
        renderItem={(email, index, update) => (
          <Input type="email" aria-label={`Email ${index + 1}`} placeholder="name@example.com" value={email} onValueChange={update} />
        )}
      />
    </Container>
  );
}
