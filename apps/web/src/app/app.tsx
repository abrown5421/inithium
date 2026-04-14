import { useRef, useState } from 'react';
import { Box, Text } from '@inithium/ui';
import type { AnimationObject } from '@inithium/types';

const createController = () => {
  let resolveExit: () => void;

  return {
    phase: 'idle' as const,

    triggerExit: () => {
      return new Promise<void>((resolve) => {
        resolveExit = resolve;
        setTimeout(() => {
          resolve();
        }, 600);
      });
    },

    triggerEnter: () => {},

    resolveExit: () => resolveExit?.(),
  };
};

export function App() {
  const [index, setIndex] = useState(0);

  const controllerRef = useRef(createController());

  const animation: AnimationObject = {
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    entryDelay: 'delay-1s',
    exitDelay: 'delay-1s',
    entrySpeed: 'fast',
    exitSpeed: 'fast',
    controller: controllerRef.current,
  };

  const messages = [
    'Welcome to Inithium',
    'Animations are working',
    'Exit → Enter sequencing',
    'Delays applied correctly',
  ];

  const handleNext = async () => {
    await controllerRef.current.triggerExit();
    setIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <Box direction="col" className="p-8 gap-4">
      <Box animation={animation}>
        <Text size="2xl" weight="bold" color="primary">
          {messages[index]}
        </Text>
      </Box>

      <Box direction="row" gap="4">
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>

        <button
          onClick={() => setIndex(0)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
      </Box>
    </Box>
  );
}

export default App;
