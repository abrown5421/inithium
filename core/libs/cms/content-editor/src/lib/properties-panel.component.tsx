import {
  breakpoints,
  createContentId,
  entranceAnimations,
  sectionLayouts,
  type ContentAlign,
  type ContentBlock,
  type ContentButton,
  type ContentSection,
  type Page,
  type SectionLayout,
} from '@inithium/shared-contracts';
import { Container, Input, Select, Slider, Switch, Text, type IconName } from '@inithium/shared-ui-components';
import { AutoIncrementingList, IconPicker, PolyBanner } from '@inithium/shared-ui-composites';
import { BLOCK_TYPES, LAYOUT_LABELS } from './content-document.service';
import { ColorField, LinkField } from './editor-fields.component';

/** Each field's problem, keyed by its path within the selected section or block, e.g. 'text' or 'buttons.0.label'. */
export type FieldProblems = Record<string, string>;

const ALIGNS: { value: ContentAlign; label: string }[] = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Centre' },
  { value: 'end', label: 'End' },
];
const NONE = 'none';

function Heading({ children }: { children: string }) {
  return (
    <Text as="h3" fontSize={12} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }} margin={{ top: 8 }}>
      {children.toUpperCase()}
    </Text>
  );
}

function AlignField({ value, onChange, label = 'Alignment' }: { value: ContentAlign | undefined; onChange: (align: ContentAlign) => void; label?: string }) {
  return <Select label={label} value={value ?? 'start'} onValueChange={(next) => onChange(next as ContentAlign)} options={ALIGNS} />;
}

// --- Sections ---

export type SectionPropertiesProps = {
  section: ContentSection;
  onChange: (changes: Partial<Omit<ContentSection, 'id' | 'columns' | 'layout'>>) => void;
  onLayout: (layout: SectionLayout) => void;
  problems: FieldProblems;
};

/** A section's settings: layout, background, colours, spacing, stacking, entrance animation and anchor. */
export function SectionProperties({ section, onChange, onLayout, problems }: SectionPropertiesProps) {
  return (
    <Container flex={{ direction: 'column', gap: 18 }}>
      <Select
        label="Layout"
        value={section.layout}
        onValueChange={(layout) => onLayout(layout as SectionLayout)}
        options={(Object.keys(sectionLayouts) as SectionLayout[]).map((layout) => ({ value: layout, label: LAYOUT_LABELS[layout] }))}
        helperText="Fewer columns move the extra columns’ blocks into the last one."
      />
      <Heading>Background</Heading>
      <ColorField label="Background" value={section.bgColor} onChange={(bgColor) => onChange({ bgColor })} initial={{ color: 'surface', intensity: 100 }} helperText="Off leaves it see-through." />
      <Switch
        label="Patterned banner background"
        helperText="Drawn over the background colour."
        checked={section.banner !== undefined}
        onCheckedChange={(on) =>
          onChange({
            banner: on
              ? { cellSize: 90, variance: 0.7, xColors: [{ color: 'primary', intensity: 700 }, { color: 'secondary', intensity: 500 }], seed: createContentId() }
              : undefined,
          })
        }
      />
      {section.banner && (
        <PolyBanner value={section.banner} onChange={(banner) => onChange({ banner })} editable height={90} radius={{ all: 8 }} label="Section background" />
      )}
      <ColorField label="Text colour" value={section.textColor} onChange={(textColor) => onChange({ textColor })} initial={{ color: 'surface', intensity: 950 }} helperText="Off uses the page’s text colour." />
      <Heading>Spacing</Heading>
      <Slider label="Space above and below" min={0} max={200} step={4} value={section.padding?.y ?? 48} formatValue={(value) => `${value}px`} onValueChange={(y) => onChange({ padding: { ...section.padding, y } })} />
      <Slider label="Space at the sides" min={0} max={200} step={4} value={section.padding?.x ?? 24} formatValue={(value) => `${value}px`} onValueChange={(x) => onChange({ padding: { ...section.padding, x } })} />
      {section.columns.length > 1 && (
        <Slider label="Space between columns" min={0} max={120} step={4} value={section.gap ?? 32} formatValue={(value) => `${value}px`} onValueChange={(gap) => onChange({ gap })} />
      )}
      <Switch
        label="Limit the content’s width"
        helperText="Off runs the content full width."
        checked={section.maxWidth !== undefined}
        onCheckedChange={(on) => onChange({ maxWidth: on ? 1200 : undefined })}
      />
      {section.maxWidth !== undefined && (
        <Slider label="Widest content" min={320} max={2000} step={20} value={section.maxWidth} formatValue={(value) => `${value}px`} onValueChange={(maxWidth) => onChange({ maxWidth })} />
      )}
      {section.columns.length > 1 && (
        <>
          <Select
            label="Columns line up at the"
            value={section.verticalAlign ?? 'start'}
            onValueChange={(verticalAlign) => onChange({ verticalAlign: verticalAlign as ContentSection['verticalAlign'] })}
            options={[
              { value: 'start', label: 'Top' },
              { value: 'center', label: 'Middle' },
              { value: 'end', label: 'Bottom' },
              { value: 'stretch', label: 'Full height' },
            ]}
          />
          <Select
            label="Stack the columns below"
            value={section.stackBelow ?? 'md'}
            onValueChange={(stackBelow) => onChange({ stackBelow: stackBelow as ContentSection['stackBelow'] })}
            options={breakpoints.map((breakpoint) => ({ value: breakpoint, label: `${breakpoint} (${({ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const)[breakpoint]}px)` }))}
          />
        </>
      )}
      <Heading>More</Heading>
      <Select
        label="Entrance animation"
        value={section.entrance?.name ?? NONE}
        onValueChange={(name) => onChange({ entrance: name === NONE ? undefined : { name: name as (typeof entranceAnimations)[number], when: 'inView' } })}
        options={[{ value: NONE, label: 'None' }, ...entranceAnimations.map((name) => ({ value: name, label: name }))]}
        helperText="Plays the first time the section scrolls into view."
      />
      <Input
        label="Anchor"
        helperText="Links to #anchor scroll here. Lowercase words joined by hyphens."
        value={section.anchor ?? ''}
        onValueChange={(anchor) => onChange({ anchor: anchor || undefined })}
        error={problems['anchor']}
      />
    </Container>
  );
}

