import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AlertContent } from '@inithium/shared-contracts';
import { dismissAlert, removeAlert, selectAlerts, showAlert, type AlertsState } from './alerts.slice';

/**
 * The global alert queue (decision 0066). Spread `stackProps` onto the app's AlertStack; call `show()` from
 * anywhere (it returns the new alert's id), or dispatch `showAlert(content)` directly.
 */
export function useAlerts() {
  const dispatch = useDispatch();
  const alerts = useSelector((state: { alerts: AlertsState }) => selectAlerts(state));

  const show = useCallback((content: AlertContent) => dispatch(showAlert(content)).payload.id, [dispatch]);
  const dismiss = useCallback((id: string) => dispatch(dismissAlert(id)), [dispatch]);
  const remove = useCallback((id: string) => dispatch(removeAlert(id)), [dispatch]);
  const stackProps = useMemo(() => ({ alerts, onDismiss: dismiss, onRemove: remove }), [alerts, dismiss, remove]);

  return { alerts, show, dismiss, stackProps };
}
