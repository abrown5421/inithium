import React, { Suspense } from 'react';
import { Box } from '../../components/box/box';
import type { AnimationController, PageDefinition } from '@inithium/types';

interface PageShellProps {
  page: PageDefinition;
  controller: AnimationController;
  footer?: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ page, controller, footer }) => {
  const animation = {
    entry: page.entry,
    exit: page.exit,
    entrySpeed: page.entrySpeed,
    exitSpeed: page.exitSpeed,
    controller,
  };

  const centeringProps = page.centered
    ? { align: 'center' as const, justify: 'center' as const }
    : {};

  return (
    <Box
      as="main"
      display="flex"
      direction="col"
      fullWidth
      bg={page.bg}
      color={page.color}
      animation={animation}
    >
      <Box
        display="flex"
        direction="col"
        fullWidth
        {...centeringProps}
        className="h-shell shrink-0"
      >
        <Suspense fallback={null}>
          <page.component />
        </Suspense>
      </Box>

      {footer}
    </Box>
  );
};