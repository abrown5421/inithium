import { useEffect, useState } from 'react';

/**
 * A form field's error, which the user dismisses by editing the field (decisions 0055 and 0057). It shows
 * again when `error` changes (a new validation result) or when the field's form is submitted.
 * `getForm` must be stable; `active` is false while the field isn't mounted.
 */
export function useDismissibleError(
  error: boolean | string | undefined,
  getForm: () => HTMLFormElement | null | undefined,
  active: boolean,
) {
  const [dismissed, setDismissed] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setDismissed(false);
  }

  useEffect(() => {
    const form = getForm();
    if (!active || !form) return;
    const reset = () => setDismissed(false);
    form.addEventListener('submit', reset);
    return () => form.removeEventListener('submit', reset);
  }, [active, getForm]);

  const shown = Boolean(error) && !dismissed;
  return {
    /** Whether the error is showing. */
    shown,
    /** The error message, when one is showing. */
    message: shown && typeof error === 'string' ? error : undefined,
    /** Hides the error until it changes or the form submits. Call it when the user edits the field. */
    dismiss: () => setDismissed(true),
  };
}
