import React, { useState } from 'react';
import { Box, Text, Switch } from '@inithium/ui';
import type { ThemeColor } from '@inithium/types';

/**
 * Functional constant defining the available theme colors derived from ThemeColor type.
 */
const THEME_COLORS: ThemeColor[] = [
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'surface',
  'surface2',
  'surface3',
  'surface4'
];

export function App() {
  const [states, setStates] = useState<Record<string, boolean>>(
    THEME_COLORS.reduce((acc, color) => ({ ...acc, [color]: true }), {})
  );

  const toggleColor = (color: ThemeColor) => (checked: boolean) => {
    setStates((prev) => ({ ...prev, [color]: checked }));
  };

  return (
    <Box direction='col' className="p-8 gap-6">
      <Box direction='col' className="gap-2">
        <Text size='2xl' weight='bold' color='primary'>
          Switch Color Palette
        </Text>
        <Text className="opacity-70">
          Demonstrating all available ThemeColor variants for the Inithium Switch component.
        </Text>
      </Box>

      <Box direction='col' className="gap-4">
        {THEME_COLORS.map((color) => (
          <Switch
            key={color}
            color={color}
            checked={states[color]}
            onChange={toggleColor(color)}
            label={color.charAt(0).toUpperCase() + color.slice(1)}
            description={`Switch variant using the ${color} theme token.`}
          />
        ))}
      </Box>
    </Box>
  );
}

export default App;