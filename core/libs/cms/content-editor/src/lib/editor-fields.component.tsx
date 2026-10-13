import { pathHasParams, type ColorValue, type ContentLink, type Page } from '@inithium/shared-contracts';
import { Container, Input, Select, Switch } from '@inithium/shared-ui-components';
import { ColorPicker, type PickedColor } from '@inithium/shared-ui-composites';

/** A colour value as ColorPicker's value: a name means its 500, and 'transparent' shows nothing picked. */
const toPicked = (value: ColorValue | undefined): PickedColor | undefined =>
  !value || value === 'transparent' ? undefined : typeof value === 'string' ? { color: value, intensity: 500 } : value;

export type ColorFieldProps = {
  label: string;
  value: ColorValue | undefined;
  onChange: (value: ColorValue | undefined) => void;
  /** Picked when the colour is first switched on. */
  initial: PickedColor;
  /** Explains what "off" means, e.g. 'Off uses the section’s text colour.' */
  helperText: string;
};

/** A colour that's either the default (off) or picked from the theme and Tailwind colours. */
export function ColorField({ label, value, onChange, initial, helperText }: ColorFieldProps) {
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Switch label={`Custom ${label.toLowerCase()}`} helperText={helperText} checked={value !== undefined} onCheckedChange={(on) => onChange(on ? initial : undefined)} />
      {value !== undefined && <ColorPicker label={label} value={toPicked(value)} onValueChange={(picked) => onChange(picked)} />}
    </Container>
  );
}

export type LinkFieldProps = {
  value: ContentLink;
  onChange: (link: ContentLink) => void;
  /** Every page, for linking to one. Pages with parameters in their path can't be linked to. */
  pages: Page[];
  /** The address field's problem, if any. */
  error?: string;
};

/** Where a link goes: one of the site's pages (by id, so it survives the page moving), or an address. */
export function LinkField({ value, onChange, pages, error }: LinkFieldProps) {
  const linkable = pages.filter((page) => !pathHasParams(page.path));
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Select
        label="Links to"
        value={value.type}
        onValueChange={(type) =>
          onChange(type === 'page' ? { type: 'page', pageId: linkable[0]?.id ?? '' } : { type: 'url', href: 'https://' })
        }
        options={[
          { value: 'page', label: 'A page on this site', icon: 'file-text' },
          { value: 'url', label: 'An address', icon: 'globe' },
        ]}
      />
      {value.type === 'page' ? (
        <Select
          label="Page"
          value={value.pageId}
          onValueChange={(pageId) => onChange({ type: 'page', pageId })}
          options={linkable.map((page) => ({ value: page.id, label: `${page.title} (${page.path})` }))}
          helperText={pages.find((page) => page.id === value.pageId)?.status === 'unpublished' ? 'Unpublished: the link stays plain text until it’s published.' : undefined}
          error={error}
        />
      ) : (
        <>
          <Input
            label="Address"
            helperText="Starting with https://, mailto: or tel:"
            value={value.href}
            onValueChange={(href) => onChange({ ...value, href })}
            error={error}
          />
          <Switch label="Open in a new tab" checked={Boolean(value.newTab)} onCheckedChange={(newTab) => onChange({ type: 'url', href: value.href, ...(newTab ? { newTab } : {}) })} />
        </>
      )}
    </Container>
  );
}
