import type { ReactNode } from 'react';
import type {
  ButtonElement,
  ColorValue,
  ContainerElement,
  ContentElement,
  CoreContentElement,
  DividerElement,
  IconElement,
  ImageElement,
  Page,
  TextElement,
  Variants,
} from '@inithium/shared-contracts';
import { AssetField } from '@inithium/cms-media';
import { Button, Container, Input, Select, Slider, Switch, type IconName } from '@inithium/shared-ui-components';
import { IconPicker, Tabs, type PickedColor } from '@inithium/shared-ui-composites';
import { readAt, readState, writeAt, writeState, type EditDevice } from './device-values.service';
import { ColorField, LinkField } from './editor-fields.component';
import {
  AlignField,
  BorderFields,
  CornersField,
  DeviceField,
  EntranceField,
  FieldHeading,
  FieldNote,
  OptionalText,
  ShadowField,
  SidesField,
  SizeField,
  StepField,
  VisibilityField,
} from './property-fields.component';
import { arrangedInRow, stacksOn, type Sides } from './property-values.service';
import { TypographyFields } from './typography-fields.component';

/** Each field's problem, keyed by its path within the element, e.g. 'props.label'. */
export type FieldProblems = Record<string, string>;

/** The properties' tabs. */
export type PropertiesTab = 'content' | 'layout' | 'style' | 'advanced';

export type ElementPropertiesProps = {
  element: CoreContentElement;
  /** The Container it's in, or null on the page itself. */
  parent: ContainerElement | null;
  onChange: (element: ContentElement) => void;
  /** The device being edited, which the preview shows. */
  device: EditDevice;
  /** Every page, for links. */
  pages: Page[];
  problems: FieldProblems;
  tab: PropertiesTab;
  onTabChange: (tab: PropertiesTab) => void;
};

/** An object without its undefined fields, or undefined when nothing's left: documents store only real choices. */
function tidy<T extends object>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
}

/** A setter for some of an element's props, dropping the ones set to undefined. */
function propsSetter<E extends CoreContentElement>(element: E, onChange: (element: ContentElement) => void) {
  return (changes: Partial<E['props']>) => onChange({ ...element, props: tidy({ ...element.props, ...changes }) ?? {} } as E);
}

type Box = { hidden?: Variants<boolean>; margin?: Variants<Sides>; animation?: Parameters<typeof EntranceField>[0]['value'] };

/**
 * The selection's properties (decision 0116), in tabs: Content (what it says or shows), Layout (arrangement, size,
 * space and which devices show it), Style (colours, borders, corners, shadow, type) and Advanced. Values that can
 * differ by device are edited for the device the preview shows.
 */
export function ElementProperties(props: ElementPropertiesProps) {
  const { element, tab, onTabChange } = props;
  const tabs = panelsFor(props).filter((panel) => panel.content !== null);
  const active = tabs.some((panel) => panel.value === tab) ? tab : (tabs[0]?.value ?? 'layout');
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Input
        label="Name in the Layers"
        helperText="Only you see it: it helps find things in a big page."
        value={element.label ?? ''}
        maxLength={60}
        onValueChange={(label) => {
          const next = { ...element, label: label || undefined };
          if (!label) delete next.label;
          props.onChange(next);
        }}
        error={props.problems['label']}
      />
      <Tabs
        key={element.id}
        aria-label="Properties"
        fill
        value={active}
        onValueChange={(value) => onTabChange(value as PropertiesTab)}
        tabs={tabs.map((panel) => ({
          value: panel.value,
          label: panel.label,
          content: (
            <Container flex={{ direction: 'column', gap: 16 }} padding={{ top: 4 }}>
              {panel.value === 'layout' && <SideBySide parent={props.parent} onChange={props.onChange} device={props.device} />}
              {panel.content}
            </Container>
          ),
        }))}
      />
    </Container>
  );
}

type Panel = { value: PropertiesTab; label: string; content: ReactNode };

function panelsFor(props: ElementPropertiesProps): Panel[] {
  const { element } = props;
  const panels = (content: ReactNode, layout: ReactNode, style: ReactNode, advanced: ReactNode): Panel[] => [
    { value: 'content', label: 'Content', content },
    { value: 'layout', label: 'Layout', content: layout },
    { value: 'style', label: 'Style', content: style },
    { value: 'advanced', label: 'Advanced', content: advanced },
  ];
  switch (element.type) {
    case 'container':
      return containerPanels(element, props, panels);
    case 'text':
      return textPanels(element, props, panels);
    case 'image':
      return imagePanels(element, props, panels);
    case 'icon':
      return iconPanels(element, props, panels);
    case 'button':
      return buttonPanels(element, props, panels);
    case 'divider':
      return dividerPanels(element, props, panels);
  }
}

