import { Box, Button, Text, Popover } from '@inithium/ui';

export function App() {
  return (
    <Box direction='col'>
      <Box direction='row' gap='4' className='p-4 flex gap-4'>
        <Button variant='filled' color='primary'>Click Me</Button>
        <Button variant='outlined' color='secondary'>Click Me</Button>
        <Button variant='ghost' color='accent'>Click Me</Button>
      </Box>
      <Box direction='row' gap='4' className='p-4 flex gap-4'>
        <Text color='primary' as='p' weight='bold'>md</Text>
        <Text color='secondary' as='p' size='lg' weight='bold'>lg</Text>
        <Text color='accent' as='p' size='xl' weight='bold'>xl</Text>
      </Box>
      <Box direction='row' gap='4' className='p-4 flex gap-4'>
        <Popover buttonLabel='Open Popover' variant='filled' color='primary'>
          <Text color='primary' as='p'>This is the popover content</Text>
        </Popover>
        <Popover buttonLabel='Open Popover' variant='outlined' color='secondary'>
          <Text color='secondary' as='p'>This is the popover content</Text>
        </Popover>
        <Popover buttonLabel='Open Popover' variant='ghost' color='accent'>
          <Text color='accent' as='p'>This is the popover content</Text>
        </Popover>
      </Box>
    </Box>
  );
}

export default App;