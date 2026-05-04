import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@inithium/utils';
import { Box, Button, Text, Icon } from '@inithium/ui'; 
import { RootState, closeAlert } from '@inithium/store';

const POSITION_CLASSES: Record<string, string> = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
};

export const AlertComposite: React.FC = () => {
  const dispatch = useDispatch();
  const { open, severity, message, position, animationObject } = useSelector(
    (state: RootState) => state.alert
  );

  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (open) setIsRendered(true);
  }, [open]);

  const handleClose = useCallback(() => {
    dispatch(closeAlert());
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(handleClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, handleClose]);

  const onAnimationEnd = () => {
    if (!open) setIsRendered(false);
  };

  if (!isRendered) return null;

  const { entry, exit, entrySpeed, exitSpeed } = animationObject;

  return (
    <Box
      position="fixed"
      className={cn(
        "z-[9999] min-w-[320px] max-w-md shadow-lg animate__animated",
        open ? `animate__${entry}` : `animate__${exit}`,
        open ? (entrySpeed ? `animate__${entrySpeed}` : '') : (exitSpeed ? `animate__${exitSpeed}` : ''),
        POSITION_CLASSES[position]
      )}
      onAnimationEnd={onAnimationEnd} 
      bg={severity}
      rounded="md"
      p="4"
      align="center"
      justify="between"
      border
      borderColor={severity}
    >
      <Box align="center" gap="4" flex>
        <Text color={`${severity}-contrast` as any} weight="medium">
          {message}
        </Text>
      </Box>

      <Button
        variant="ghost"
        size="sm"
        color={`${severity}-contrast` as any}
        onClick={handleClose}
        className="ml-4 !p-1 border-none hover:bg-white/10"
      >
        <Icon name="XMarkIcon" size="sm" />
      </Button>
    </Box>
  );
};