type Panels = (content: ReactNode, layout: ReactNode, style: ReactNode, advanced: ReactNode) => Panel[];

// --- What every element but Container shares: space outside, which devices show it, and its entrance ---

function boxLayout(box: Box, set: (changes: Box) => void, device: EditDevice) {
  return (
    <>
      <FieldHeading>Space</FieldHeading>
      <DeviceField value={box.margin} onChange={(margin) => set({ margin })} device={device} fallback={{}}>
        {(current, change) => <SidesField label="Space outside" value={current} onChange={change} negative />}
      </DeviceField>
      <FieldHeading>Where it shows</FieldHeading>
      <VisibilityField value={box.hidden} onChange={(hidden) => set({ hidden })} />
    </>
  );
}

const boxAdvanced = (box: Box, set: (changes: Box) => void) => <EntranceField value={box.animation} onChange={(animation) => set({ animation })} />;

// --- Colours, borders, corners and shadow, for components that take them per device ---

type Styled = {
  bgColor?: Variants<ColorValue>;
  textColor?: Variants<ColorValue>;
  borderColor?: Variants<ColorValue>;
  borderWidth?: Variants<Sides>;
  borderStyle?: Variants<'solid' | 'dashed' | 'dotted'>;
  radius?: Variants<Record<string, number | undefined>>;
  shadow?: Variants<'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
};

function colorField(label: string, value: Variants<ColorValue> | undefined, onChange: (value: Variants<ColorValue> | undefined) => void, device: EditDevice, helperText: string, initial: PickedColor = { color: 'surface', intensity: 100 }) {
  return (
    <DeviceField value={value} onChange={onChange} device={device} fallback={'transparent' as ColorValue}>
      {(current, change) => <ColorField label={label} value={current} onChange={change} initial={initial} helperText={helperText} />}
    </DeviceField>
  );
}

function boxStyle(props: Styled, set: (changes: Styled) => void, device: EditDevice, options: { background?: boolean; text?: boolean } = {}) {
  const width = readAt(props.borderWidth, device)?.all;
  return (
    <>
      {options.background !== false && colorField('Background', props.bgColor, (bgColor) => set({ bgColor }), device, 'Off shows what’s behind it.')}
      {options.text !== false &&
        colorField('Text colour', props.textColor, (textColor) => set({ textColor }), device, 'Off uses the colour around it.', { color: 'surface', intensity: 900 })}
      <FieldHeading>Border and corners</FieldHeading>
      <DeviceField value={props.borderWidth} onChange={(borderWidth) => set({ borderWidth })} device={device} fallback={{}}>
        {(current, change) => (
          <BorderFields
            width={current?.all}
            lineStyle={readAt(props.borderStyle, device)}
            onWidth={(all) => change(all === undefined ? undefined : { all })}
            onLineStyle={(lineStyle) => set({ borderStyle: writeAt(props.borderStyle, device, lineStyle, 'solid') })}
          />
        )}
      </DeviceField>
      {Boolean(width) && colorField('Border colour', props.borderColor, (borderColor) => set({ borderColor }), device, 'Off uses a faint line.', { color: 'surface', intensity: 500 })}
      <DeviceField value={props.radius} onChange={(radius) => set({ radius })} device={device} fallback={{}}>
        {(current, change) => <CornersField value={current} onChange={change} />}
      </DeviceField>
      <DeviceField value={props.shadow} onChange={(shadow) => set({ shadow })} device={device} fallback={'none' as const}>
        {(current, change) => <ShadowField value={current} onChange={change} />}
      </DeviceField>
    </>
  );
}

// --- Container ---

type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Widths don't put things side by side: what holds them does. In a stacked Container, a button that arranges it in a
 * row, so the element sits beside its neighbours.
 */
