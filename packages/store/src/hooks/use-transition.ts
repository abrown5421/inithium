import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnimationController, AnimationPhase } from '@inithium/types';
import { AppDispatch, RootState } from '../store.js';
import { commitTransition, enterComplete } from '../slices/transition.slice.js';

const ANIMATION_DURATION_MS = 600; 

export const usePageTransition = (): {
  controller: AnimationController;
  phase: AnimationPhase;
  activePage: string | null;
  pendingPage: string | null;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { phase, activePage, pendingPage } = useSelector(
    (state: RootState) => state.transition,
  );

  const exitResolveRef = useRef<(() => void) | null>(null);

  const triggerExit = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      exitResolveRef.current = resolve;
      setTimeout(async () => {
        exitResolveRef.current?.();
        exitResolveRef.current = null;
        await dispatch(commitTransition());
        resolve();
      }, ANIMATION_DURATION_MS);
    });
  }, [dispatch]);

  const triggerEnter = useCallback(() => {
    setTimeout(() => {
      dispatch(enterComplete());
    }, ANIMATION_DURATION_MS);
  }, [dispatch]);

  const controller: AnimationController = {
    phase,
    triggerExit,
    triggerEnter,
  };

  return { controller, phase, activePage, pendingPage };
};