// --- Blocks ---

export type BlockPropertiesProps = {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  pages: Page[];
  problems: FieldProblems;
  /** The other columns of the block's section, to move it to. */
  columns: { id: string; label: string }[];
  columnId: string;
  onMoveToColumn: (columnId: string) => void;
};

/** The selected block's settings, by type, then where it shows and which column it's in. */
export function BlockProperties({ block, onChange, pages, problems, columns, columnId, onMoveToColumn }: BlockPropertiesProps) {
  return (
    <Container flex={{ direction: 'column', gap: 18 }}>
      <BlockFields block={block} onChange={onChange} pages={pages} problems={problems} />
      <Heading>Where it shows</Heading>
      <Switch label="Hide on phones" checked={Boolean(block.hideOn?.phone)} onCheckedChange={(phone) => onChange({ ...block, hideOn: { ...block.hideOn, phone } })} />
      <Switch label="Hide on wider screens" checked={Boolean(block.hideOn?.desktop)} onCheckedChange={(desktop) => onChange({ ...block, hideOn: { ...block.hideOn, desktop } })} />
      {columns.length > 1 && (
        <Select label="Column" value={columnId} onValueChange={onMoveToColumn} options={columns.map((column) => ({ value: column.id, label: column.label }))} />
      )}
    </Container>
  );
}