function SideBySide({ parent, onChange, device }: { parent: ContainerElement | null; onChange: (element: ContentElement) => void; device: EditDevice }) {
  if (!parent || !stacksOn(parent, device) || parent.children.length < 2) return null;
  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 8 }} padding={{ all: 12 }} radius={{ all: 8 }} bgColor={{ color: 'surface', intensity: 100 }}>
      <FieldNote>It’s stacked with its neighbours because the Container holding it stacks what’s inside. To sit them side by side, put that Container in a row.</FieldNote>
      <Button variant="outlined" leadingIcon="columns-3" onClick={() => onChange(arrangedInRow(parent, device))}>
        Put it side by side with its neighbours
      </Button>
    </Container>
  );
}
type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/** A gap as a number of pixels, or nothing when it's split into x and y (an Advanced value). */
const gapPx = (gap: unknown) => (typeof gap === 'number' ? gap : undefined);

function containerPanels(element: ContainerElement, { parent, onChange, device, problems }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const flex = props.flex ?? {};
  const grid = props.grid;
  const setFlex = (changes: Partial<typeof flex>) => set({ flex: tidy({ ...flex, ...changes }) });
  const setGrid = (changes: Partial<NonNullable<typeof grid>>) => set({ grid: tidy({ ...grid, ...changes }) ?? {} });
  const direction = readAt(flex.direction, device) ?? 'column';
  const row = !grid && direction.startsWith('row');
  const mode = grid ? 'grid' : row ? 'row' : 'stack';

  const arrange = (next: string) => {
    if (next === 'grid') {
      if (grid) return;
      // A new grid: three columns on larger screens, one on phones.
      const columns = writeAt(writeAt<number>(undefined, 'desktop', 3, 1), 'phone', 1, 1);
      set({ flex: undefined, grid: tidy({ columns, gap: flex.gap ?? 16, align: flex.align }) });
      return;
    }
    if (next === 'row') return onChange(arrangedInRow(element, device));
    const nextDirection = writeAt<Direction>(grid ? undefined : flex.direction, grid ? 'desktop' : device, 'column', 'column');
    if (grid) set({ grid: undefined, flex: tidy({ direction: nextDirection, gap: grid.gap, align: grid.align }) });
    else setFlex({ direction: nextDirection });
  };

  const parentDirection = parent ? readAt(parent.props.flex?.direction, device) : undefined;
  const inRow = parent && !parent.props.grid && parentDirection?.startsWith('row');
  const share = props.flexItem?.grow ? (props.flexItem.basis === 0 ? 'share' : 'fill') : 'own';

  const alignLabels = row
    ? { label: 'Line up top to bottom', start: 'Top', center: 'Middle', end: 'Bottom', stretch: 'Stretch to the tallest' }
    : { label: 'Line up side to side', start: 'Start', center: 'Centre', end: 'End', stretch: 'Stretch across' };

  const layout = (
    <>
      <FieldHeading>Inside it</FieldHeading>
      {grid && device !== 'desktop' ? (
        <FieldNote>A grid on every device: set how many columns it has on {device === 'phone' ? 'phones' : 'tablets'} below.</FieldNote>
      ) : (
        <DeviceField value={grid ? undefined : flex.direction} onChange={() => undefined} device={device} fallback="column">
          {() => (
            <Select
              label="Arrange what’s inside"
              value={mode}
              onValueChange={arrange}
              options={[
                { value: 'stack', label: 'Stacked, one under another', icon: 'rows-3' },
                { value: 'row', label: 'In a row, side by side', icon: 'columns-3' },
                { value: 'grid', label: 'In a grid of columns', icon: 'layout-grid' },
              ]}
            />
          )}
        </DeviceField>
      )}
      {grid && (
        <DeviceField value={grid.columns} onChange={(columns) => setGrid({ columns })} device={device} fallback={1}>
          {(current, change) => <Slider label="Columns" min={1} max={6} step={1} value={current ?? 1} onValueChange={change} />}
        </DeviceField>
      )}
      <DeviceField value={grid ? grid.gap : flex.gap} onChange={(gap) => (grid ? setGrid({ gap }) : setFlex({ gap }))} device={device} fallback={0}>
        {(current, change) => <StepField label="Space between" value={gapPx(current)} onChange={change} />}
      </DeviceField>
      {row && (
        <Switch
          label="Wrap onto more lines when there isn’t room"
          checked={readAt(flex.wrap, device) === 'wrap'}
          onCheckedChange={(on) => setFlex({ wrap: writeAt(flex.wrap, device, on ? 'wrap' : undefined, 'nowrap') })}
        />
      )}
      <DeviceField<AlignItems> value={grid ? grid.align : flex.align} onChange={(align) => (grid ? setGrid({ align }) : setFlex({ align }))} device={device} fallback="stretch">
        {(current, change) => (
          <Select
            label={grid ? 'Line up in each cell' : alignLabels.label}
            value={current ?? 'stretch'}
            onValueChange={(next) => change(next as AlignItems)}
            options={(['start', 'center', 'end', 'stretch'] as const).map((value) => ({ value, label: alignLabels[value] }))}
          />
        )}
      </DeviceField>
      {!grid && (
        <DeviceField<Justify> value={flex.justify} onChange={(justify) => setFlex({ justify })} device={device} fallback="start">
          {(current, change) => (
            <Select
              label={row ? 'Spread along the row' : 'Spread down'}
              value={current ?? 'start'}
              onValueChange={(next) => change(next as Justify)}
              options={[
                { value: 'start', label: row ? 'From the start' : 'From the top' },
                { value: 'center', label: 'In the middle' },
                { value: 'end', label: row ? 'At the end' : 'At the bottom' },
                { value: 'between', label: 'Space between them' },
                { value: 'around', label: 'Space around them' },
                { value: 'evenly', label: 'Spaced evenly' },
              ]}
            />
          )}
        </DeviceField>
      )}

      {(inRow || parent?.props.grid) && <FieldHeading>In what holds it</FieldHeading>}
      {inRow && (
        <Select
          label="Its width in the row"
          value={share}
          onValueChange={(choice) =>
            set({ flexItem: choice === 'own' ? undefined : choice === 'share' ? { grow: 1, basis: 0 } : { grow: 1 } })
          }
          options={[
            { value: 'own', label: 'Its own width' },
            { value: 'share', label: 'An equal share of the row' },
            { value: 'fill', label: 'Whatever’s left over' },
          ]}
        />
      )}
      {parent?.props.grid && (
        <DeviceField<number | 'full'> value={props.gridItem?.colSpan} onChange={(colSpan) => set({ gridItem: tidy({ ...props.gridItem, colSpan }) })} device={device} fallback={1}>
          {(current, change) => (
            <Select
              label="Columns it spans"
              value={String(current ?? 1)}
              onValueChange={(next) => change(next === 'full' ? 'full' : Number(next))}
              options={[...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) })), { value: 'full', label: 'The whole row' }]}
            />
          )}
        </DeviceField>
      )}

      <FieldHeading>Size</FieldHeading>
      <DeviceField value={props.width} onChange={(width) => set({ width })} device={device} fallback="auto">
        {(current, change) => <SizeField label="Width" value={current} onChange={change} choices={['full', 'fit', 'fractions', 'px']} defaultLabel="Automatic" />}
      </DeviceField>
      <DeviceField value={props.maxWidth} onChange={(maxWidth) => set({ maxWidth })} device={device} fallback="auto">
        {(current, change) => <SizeField label="Widest it gets" value={current} onChange={change} choices={['px']} defaultLabel="No limit" px={{ start: 1200, max: 3000 }} />}
      </DeviceField>
      <DeviceField value={props.minHeight} onChange={(minHeight) => set({ minHeight })} device={device} fallback={0}>
        {(current, change) => <SizeField label="Shortest it gets" value={current} onChange={change} choices={['screen', 'px']} defaultLabel="Fits what’s inside" px={{ start: 320, max: 2000 }} />}
      </DeviceField>

      <FieldHeading>Space</FieldHeading>
      <DeviceField value={props.padding} onChange={(padding) => set({ padding })} device={device} fallback={{}}>
        {(current, change) => <SidesField label="Space inside" value={current} onChange={change} />}
      </DeviceField>
      <DeviceField value={props.margin} onChange={(margin) => set({ margin })} device={device} fallback={{}}>
        {(current, change) => <SidesField label="Space outside" value={current} onChange={change} negative />}
      </DeviceField>

      <FieldHeading>Where it shows</FieldHeading>
      <VisibilityField value={props.hidden} onChange={(hidden) => set({ hidden })} />
    </>
  );

  const advanced = (
    <>
      <Select
        label="What it is, for screen readers and search"
        value={props.as ?? 'div'}
        onValueChange={(as) => set({ as: as === 'div' ? undefined : (as as typeof props.as) })}
        options={[
          { value: 'div', label: 'Just a box' },
          { value: 'section', label: 'A section of the page' },
          { value: 'article', label: 'A self-contained piece, e.g. a post' },
          { value: 'aside', label: 'Something to one side' },
          { value: 'header', label: 'A header' },
          { value: 'footer', label: 'A footer' },
          { value: 'nav', label: 'Navigation' },
        ]}
      />
      <OptionalText
        label="Anchor"
        helperText="Lets links go straight to it: 'pricing' makes '#pricing'."
        value={props.anchor}
        onChange={(anchor) => set({ anchor })}
        error={problems['props.anchor']}
        maxLength={60}
      />
      <EntranceField value={props.animation} onChange={(animation) => set({ animation })} />
      <Slider
        label="Bring what’s inside in one after another"
        min={0}
        max={1000}
        step={50}
        value={props.stagger ?? 0}
        formatValue={(ms) => (ms ? `${ms}ms apart` : 'Off')}
        onValueChange={(stagger) => set({ stagger: stagger || undefined })}
      />
      <FieldHeading>When the pointer is over it</FieldHeading>
      <ColorField
        label="Background on hover"
        value={readState(props.bgColor, 'hover')}
        onChange={(color) => set({ bgColor: writeState(props.bgColor, 'hover', color) })}
        initial={{ color: 'surface', intensity: 200 }}
        helperText="Off keeps its background."
      />
      <FieldHeading>More sizes</FieldHeading>
      <DeviceField value={props.height} onChange={(height) => set({ height })} device={device} fallback="auto">
        {(current, change) => <SizeField label="Height" value={current} onChange={change} choices={['full', 'screen', 'px']} defaultLabel="Fits what’s inside" />}
      </DeviceField>
      <DeviceField value={props.minWidth} onChange={(minWidth) => set({ minWidth })} device={device} fallback={0}>
        {(current, change) => <SizeField label="Narrowest it gets" value={current} onChange={change} choices={['px']} defaultLabel="No limit" px={{ start: 200, max: 2000 }} />}
      </DeviceField>
      <DeviceField value={props.maxHeight} onChange={(maxHeight) => set({ maxHeight })} device={device} fallback="auto">
        {(current, change) => <SizeField label="Tallest it gets" value={current} onChange={change} choices={['screen', 'px']} defaultLabel="No limit" />}
      </DeviceField>
      {props.shadow !== undefined &&
        colorField('Shadow colour', props.shadowColor, (shadowColor) => set({ shadowColor }), device, 'Off uses a soft dark shadow.', { color: 'surface', intensity: 950 })}
    </>
  );

  return panels(null, layout, boxStyle(props as Styled, set as (changes: Styled) => void, device), advanced);
}

