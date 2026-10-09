import { useState, type FormEvent } from 'react';
import { Button, Container, Input, Select } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalForm() {
  const [open, setOpen] = useState(false);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" leadingIcon="pencil" onClick={() => setOpen(true)}>Edit profile</Button>
      <Modal open={open} onOpenChange={setOpen} title="Edit profile" dismissible={false}>
        <form onSubmit={save}>
          <Container flex={{ direction: 'column', gap: 16 }}>
            <Input label="Name" defaultValue="Ada Lovelace" />
            <Input label="Email" type="email" defaultValue="ada@example.com" />
            <Select
              label="Role"
              defaultValue="editor"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
            <Container flex={{ justify: 'end', gap: 8 }} margin={{ top: 8 }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Container>
          </Container>
        </form>
      </Modal>
    </>
  );
}
