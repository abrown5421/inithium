import { Box, Dropdown } from '@inithium/ui';

const menuItems = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const handleSelection = (value: string) => {
  console.log('Selected:', value);
};

export function App() {
  return (
    <Box direction='col' className='p-4'>
      <Dropdown 
        trigger="Select an Option"
        items={menuItems}
        onSelect={handleSelection}
        variant="filled"
        color="primary"
      />
    </Box>
  );
}

export default App;