// --- Text ---

function textPanels(element: TextElement, { onChange, device: editing }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const content = (
    <FieldNote>
      Type in the preview: click the Text there. The toolbar above the preview makes headings (1 to 4), lists, quotes, links, and bold, italic or
      restyled words.
    </FieldNote>
  );
  const style = (
    <>
      <AlignField value={props.align} onChange={(align) => set({ align })} />
      <ColorField label="Text colour" value={props.textColor} onChange={(textColor) => set({ textColor })} initial={{ color: 'surface', intensity: 900 }} helperText="Off uses the colour around it." />
      <FieldHeading>Running text</FieldHeading>
      <TypographyFields value={props.typography} onChange={(typography) => set({ typography })} defaultSize={{ base: 16 }} />
      <FieldHeading>Headings</FieldHeading>
      <TypographyFields part="Heading" value={props.headingTypography} onChange={(headingTypography) => set({ headingTypography })} defaultSize={{ base: 26 }} />
    </>
  );
  const box = props as Box;
  return panels(content, boxLayout(box, set as (changes: Box) => void, editing), style, boxAdvanced(box, set as (changes: Box) => void));
}

// --- Image ---

const RATIOS = [
  { value: 'original', label: 'Its own shape' },
  { value: '1', label: 'Square' },
  { value: String(4 / 3), label: '4:3' },
  { value: String(3 / 2), label: '3:2' },
  { value: String(16 / 9), label: 'Wide (16:9)' },
  { value: String(3 / 4), label: 'Portrait (3:4)' },
];

