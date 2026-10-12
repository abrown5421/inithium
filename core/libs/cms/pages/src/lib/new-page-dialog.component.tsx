import { useState, type FormEvent } from 'react';
import { pageCreateSchema, pageDuplicateSchema, pathFromTitle, type Page } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useCreatePageMutation,
  useDuplicatePageMutation,
  useGetPageTemplatesQuery,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Container, Input, Loader, Select, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

type Field = 'title' | 'path' | 'template' | 'layout';
const FIELDS: readonly Field[] = ['title', 'path', 'template', 'layout'];

/** Friendly names for layout keys; unknown keys show as they are. */
const LAYOUT_LABELS: Record<string, string> = {
  'full-width': 'Full width: sections run edge to edge',
  default: 'Standard: padded, with the footer',
  bare: 'Focused: a centred card, no footer',
};

export type NewPageDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Duplicates this page instead of creating one from a template. */
  source?: Page | null;
  /** Called with the new page once it's created. */
  onCreated: (page: Page) => void;
};

type Values = { title: string; path: string; template: string; layout: string };

/**
 * Creates a page from a reusable template, or duplicates one (decision 0093): a title, an address suggested from it
 * (until it's edited), and, for a new page, the template and its layout. New pages start unpublished and out of
 * menus. Problems show like every form's: a red alert, each field's reason and the first field focused.
 */
export function NewPageDialog({ open, onClose, source, onCreated }: NewPageDialogProps) {
  const templates = useGetPageTemplatesQuery(undefined, { skip: !open });
  const [createPage, creating] = useCreatePageMutation();
  const [duplicatePage, duplicating] = useDuplicatePageMutation();
  const { show: showAlert } = useAlerts();

  const firstTemplate = templates.data?.[0];
  const startValues = (): Values =>
    source
      ? { title: `${source.title} (copy)`, path: pathFromTitle(`${source.title} copy`), template: source.template, layout: source.layout }
      : { title: '', path: '', template: firstTemplate?.key ?? '', layout: firstTemplate?.layouts[0] ?? '' };

  // Each opening starts afresh: with the source's details when duplicating.
  const [openedFor, setOpenedFor] = useState<{ open: boolean; source?: Page | null; template?: string }>({ open: false });
  const [values, setValues] = useState<Values>(startValues);
  const [pathEdited, setPathEdited] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  if (open !== openedFor.open || source !== openedFor.source || firstTemplate?.key !== openedFor.template) {
    setOpenedFor({ open, source, template: firstTemplate?.key });
    if (open) {
      setValues(startValues());
      setPathEdited(Boolean(source));
      setErrors({});
    }
  }

  const template = templates.data?.find((candidate) => candidate.key === values.template);
  const change = (next: Partial<Values>) => setValues((current) => ({ ...current, ...next }));
  const field = (name: 'title' | 'path') => ({ name, value: values[name], error: errors[name] });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fail = (found: FieldErrors<Field>, title: string, message: string) => {
      setErrors(found);
      showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
      focusFirstError(FIELDS, found, form);
    };
    const invalid = (found: FieldErrors<Field>) => fail(found, 'There were problems with this page', 'Check the highlighted fields.');

    const parsed = source
      ? pageDuplicateSchema.safeParse({ title: values.title, path: values.path })
      : pageCreateSchema.safeParse(values);
    if (!parsed.success) return invalid(fieldErrorsFrom<Field>(parsed.error.issues));

    setErrors({});
    try {
      const page = source
        ? await duplicatePage({ id: source.id, copy: parsed.data }).unwrap()
        : await createPage(pageCreateSchema.parse(parsed.data)).unwrap();
      showAlert({
        color: 'green',
        icon: 'circle-check',
        title: source ? 'Page duplicated' : 'Page created',
        message: `${page.title} is ready to edit. It stays unpublished until you publish it.`,
      });
      onCreated(page);
    } catch (saveError) {
      const failure = readApiFailure(saveError);
      if (failure.issues) return invalid(fieldErrorsFrom<Field>(failure.issues));
      const message = failure.message ?? 'Something went wrong. Please try again.';
      if (failure.field && (FIELDS as readonly string[]).includes(failure.field)) {
        return fail({ [failure.field]: message }, 'We couldn’t create the page', message);
      }
      fail({}, 'We couldn’t create the page', message);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={source ? `Duplicate “${source.title}”` : 'New page'}
      description={
        source
          ? 'A copy of its look, settings and draft, under a new title and address.'
          : 'Pick a template, then give the page a title and an address.'
      }
      maxWidth={560}
    >
      {templates.isLoading && !source ? (
        <Container flex={{ justify: 'center' }} padding={{ all: 24 }}>
          <Loader size={28} label="Loading templates" />
        </Container>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Container flex={{ direction: 'column', gap: 20 }}>
            {!source && (
              <Select
                name="template"
                label="Template"
                value={values.template}
                onValueChange={(key) => {
                  const next = templates.data?.find((candidate) => candidate.key === key);
                  change({ template: key, layout: next?.layouts[0] ?? '' });
                }}
                options={(templates.data ?? []).map((candidate) => ({ value: candidate.key, label: candidate.label }))}
                helperText={template?.description}
                error={errors.template}
              />
            )}
            <Input
              label="Title"
              required
              {...field('title')}
              onValueChange={(title) => change(pathEdited ? { title } : { title, path: pathFromTitle(title) })}
            />
            <Input
              label="Address"
              required
              helperText="Where the page lives on the site, e.g. /about-us."
              {...field('path')}
              onValueChange={(path) => {
                setPathEdited(true);
                change({ path });
              }}
            />
            {!source && template && (
              <Select
                name="layout"
                label="Layout"
                value={values.layout}
                onValueChange={(layout) => change({ layout })}
                options={template.layouts.map((layout) => ({ value: layout, label: LAYOUT_LABELS[layout] ?? layout }))}
                disabled={template.layouts.length === 1}
                error={errors.layout}
              />
            )}
            {!source && templates.isError && (
              <Text as="p" fontSize={14} textColor={{ color: 'red', intensity: 600 }}>
                We couldn’t load the templates. Close this and try again.
              </Text>
            )}
            <Container flex={{ justify: 'end', gap: 8 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" leadingIcon={source ? 'copy' : 'plus'} loading={creating.isLoading || duplicating.isLoading}>
                {source ? 'Duplicate page' : 'Create page'}
              </Button>
            </Container>
          </Container>
        </form>
      )}
    </Modal>
  );
}
