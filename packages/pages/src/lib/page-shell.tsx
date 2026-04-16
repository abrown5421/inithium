import React, { Suspense } from 'react';
import { Box } from '@inithium/ui';
import type { AnimationController, PageDefinition } from '@inithium/types';

interface PageShellProps {
  page: PageDefinition;
  controller: AnimationController;
}

export const PageShell: React.FC<PageShellProps> = ({ page, controller }) => {
  const animation = {
    entry: page.entry,
    exit: page.exit,
    entrySpeed: page.entrySpeed,
    exitSpeed: page.exitSpeed,
    controller,
  };

  return (
    <Box
      as="main"
      display="flex"
      direction="col"
      fullWidth
      fullHeight
      bg={page.bg}
      color={page.color}
      animation={animation}
    >
      <Suspense fallback={null}>
        <page.component />
      </Suspense>
    </Box>
  );
};