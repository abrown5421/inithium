import React from 'react';
import { useDispatch } from 'react-redux';
import { showAlert } from '@inithium/store'; // Adjust path to your slice
import { Box, Button, Text } from '@inithium/ui'; // Adjust path to your atomic components
import { AlertSeverity, AlertPosition, AnimateEntry, AnimateExit } from '@inithium/types';

const Home = () => {
  const dispatch = useDispatch();

  const trigger = (
    severity: AlertSeverity,
    position: AlertPosition,
    entry: AnimateEntry = 'fadeInRight',
    exit: AnimateExit = 'fadeOutRight'
  ) => {
    dispatch(
      showAlert({
        severity,
        position,
        message: `This is a ${severity} alert at ${position}!`,
        animationObject: {
          entry,
          exit,
          entrySpeed: 'fast',
        },
      })
    );
  };

  return (
    <Box direction="col" p="8" gap="8" align="center" fullWidth>
      <Box direction="col" align="center" gap="2">
        <Text size="3xl" weight="bold" font="display">Alert System Demo</Text>
        <Text color="surface4-contrast">Test the global composite with different configurations</Text>
      </Box>

      {/* Demo Grid */}
      <Box wrap="wrap" justify="center" gap="6" className="max-w-4xl">
        
        {/* Severity Tests */}
        <Box direction="col" gap="3" p="4" border rounded="lg" borderColor="surface4">
          <Text weight="bold">By Severity</Text>
          <Button color="success" onClick={() => trigger('success', 'top-right')}>
            Success Alert
          </Button>
          <Button color="danger" onClick={() => trigger('danger', 'top-right')}>
            Danger Alert
          </Button>
          <Button color="warning" onClick={() => trigger('warning', 'top-right')}>
            Warning Alert
          </Button>
          <Button color="info" onClick={() => trigger('info', 'top-right')}>
            Info Alert
          </Button>
        </Box>

        {/* Position Tests */}
        <Box direction="col" gap="3" p="4" border rounded="lg" borderColor="surface4">
          <Text weight="bold">By Position</Text>
          <Button variant="outlined" onClick={() => trigger('primary', 'top-left')}>
            Top Left
          </Button>
          <Button variant="outlined" onClick={() => trigger('secondary', 'bottom-left')}>
            Bottom Left
          </Button>
          <Button variant="outlined" onClick={() => trigger('accent', 'bottom-right')}>
            Bottom Right
          </Button>
        </Box>

        {/* Animation Tests */}
        <Box direction="col" gap="3" p="4" border rounded="lg" borderColor="surface4">
          <Text weight="bold">By Animation</Text>
          <Button variant="ghost" onClick={() => trigger('primary', 'top-right', 'bounceInDown', 'bounceOutUp')}>
            Bounce Effect
          </Button>
          <Button variant="ghost" onClick={() => trigger('secondary', 'top-right', 'zoomIn', 'zoomOut')}>
            Zoom Effect
          </Button>
          <Button variant="ghost" onClick={() => trigger('accent', 'top-right', 'lightSpeedInRight', 'lightSpeedOutRight')}>
            LightSpeed
          </Button>
        </Box>

      </Box>
    </Box>
  );
};

export default Home;