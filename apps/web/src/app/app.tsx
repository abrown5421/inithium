import { Box, Button, Text, Popover } from '@inithium/ui';

export function App() {
  return (
    <Box bg='primary' className='p-4 flex gap-4'>
      <Text color='secondary'>Hello, World!</Text>
      <Popover buttonLabel="Open Popover" color='accent' variant='outlined' size='lg'>
        <Text>This is the popover content.</Text>
        <Button color='success' variant='ghost'>Action</Button>
      </Popover>
    </Box>
  );
}

export default App;