function imagePanels(element: ImageElement, { onChange, device: editing, pages, problems }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const content = (
    <>
      <AssetField
        label="Image"
        kind="image"
        purpose="content"
        required
        value={props.assetId || undefined}
        onChange={(asset) => asset && set({ assetId: asset.id, alt: props.alt || asset.alt || undefined })}
        error={problems['props.assetId']}
      />
      <Switch
        label="Decorative"
        helperText="Purely visual, so screen readers skip it and it needs no description."
        checked={Boolean(props.decorative)}
        onCheckedChange={(decorative) => set({ decorative: decorative || undefined })}
      />
      {!props.decorative && (
        <OptionalText label="Description (alt text)" helperText="Starts as the file’s own; change it to suit this page." value={props.alt} onChange={(alt) => set({ alt })} error={problems['props.alt']} maxLength={300} />
      )}
      <OptionalText label="Caption" value={props.caption} onChange={(caption) => set({ caption })} error={problems['props.caption']} maxLength={300} />
      <Switch label="Link the image" checked={props.link !== undefined} onCheckedChange={(on) => set({ link: on ? { type: 'url', href: 'https://' } : undefined })} />
      {props.link && <LinkField value={props.link} onChange={(link) => set({ link })} pages={pages} error={problems['props.link.href'] ?? problems['props.link.pageId']} />}
    </>
  );
  const layout = (
    <>
      <AlignField label="Where it sits" value={props.align} fallback="center" onChange={(align) => set({ align })} />
      <DeviceField value={props.width} onChange={(width) => set({ width })} device={editing} fallback="full">
        {(current, change) => <SizeField label="Width" value={current} onChange={change} choices={['fit', 'fractions', 'px']} defaultLabel="All the space it has" px={{ start: 480, max: 3000 }} />}
      </DeviceField>
      <DeviceField value={props.height} onChange={(height) => set({ height })} device={editing} fallback="auto">
        {(current, change) => <SizeField label="Height" value={current} onChange={change} choices={['px']} defaultLabel="Its own shape" px={{ start: 320, max: 2000 }} />}
      </DeviceField>
      <Select
        label="Shape"
        value={props.aspectRatio ? String(props.aspectRatio) : 'original'}
        onValueChange={(ratio) => set({ aspectRatio: ratio === 'original' ? undefined : Number(ratio) })}
        options={RATIOS}
      />
      {(props.aspectRatio !== undefined || props.height !== undefined) && (
        <Select
          label="Fitting it to that shape"
          value={props.fit ?? 'cover'}
          onValueChange={(fit) => set({ fit: fit === 'cover' ? undefined : (fit as 'contain') })}
          options={[
            { value: 'cover', label: 'Fill it, trimming the edges' },
            { value: 'contain', label: 'Show it all, leaving space' },
          ]}
        />
      )}
      {boxLayout(props as Box, set as (changes: Box) => void, editing)}
    </>
  );
  const style = (
    <>
      {boxStyle(props as Styled, set as (changes: Styled) => void, editing, { background: false, text: false })}
      {props.caption && (
        <>
          <FieldHeading>Caption</FieldHeading>
          <ColorField label="Caption colour" value={props.captionColor} onChange={(captionColor) => set({ captionColor })} initial={{ color: 'surface', intensity: 700 }} helperText="Off uses a muted colour." />
          <TypographyFields part="Caption" value={props.captionTypography} onChange={(captionTypography) => set({ captionTypography })} defaultSize={{ base: 14 }} />
        </>
      )}
    </>
  );
  return panels(content, layout, style, boxAdvanced(props as Box, set as (changes: Box) => void));
}