function BlockFields({ block, onChange, pages, problems }: Omit<BlockPropertiesProps, 'columns' | 'columnId' | 'onMoveToColumn'>) {
  switch (block.type) {
    case 'heading':
      return (
        <>
          <Input label="Text" value={block.text} onValueChange={(text) => onChange({ ...block, text })} error={problems['text']} />
          <Select
            label="Level"
            value={String(block.level)}
            onValueChange={(level) => onChange({ ...block, level: Number(level) as 1 | 2 | 3 | 4 })}
            options={[
              { value: '1', label: 'Page title (h1): once per page' },
              { value: '2', label: 'Section heading (h2)' },
              { value: '3', label: 'Sub-heading (h3)' },
              { value: '4', label: 'Small heading (h4)' },
            ]}
          />
          <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
          <ColorField label="Colour" value={block.textColor} onChange={(textColor) => onChange({ ...block, textColor })} initial={{ color: 'primary', intensity: 700 }} helperText="Off uses the section’s text colour." />
        </>
      );
    case 'rich-text':
      return (
        <>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            Edit the text right in the preview, with the toolbar above it.
          </Text>
          <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
          <ColorField label="Colour" value={block.textColor} onChange={(textColor) => onChange({ ...block, textColor })} initial={{ color: 'surface', intensity: 800 }} helperText="Off uses the section’s text colour." />
        </>
      );
    case 'buttons':
      return (
        <>
          <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
          <AutoIncrementingList<ContentButton>
            items={block.buttons}
            onItemsChange={(buttons) => onChange({ ...block, buttons })}
            createItem={() => ({ id: createContentId(), label: 'Button', link: { type: 'url', href: 'https://example.com' }, variant: 'outlined' })}
            max={4}
            itemLabel="button"
            renderItem={(button, index, update) => (
              <Container
                flex={{ direction: 'column', gap: 12 }}
                padding={{ all: 12 }}
                radius={{ all: 8 }}
                borderWidth={{ all: 1 }}
                borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
              >
                <Input label={`Button ${index + 1}`} value={button.label} onValueChange={(label) => update({ ...button, label })} error={problems[`buttons.${index}.label`]} />
                <LinkField value={button.link} onChange={(link) => update({ ...button, link })} pages={pages} error={problems[`buttons.${index}.link.href`] ?? problems[`buttons.${index}.link.pageId`]} />
                <Select
                  label="Style"
                  value={button.variant ?? 'filled'}
                  onValueChange={(variant) => update({ ...button, variant: variant as ContentButton['variant'] })}
                  options={[
                    { value: 'filled', label: 'Filled' },
                    { value: 'outlined', label: 'Outlined' },
                    { value: 'ghost', label: 'Ghost' },
                    { value: 'link', label: 'Link' },
                  ]}
                />
                <IconPicker label="Icon" value={button.icon as IconName | undefined} onValueChange={(icon) => update({ ...button, icon })} />
              </Container>
            )}
          />
        </>
      );
    case 'feature':
      return (
        <>
          <IconPicker label="Icon" value={block.icon as IconName} onValueChange={(icon) => icon && onChange({ ...block, icon })} />
          <Input label="Title" value={block.title} onValueChange={(title) => onChange({ ...block, title })} error={problems['title']} />
          <Input label="Text" value={block.text ?? ''} onValueChange={(text) => onChange({ ...block, text: text || undefined })} error={problems['text']} />
          <Select
            label="Alignment"
            value={block.align ?? 'start'}
            onValueChange={(align) => onChange({ ...block, align: align as 'start' | 'center' })}
            options={[
              { value: 'start', label: 'Start' },
              { value: 'center', label: 'Centre' },
            ]}
          />
          <ColorField label="Icon colour" value={block.iconColor} onChange={(iconColor) => onChange({ ...block, iconColor })} initial={{ color: 'primary', intensity: 500 }} helperText="Off uses primary." />
        </>
      );
    case 'banner':
      return (
        <>
          <PolyBanner value={block.pattern} onChange={(pattern) => onChange({ ...block, pattern })} editable height={90} radius={{ all: 8 }} label="Banner pattern" />
          <Slider label="Height" min={80} max={600} step={10} value={block.height} formatValue={(value) => `${value}px`} onValueChange={(height) => onChange({ ...block, height })} />
          <Input label="Heading" value={block.heading ?? ''} onValueChange={(heading) => onChange({ ...block, heading: heading || undefined })} error={problems['heading']} />
          <Input label="Text" value={block.text ?? ''} onValueChange={(text) => onChange({ ...block, text: text || undefined })} error={problems['text']} />
          <AlignField value={block.align ?? 'center'} onChange={(align) => onChange({ ...block, align })} />
          <ColorField label="Text colour" value={block.textColor} onChange={(textColor) => onChange({ ...block, textColor })} initial={{ color: 'surface', intensity: 50 }} helperText="Off uses a light text colour." />
        </>
      );
    case 'divider':
      return (
        <>
          <Slider label="Thickness" min={1} max={8} step={1} value={block.thickness ?? 1} formatValue={(value) => `${value}px`} onValueChange={(thickness) => onChange({ ...block, thickness })} />
          <Select
            label="Line"
            value={block.lineStyle ?? 'solid'}
            onValueChange={(lineStyle) => onChange({ ...block, lineStyle: lineStyle as 'solid' | 'dashed' | 'dotted' })}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ]}
          />
          <ColorField label="Colour" value={block.color} onChange={(color) => onChange({ ...block, color })} initial={{ color: 'surface', intensity: 500 }} helperText="Off uses a faint line." />
        </>
      );
    case 'spacer':
      return <Slider label="Height" min={4} max={400} step={4} value={block.height} formatValue={(value) => `${value}px`} onValueChange={(height) => onChange({ ...block, height })} />;
  }
}

/** The panel's heading for the selection. */
export const blockTitle = (block: ContentBlock) => BLOCK_TYPES[block.type].label;
