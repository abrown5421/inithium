import { useState, type FormEvent, type ReactNode } from 'react';
import {
  entranceAnimations,
  exitAnimations,
  navigationAllowed,
  navLocations,
  pageUpdateSchema,
  type ColorValue,
  type NavLocation,
  type Page,
  type PageAnimation,
  type PageAudience,
  type PageUpdate,
} from '@inithium/shared-contracts';
import { fieldErrorsFrom, focusFirstError, readApiFailure, useAlerts, useUpdatePageMutation, type FieldErrors } from '@inithium/shared-data-access';
import { Button, Checkbox, Container, Input, RadioGroup, Select, Switch, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { ColorPicker, IconPicker, Modal, Tabs, type PickedColor } from '@inithium/shared-ui-composites';

type TabKey = 'general' | 'appearance' | 'access' | 'navigation' | 'seo';
type Draft = Required<Pick<PageUpdate, 'title' | 'status' | 'layout' | 'audience' | 'navigation' | 'seo'>> & {
  bgColor: ColorValue | null;
  textColor: ColorValue | null;
  animation: PageAnimation | null;
};

/** Every field the editor shows, in tab and form order, keyed as validation reports them (decision 0086). */
const FIELDS = [
  'title', 'layout', 'status',
  'bgColor', 'textColor', 'animation.entrance', 'animation.exit',
  'audience',
  'navigation.locations', 'navigation.label', 'navigation.order', 'navigation.icon', 'navigation.group',
  'seo.title', 'seo.description',
] as const;
type Field = (typeof FIELDS)[number];
const TAB_OF = (field: string): TabKey =>
  field.startsWith('navigation') ? 'navigation'
  : field.startsWith('seo') ? 'seo'
  : field === 'audience' ? 'access'
  : ['bgColor', 'textColor'].includes(field) || field.startsWith('animation') ? 'appearance'
  : 'general';

const LOCATION_LABELS: Record<NavLocation, string> = {
  'primary-nav': 'Main menu (Navbar)',
  'profile-nav': 'Account menu (Navbar drawer)',
  'primary-footer': 'Footer, main row',
  'secondary-footer': 'Footer, small row',
};
const AUDIENCES: { value: PageAudience; label: string; helperText: string; icon: IconName }[] = [
  { value: 'all', label: 'Everyone', helperText: 'Signed in or not.', icon: 'globe' },
  { value: 'signed-out', label: 'Signed-out visitors only', helperText: 'Signed-in users are sent Home.', icon: 'log-in' },
  { value: 'signed-in', label: 'Signed-in users only', helperText: 'Visitors are sent to Login first.', icon: 'lock' },
];
const SPEEDS = ['faster', 'fast', 'slow', 'slower'] as const;
const DEFAULT = 'default';

const draftOf = (page: Page): Draft => ({
  title: page.title,
  status: page.status,
  layout: page.layout,
  bgColor: page.bgColor ?? null,
  textColor: page.textColor ?? null,
  animation: page.animation ?? null,
  audience: page.audience,
  navigation: page.navigation,
  seo: page.seo,
});

/** A colour value as ColorPicker's value: a name means its 500, and 'transparent' shows nothing picked. */
const toPicked = (value: ColorValue | null): PickedColor | undefined =>
  !value || value === 'transparent' ? undefined : typeof value === 'string' ? { color: value, intensity: 500 } : value;

export type PageEditorProps = {
  /** The page being edited; the editor opens while there is one. */
  page: Page | null;
  onClose: () => void;
  /** Whether the user may publish and unpublish (pages.publish). */
  canPublish: boolean;
};

/**
 * The CMS's page editor (decision 0086): a Modal with General, Appearance, Access, Navigation and SEO tabs over a
 * draft of the page. Save validates with the shared contract and reports problems like `web`'s forms: a red alert,
 * each field's reason, and the first one's tab and field focused. Cancel throws the draft away.
 */
export function PageEditor({ page, onClose, canPublish }: PageEditorProps) {
  const [shown, setShown] = useState(page);
  const [draft, setDraft] = useState<Draft | null>(page ? draftOf(page) : null);
  const [tab, setTab] = useState<TabKey>('general');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  // A new page to edit starts a fresh draft; closing keeps the last one, so the Modal can animate out with it.
  if (page && page !== shown) {
    setShown(page);
    setDraft(draftOf(page));
    setTab('general');
    setErrors({});
  }
  const [updatePage, { isLoading }] = useUpdatePageMutation();
  const { show: showAlert } = useAlerts();

  const target = page ?? shown;
  if (!target || !draft) return null;

  const change = (next: Partial<Draft>) => setDraft({ ...draft, ...next });
  const changeNavigation = (next: Partial<Draft['navigation']>) => change({ navigation: { ...draft.navigation, ...next } });
  const changeSeo = (next: Partial<Draft['seo']>) => change({ seo: { ...draft.seo, ...next } });
  const changeAnimation = (key: 'entrance' | 'exit', value: PageAnimation['entrance'] | PageAnimation['exit'] | undefined) => {
    const next = { ...(draft.animation ?? {}), [key]: value };
    if (!value) delete next[key];
    change({ animation: next.entrance || next.exit ? next : null });
  };
  const error = (field: Field) => errors[field];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fail = (found: FieldErrors<Field>, title: string, message: string) => {
      setErrors(found);
      showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
      const first = FIELDS.find((field) => found[field]);
      if (!first) return;
      setTab(TAB_OF(first));
      // Focus once the tab with the field has rendered.
      requestAnimationFrame(() => focusFirstError(FIELDS, found, form));
    };

    const { label, icon, group, ...navigation } = draft.navigation;
    const update: PageUpdate = {
      ...draft,
      navigation: { ...navigation, ...(label?.trim() ? { label: label.trim() } : {}), ...(icon ? { icon } : {}), ...(group?.trim() ? { group: group.trim() } : {}) },
      seo: {
        ...(draft.seo.title?.trim() ? { title: draft.seo.title.trim() } : {}),
        ...(draft.seo.description?.trim() ? { description: draft.seo.description.trim() } : {}),
      },
      // Only an actual change of status needs pages.publish.
      ...(draft.status === target.status ? { status: undefined } : {}),
    };
    if (update.status === undefined) delete update.status;
    const parsed = pageUpdateSchema.safeParse(update);
    if (!parsed.success) return fail(fieldErrorsFrom<Field>(parsed.error.issues), 'There were problems with this page', 'Check the highlighted fields.');
    if (!navigationAllowed({ path: target.path, template: target.template, navigation: parsed.data.navigation ?? draft.navigation })) {
      return fail({ 'navigation.locations': 'This page has parameters in its path, so it can only appear in the account menu.' }, 'There were problems with this page', 'Check the highlighted fields.');
    }

    setErrors({});
    try {
      await updatePage({ id: target.id, update: parsed.data }).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Page saved', message: `${draft.title} is up to date.` });
      onClose();
    } catch (saveError) {
      const failure = readApiFailure(saveError);
      if (failure.issues) return fail(fieldErrorsFrom<Field>(failure.issues), "We couldn't save this page", 'Check the highlighted fields.');
      fail({}, "We couldn't save this page", failure.message ?? 'Something went wrong. Please try again.');
    }
  };

  const tabs: { value: TabKey; label: string; content: ReactNode }[] = [
    {
      value: 'general',
      label: 'General',
      content: (
        <Container flex={{ direction: 'column', gap: 20 }} padding={{ top: 20 }}>
          <Input name="title" label="Title" required value={draft.title} onValueChange={(title) => change({ title })} error={error('title')} />
          <Input
            label="Path"
            value={target.path}
            disabled
            helperText={target.protected ? 'Set by the developer; it can’t be changed here.' : undefined}
          />
          <Select
            name="layout"
            label="Layout"
            value={draft.layout}
            onValueChange={(layout) => change({ layout })}
            options={target.layouts.map((layout) => ({ value: layout, label: layout }))}
            disabled={target.layouts.length === 1}
            helperText={target.layouts.length === 1 ? 'This page’s template has one layout.' : undefined}
            error={error('layout')}
          />
          {canPublish ? (
            <Switch label="Published" checked={draft.status === 'published'} onCheckedChange={(on) => change({ status: on ? 'published' : 'unpublished' })} helperText="Unpublished pages show Not Found on the site." />
          ) : (
            <Tooltip content="Publishing needs an admin or the owner.">
              <span>
                <Switch label="Published" checked={draft.status === 'published'} disabled />
              </span>
            </Tooltip>
          )}
        </Container>
      ),
    },
    {
      value: 'appearance',
      label: 'Appearance',
      content: (
        <Container flex={{ direction: 'column', gap: 20 }} padding={{ top: 20 }}>
          {(['bgColor', 'textColor'] as const).map((key) => (
            <Container key={key} flex={{ direction: 'column', gap: 8 }}>
              <Switch
                label={key === 'bgColor' ? 'Custom background' : 'Custom text colour'}
                helperText="Off uses the page’s default."
                checked={draft[key] !== null}
                onCheckedChange={(on) => change({ [key]: on ? { color: 'surface', intensity: key === 'bgColor' ? 50 : 950 } : null })}
              />
              {draft[key] !== null && (
                <ColorPicker
                  name={key}
                  label={key === 'bgColor' ? 'Background' : 'Text colour'}
                  value={toPicked(draft[key])}
                  onValueChange={(value) => change({ [key]: value })}
                  error={error(key)}
                />
              )}
            </Container>
          ))}
          {(['entrance', 'exit'] as const).map((key) => {
            const current = draft.animation?.[key];
            const names = key === 'entrance' ? entranceAnimations : exitAnimations;
            return (
              <Container key={key} grid={{ columns: 2, gap: 12 }}>
                <Select
                  name={`animation.${key}`}
                  label={key === 'entrance' ? 'Entrance' : 'Exit'}
                  value={current?.name ?? DEFAULT}
                  onValueChange={(name) =>
                    changeAnimation(key, name === DEFAULT ? undefined : ({ ...(current ?? {}), name } as PageAnimation['entrance']))
                  }
                  options={[{ value: DEFAULT, label: 'Default' }, ...names.map((name) => ({ value: name, label: name }))]}
                  error={error(`animation.${key}`)}
                />
                <Select
                  label="Speed"
                  value={typeof current?.speed === 'string' ? current.speed : DEFAULT}
                  disabled={!current}
                  onValueChange={(speed) => current && changeAnimation(key, { ...current, speed: speed === DEFAULT ? undefined : (speed as (typeof SPEEDS)[number]) })}
                  options={[{ value: DEFAULT, label: 'Normal' }, ...SPEEDS.map((speed) => ({ value: speed, label: speed }))]}
                />
              </Container>
            );
          })}
        </Container>
      ),
    },
    {
      value: 'access',
      label: 'Access',
      content: (
        <Container padding={{ top: 20 }}>
          <RadioGroup
            name="audience"
            label="Who can view this page"
            variant="card"
            value={draft.audience}
            onValueChange={(audience: string) => change({ audience: audience as PageAudience })}
            options={AUDIENCES}
            error={error('audience')}
          />
        </Container>
      ),
    },
    {
      value: 'navigation',
      label: 'Navigation',
      content: (
        <Container flex={{ direction: 'column', gap: 20 }} padding={{ top: 20 }}>
          <Container flex={{ direction: 'column', gap: 4 }}>
            <Text as="span" fontSize={14} fontWeight={600}>
              Menus
            </Text>
            {navLocations.map((location) => {
              const allowed = navigationAllowed({ path: target.path, template: target.template, navigation: { locations: [location] } });
              const checked = draft.navigation.locations.includes(location);
              return (
                <Checkbox
                  key={location}
                  name={location === navLocations[0] ? 'navigation.locations' : undefined}
                  label={LOCATION_LABELS[location]}
                  checked={checked}
                  disabled={!allowed && !checked}
                  helperText={allowed ? undefined : 'Pages with parameters in their path can’t appear here.'}
                  onCheckedChange={(on) =>
                    changeNavigation({
                      locations: on === true ? [...draft.navigation.locations, location] : draft.navigation.locations.filter((item) => item !== location),
                    })
                  }
                />
              );
            })}
            {error('navigation.locations') && (
              <Text as="p" fontSize={12} textColor={{ color: 'red', intensity: 500 }}>
                {error('navigation.locations')}
              </Text>
            )}
          </Container>
          <Input
            name="navigation.label"
            label="Menu label"
            placeholder={draft.title}
            helperText="Leave empty to use the title."
            value={draft.navigation.label ?? ''}
            onValueChange={(label) => changeNavigation({ label })}
            error={error('navigation.label')}
          />
          <Input
            name="navigation.order"
            label="Order"
            type="number"
            helperText="Lower numbers come first."
            value={String(draft.navigation.order)}
            onValueChange={(order) => changeNavigation({ order: order === '' ? Number.NaN : Number(order) })}
            error={error('navigation.order')}
          />
          <IconPicker
            name="navigation.icon"
            label="Menu icon"
            value={draft.navigation.icon as IconName | undefined}
            onValueChange={(icon) => changeNavigation({ icon })}
            error={error('navigation.icon')}
          />
          <Input
            name="navigation.group"
            label="Group"
            helperText="Main-menu pages with the same group share one dropdown."
            value={draft.navigation.group ?? ''}
            onValueChange={(group) => changeNavigation({ group })}
            error={error('navigation.group')}
          />
        </Container>
      ),
    },
    {
      value: 'seo',
      label: 'SEO',
      content: (
        <Container flex={{ direction: 'column', gap: 20 }} padding={{ top: 20 }}>
          <Input
            name="seo.title"
            label="Search title"
            placeholder={draft.title}
            helperText={`${(draft.seo.title ?? '').length}/70. Leave empty to use the title.`}
            value={draft.seo.title ?? ''}
            onValueChange={(title) => changeSeo({ title })}
            error={error('seo.title')}
          />
          <Input
            name="seo.description"
            label="Search description"
            helperText={`${(draft.seo.description ?? '').length}/160. Shown under the title in search results.`}
            value={draft.seo.description ?? ''}
            onValueChange={(description) => changeSeo({ description })}
            error={error('seo.description')}
          />
        </Container>
      ),
    },
  ];

  return (
    <Modal
      open={page !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Edit “${target.title}”`}
      description={target.protected ? `${target.path} · a site page: it can be unpublished but not deleted.` : target.path}
      maxWidth={640}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)} aria-label="Page settings" tabs={tabs} />
        <Container flex={{ justify: 'end', gap: 8 }} margin={{ top: 24 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Save changes
          </Button>
        </Container>
      </form>
    </Modal>
  );
}