// --- Icon ---

function iconPanels(element: IconElement, { onChange, device: editing }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const content = (
    <>
      <IconPicker label="Icon" value={props.name as IconName} onValueChange={(name) => name && set({ name })} />
      <OptionalText
        label="Description"
        helperText="Only if it means something on its own, e.g. a phone icon standing for “Call us”. Leave empty for a decorative icon."
        value={props.label}
        onChange={(label) => set({ label })}
        maxLength={120}
      />
    </>
  );
  const style = (
    <>
      <DeviceField value={props.size} onChange={(size) => set({ size })} device={editing} fallback={24}>
        {(current, change) => <Slider label="Size" min={12} max={160} step={2} value={current ?? 24} formatValue={(px) => `${px}px`} onValueChange={change} />}
      </DeviceField>
      {colorField('Icon colour', props.textColor, (textColor) => set({ textColor }), editing, 'Off uses the colour around it.', { color: 'primary', intensity: 500 })}
      <DeviceField value={props.padding} onChange={(padding) => set({ padding })} device={editing} fallback={{}}>
        {(current, change) => <SidesField label="Space around it" value={current} onChange={change} />}
      </DeviceField>
      {boxStyle(props as Styled, set as (changes: Styled) => void, editing, { text: false })}
    </>
  );
  return panels(content, boxLayout(props as Box, set as (changes: Box) => void, editing), style, boxAdvanced(props as Box, set as (changes: Box) => void));
}

