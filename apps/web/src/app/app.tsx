import { useState } from 'react';
import { Box, Button, Text, Dialog } from '@inithium/ui';

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = (state: boolean) => () => setIsOpen(state);

  return (
    <Box direction='col' className="p-8">
      <Text size='2xl' weight='bold' className="mb-4" color='primary'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='secondary'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='accent'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='success'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='warning'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='danger'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='info'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='surface'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='surface2'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='surface3'>Welcome to Inithium UI</Text>
      <Text size='2xl' weight='bold' className="mb-4" color='surface4'>Welcome to Inithium UI</Text>
    </Box>
  );
}

export default App;