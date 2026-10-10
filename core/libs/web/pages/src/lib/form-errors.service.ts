/** Each field's first problem, keyed by field name: a message, or true to mark it without one. */
export type FieldErrors<Field extends string> = Partial<Record<Field, string | true>>;

type Issue = { path: readonly PropertyKey[]; message: string };

/** Turns validation issues (from a Zod parse, or the API's 400 `issues`) into each field's first message. */
export function fieldErrorsFrom<Field extends string>(issues: readonly Issue[]): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) errors[field as Field] = issue.message;
  }
  return errors;
}

/** What a failed API call says: its status, message, `issues` and the `field` it names, when there are any. */
export function readApiFailure(error: unknown): { status?: number; message?: string; issues?: Issue[]; field?: string } {
  if (!error || typeof error !== 'object') return {};
  const { status, data } = error as { status?: unknown; data?: unknown };
  const body = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return {
    status: typeof status === 'number' ? status : undefined,
    message: typeof body['message'] === 'string' ? body['message'] : undefined,
    issues: Array.isArray(body['issues']) ? (body['issues'] as Issue[]) : undefined,
    field: typeof body['field'] === 'string' ? body['field'] : undefined,
  };
}

/** Moves focus to the first field, in form order, that has an error. Fields are found by their `name`. */
export function focusFirstError<Field extends string>(order: readonly Field[], errors: FieldErrors<Field>, form: HTMLFormElement) {
  const first = order.find((field) => errors[field]);
  const element = first ? form.elements.namedItem(first) : null;
  if (element instanceof HTMLElement) element.focus();
}
