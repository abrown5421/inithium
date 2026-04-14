import { useState } from 'react';
import { Box, Text, Checkbox } from '@inithium/ui';

export function App() {
  const [selections, setSelections] = useState<Record<string, boolean>>({
    primary: false,
    secondary: false,
    accent: false,
    success: false,
    warning: false,
    danger: false,
    info: false,
  });

  const handleToggle = (key: string) => (checked: boolean) => {
    setSelections((prev) => ({ ...prev, [key]: checked }));
  };

  const renderCheckbox = (color: keyof typeof selections) => (
    <Checkbox
      key={color}
      label={`Enable ${color} mode`}
      description={`Toggle the ${color} theme setting`}
      color={color as any}
      checked={selections[color]}
      onChange={handleToggle(color)}
      size="lg"
      className="mb-4"
    />
  );

  return (
    <Box direction="col" className="p-8">
      <Text size="2xl" weight="bold" className="mb-6">
        Component Configuration
      </Text>
      
      {Object.keys(selections).map((key) => renderCheckbox(key as keyof typeof selections))}
    </Box>
  );
}

export default App;