// --- Button ---

function buttonPanels(element: ButtonElement, { onChange, device: editing, pages, problems }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const content = (
    <>
      <Input label="Text" value={props.label} maxLength={60} onValueChange={(label) => set({ label })} error={problems['props.label']} />
      <LinkField value={props.link} onChange={(link) => set({ link })} pages={pages} error={problems['props.link.href'] ?? problems['props.link.pageId']} />
      <IconPicker label="Icon before the text" value={props.leadingIcon as IconName | undefined} onValueChange={(leadingIcon) => set({ leadingIcon })} />
      <IconPicker label="Icon after the text" value={props.trailingIcon as IconName | undefined} onValueChange={(trailingIcon) => set({ trailingIcon })} />
    </>
  );
  const style = (
    <>
      <Select
        label="Style"
        value={props.variant ?? 'filled'}
        onValueChange={(variant) => set({ variant: variant === 'filled' ? undefined : (variant as 'outlined') })}
        options={[
          { value: 'filled', label: 'Filled' },
          { value: 'outlined', label: 'Outlined' },
          { value: 'ghost', label: 'Text only, tinted on hover' },
          { value: 'link', label: 'A link' },
        ]}
      />
      <ColorField label="Colour" value={props.color} onChange={(color) => set({ color: color as typeof props.color })} initial={{ color: 'primary', intensity: 500 }} helperText="Off uses the primary colour." />
    </>
  );
  const layout = (
    <>
      <DeviceField value={props.width} onChange={(width) => set({ width })} device={editing} fallback="auto">
        {(current, change) => <SizeField label="Width" value={current} onChange={change} choices={['full']} defaultLabel="Fits its text" />}
      </DeviceField>
      {boxLayout(props as Box, set as (changes: Box) => void, editing)}
    </>
  );
  return panels(content, layout, style, boxAdvanced(props as Box, set as (changes: Box) => void));
}

// --- Divider ---

function dividerPanels(element: DividerElement, { onChange, device: editing }: ElementPropertiesProps, panels: Panels): Panel[] {
  const props = element.props;
  const set = propsSetter(element, onChange);
  const content = (
    <>
      <OptionalText label="Text in the line" helperText="e.g. “or”. Leave empty for a plain line." value={props.label} onChange={(label) => set({ label })} maxLength={60} />
      {props.label && (
        <Select
          label="Where the text sits"
          value={props.labelAlign ?? 'center'}
          onValueChange={(labelAlign) => set({ labelAlign: labelAlign === 'center' ? undefined : (labelAlign as 'start') })}
          options={[
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Centre' },
            { value: 'end', label: 'End' },
          ]}
        />
      )}
    </>
  );
  const style = (
    <>
      <Slider label="Thickness" min={1} max={8} step={1} value={props.thickness ?? 1} formatValue={(px) => `${px}px`} onValueChange={(thickness) => set({ thickness: thickness === 1 ? undefined : thickness })} />
      <Select
        label="Line"
        value={props.lineStyle ?? 'solid'}
        onValueChange={(lineStyle) => set({ lineStyle: lineStyle === 'solid' ? undefined : (lineStyle as 'dashed') })}
        options={[
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ]}
      />
      <ColorField label="Colour" value={props.color} onChange={(color) => set({ color })} initial={{ color: 'surface', intensity: 500 }} helperText="Off uses a faint line." />
    </>
  );
  const layout = (
    <>
      <Select
        label="Direction"
        value={props.orientation ?? 'horizontal'}
        onValueChange={(orientation) => set({ orientation: orientation === 'horizontal' ? undefined : (orientation as 'vertical') })}
        options={[
          { value: 'horizontal', label: 'Across' },
          { value: 'vertical', label: 'Up and down, e.g. between things in a row' },
        ]}
      />
      <DeviceField value={props.padding} onChange={(padding) => set({ padding })} device={editing} fallback={{}}>
        {(current, change) => <SidesField label="Space around the line" value={current} onChange={change} />}
      </DeviceField>
      {boxLayout(props as Box, set as (changes: Box) => void, editing)}
    </>
  );
  return panels(content, layout, style, boxAdvanced(props as Box, set as (changes: Box) => void));
}
