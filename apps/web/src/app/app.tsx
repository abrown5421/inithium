import { useState } from 'react';
import { Box, Button, Text, Dialog } from '@inithium/ui';

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = (state: boolean) => () => setIsOpen(state);

  return (
    <Box direction='col' className="p-8">
      <Button onClick={toggleDialog(true)}>
        Open Modal
      </Button>

      <Dialog 
        open={isOpen} 
        onClose={toggleDialog(false)}
        title="Account Update"
        description="Your changes will be saved immediately."
        size="base"
        color="primary"
      >
        <Box className="mt-4">
          <Text>Are you sure you want to proceed with these changes?</Text>
          <Box direction="row" className="mt-6 gap-2 justify-end">
            <Button variant="ghost" onClick={toggleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={toggleDialog(false)}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

export default App;