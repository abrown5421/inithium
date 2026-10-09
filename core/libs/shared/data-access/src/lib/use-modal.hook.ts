import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal, selectOpenModalId, type ModalsState } from './modals.slice';

/**
 * Connects one modal, by id, to the global modal state (decision 0065). Spread `modalProps` onto the Modal, and
 * call `open()` or `close()` from anywhere; `dispatch(openModal(id))` works too.
 */
export function useModal(id: string) {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: { modals: ModalsState }) => selectOpenModalId(state) === id);

  const open = useCallback(() => dispatch(openModal(id)), [dispatch, id]);
  const close = useCallback(() => dispatch(closeModal(id)), [dispatch, id]);
  const onOpenChange = useCallback((next: boolean) => (next ? open() : close()), [open, close]);
  const modalProps = useMemo(() => ({ open: isOpen, onOpenChange }), [isOpen, onOpenChange]);

  return { isOpen, open, close, modalProps };
}
