import { useState, type ReactNode } from 'react';
import { entranceAnimations, type ContentAlign, type Variants } from '@inithium/shared-contracts';
import { Button, Container, Input, Select, Slider, Switch, Text } from '@inithium/shared-ui-components';
import { DEVICE_LABELS, deviceValues, isOverridden, readAt, writeAt, type EditDevice } from './device-values.service';
import { resolveSides, sidesMatch, SIZE_FRACTIONS, SPACING_STEPS, spacingStep, storeSides, type FourSides, type Sides } from './property-values.service';

/*
 * The page builder's property fields (decision 0116): plain-language controls over the components' style props,
 * each editing the value for the device being previewed when the prop can differ by device.
 */

const MUTED = { color: 'surface', intensity: 700 } as const;

/** A short heading inside a tab of properties. */
export function FieldHeading({ children }: { children: string }) {
  return (
    <Text as="h3" fontSize={12} fontWeight={600} letterSpacing={0.5} textColor={MUTED} margin={{ top: 6 }}>
      {children.toUpperCase()}
    </Text>
  );
}

/** A line of guidance in the panel. */
export function FieldNote({ children }: { children: ReactNode }) {
  return (
    <Text as="p" fontSize={13} textColor={MUTED}>
      {children}
    </Text>
  );
}

export type DeviceFieldProps<T> = {
  value: Variants<T> | undefined;
  onChange: (value: Variants<T> | undefined) => void;
  /** The device being edited (the preview's). */
  device: EditDevice;
  /** What the field shows while nothing is set; an override needs it for the sizes above. */
  fallback: T;
  /** Draws the control for the device's value; `set(undefined)` clears it. */
  children: (current: T | undefined, set: (next: T | undefined) => void) => ReactNode;
};

/**
 * A field whose value can differ by device. On Desktop it sets the value for every size; on Tablet or Phone it sets
 * that device's own value, with a line saying whether it has one and a way back to the larger size's.
 */
export function DeviceField<T>({ value, onChange, device, fallback, children }: DeviceFieldProps<T>) {
  const own = isOverridden(value, device);
  const from = device === 'phone' && isOverridden(value, 'tablet') ? 'Tablet' : 'Desktop';
  return (
    <Container flex={{ direction: 'column', gap: 4 }}>
      {children(readAt(value, device), (next) => onChange(writeAt(value, device, next, fallback)))}
      {device !== 'desktop' && (
        <Container flex={{ direction: 'row', align: 'center', gap: 6 }}>
          <Text as="span" fontSize={12} textColor={own ? { color: 'primary', intensity: 700 } : MUTED}>
            {own ? `${DEVICE_LABELS[device]} only` : `Same as ${from}`}
          </Text>
          {own && (
            <Button variant="link" onClick={() => onChange(writeAt(value, device, undefined, fallback))}>
              Use {from}’s
            </Button>
          )}
        </Container>
      )}
    </Container>
  );
}

const CUSTOM = 'custom';
const DEFAULT = 'default';

export type StepFieldProps = {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Allows negative custom values, e.g. for margins. */
  negative?: boolean;
  /** Offers "Default" (nothing set), with this label. */
  defaultLabel?: string;
};

/** Spacing as a named step (None, XS … 2XL), or a custom number of pixels. */
export function StepField({ label, value, onChange, negative = false, defaultLabel }: StepFieldProps) {
  const [custom, setCustom] = useState(value !== undefined && !spacingStep(value));
  const selected = value === undefined ? (defaultLabel ? DEFAULT : '0') : custom || !spacingStep(value) ? CUSTOM : String(value);
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Select
        label={label}
        value={selected}
        onValueChange={(choice) => {
          setCustom(choice === CUSTOM);
          if (choice === DEFAULT) onChange(undefined);
          else if (choice !== CUSTOM) onChange(Number(choice));
          else onChange(value ?? 0);
        }}
        options={[
          ...(defaultLabel ? [{ value: DEFAULT, label: defaultLabel }] : []),
          ...SPACING_STEPS.map((step) => ({ value: String(step.px), label: step.px ? `${step.label} (${step.px}px)` : step.label })),
          { value: CUSTOM, label: 'Custom' },
        ]}
      />
      {selected === CUSTOM && (
        <Slider label={`${label}: custom`} min={negative ? -200 : 0} max={400} step={1} value={value ?? 0} formatValue={(px) => `${px}px`} onValueChange={onChange} />
      )}
    </Container>
  );
}

export type SidesFieldProps = {
  label: string;
  value: Sides | undefined;
  onChange: (value: Sides | undefined) => void;
  negative?: boolean;
};

/** Padding or margin: one step for every side, or one per side. */
export function SidesField({ label, value, onChange, negative }: SidesFieldProps) {
  const [separate, setSeparate] = useState(!sidesMatch(value));
  const sides = resolveSides(value);
  const setSide = (side: keyof FourSides, px: number | undefined) => onChange(storeSides({ ...sides, [side]: px }));
  return (
    <Container flex={{ direction: 'column', gap: 10 }}>
      {separate ? (
        <Container grid={{ columns: 2, gap: 10 }}>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <StepField key={side} label={`${label}: ${side}`} value={sides[side]} onChange={(px) => setSide(side, px)} negative={negative} />
          ))}
        </Container>
      ) : (
        <StepField label={label} value={sides.top} onChange={(px) => onChange(px ? { all: px } : undefined)} negative={negative} />
      )}
      <Switch label="Each side its own" checked={separate} onCheckedChange={setSeparate} />
    </Container>
  );
}

type SizeChoice = 'auto' | 'full' | 'fit' | 'screen' | 'fractions' | 'px';
type SizeValue = number | 'full' | 'screen' | 'auto' | 'fit' | string;

export type SizeFieldProps = {
  label: string;
  value: SizeValue | undefined;
  onChange: (value: SizeValue | undefined) => void;
  /** The choices offered, besides the default. */
  choices: SizeChoice[];
  /** What nothing set means, e.g. 'Fits its content'. */
  defaultLabel: string;
  /** The pixels a fixed size starts at, and the most it takes. */
  px?: { start: number; max: number };
};

const SIZE_LABELS: Record<Exclude<SizeChoice, 'fractions' | 'px'>, string> = {
  auto: 'Automatic',
  full: 'All the space it has',
  fit: 'Fits its content',
  screen: 'The screen’s height',
};

/** A width or height: the default, a named size, a fraction of the space, or fixed pixels. */
export function SizeField({ label, value, onChange, choices, defaultLabel, px = { start: 320, max: 2000 } }: SizeFieldProps) {
  const selected = value === undefined ? DEFAULT : typeof value === 'number' ? 'px' : value;
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Select
        label={label}
        value={selected}
        onValueChange={(choice) => onChange(choice === DEFAULT ? undefined : choice === 'px' ? (typeof value === 'number' ? value : px.start) : choice)}
        options={[
          { value: DEFAULT, label: defaultLabel },
          ...choices.flatMap((choice) =>
            choice === 'px'
              ? [{ value: 'px', label: 'A fixed size' }]
              : choice === 'fractions'
                ? SIZE_FRACTIONS.map((fraction) => ({ value: fraction.value, label: `${fraction.label} of the space` }))
                : [{ value: choice, label: SIZE_LABELS[choice] }],
          ),
        ]}
      />
      {typeof value === 'number' && (
        <Slider label={`${label}: pixels`} min={0} max={px.max} step={1} value={value} formatValue={(n) => `${n}px`} onValueChange={onChange} />
      )}
    </Container>
  );
}

const ALIGNS: { value: ContentAlign; label: string }[] = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Centre' },
  { value: 'end', label: 'End' },
];

/** Where content sits across its space. */
export function AlignField({ label = 'Alignment', value, fallback = 'start', onChange }: { label?: string; value: ContentAlign | undefined; fallback?: ContentAlign; onChange: (align: ContentAlign) => void }) {
  return <Select label={label} value={value ?? fallback} onValueChange={(next) => onChange(next as ContentAlign)} options={ALIGNS} />;
}

/** Rounded corners, the same on every corner. */
export function CornersField({ value, onChange }: { value: { all?: number } & Record<string, number | undefined> | undefined; onChange: (value: { all: number } | undefined) => void }) {
  const mixed = value !== undefined && Object.keys(value).some((key) => key !== 'all');
  return (
    <Container flex={{ direction: 'column', gap: 4 }}>
      <Slider label="Rounded corners" min={0} max={64} step={1} value={value?.all ?? 0} formatValue={(n) => `${n}px`} onValueChange={(all) => onChange(all ? { all } : undefined)} />
      {mixed && <FieldNote>Its corners differ; moving this sets them all the same.</FieldNote>}
    </Container>
  );
}

const SHADOWS = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
type Shadow = (typeof SHADOWS)[number];

export function ShadowField({ value, onChange }: { value: Shadow | undefined; onChange: (value: Shadow | undefined) => void }) {
  return (
    <Select
      label="Shadow"
      value={value ?? 'none'}
      onValueChange={(next) => onChange(next === 'none' ? undefined : (next as Shadow))}
      options={SHADOWS.map((size) => ({ value: size, label: size === 'none' ? 'None' : size.toUpperCase() }))}
    />
  );
}

type LineStyle = 'solid' | 'dashed' | 'dotted';

/** A border on every side: how thick, and its line. Its colour is a ColorField beside it. */
export function BorderFields({
  width,
  lineStyle,
  onWidth,
  onLineStyle,
}: {
  width: number | undefined;
  lineStyle: LineStyle | undefined;
  onWidth: (width: number | undefined) => void;
  onLineStyle: (lineStyle: LineStyle | undefined) => void;
}) {
  return (
    <>
      <Slider label="Border" min={0} max={8} step={1} value={width ?? 0} formatValue={(n) => (n ? `${n}px` : 'None')} onValueChange={(n) => onWidth(n || undefined)} />
      {Boolean(width) && (
        <Select
          label="Border line"
          value={lineStyle ?? 'solid'}
          onValueChange={(next) => onLineStyle(next === 'solid' ? undefined : (next as LineStyle))}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' },
          ]}
        />
      )}
    </>
  );
}

/** Which devices show the element: Container's `hidden`, per device. */
export function VisibilityField({ value, onChange }: { value: Variants<boolean> | undefined; onChange: (value: Variants<boolean> | undefined) => void }) {
  const hidden = deviceValues(value);
  const set = (device: EditDevice, show: boolean) => {
    const next = { ...hidden, [device]: !show };
    let stored = writeAt<boolean>(undefined, 'desktop', Boolean(next.desktop), false);
    stored = writeAt(stored, 'tablet', Boolean(next.tablet), false);
    stored = writeAt(stored, 'phone', Boolean(next.phone), false);
    onChange(stored === false ? undefined : stored);
  };
  const shown = (['desktop', 'tablet', 'phone'] as const).filter((device) => !hidden[device]);
  return (
    <Container flex={{ direction: 'column', gap: 6 }}>
      {(['desktop', 'tablet', 'phone'] as const).map((device) => (
        <Switch key={device} label={`Show on ${DEVICE_LABELS[device].toLowerCase()}s`} checked={!hidden[device]} onCheckedChange={(show) => set(device, show)} />
      ))}
      {shown.length === 0 && <FieldNote>It’s hidden everywhere: visitors never see it.</FieldNote>}
    </Container>
  );
}

type Entrance = { name: (typeof entranceAnimations)[number]; when?: 'mount' | 'inView' };
const NONE = 'none';

/** How the element arrives: an animate.css entrance, played on load or when it scrolls into view. */
export function EntranceField({ value, onChange }: { value: { entrance?: Entrance } | undefined; onChange: (value: { entrance: Entrance } | undefined) => void }) {
  const entrance = value?.entrance;
  return (
    <Container flex={{ direction: 'column', gap: 10 }}>
      <Select
        label="Entrance animation"
        value={entrance?.name ?? NONE}
        onValueChange={(name) => onChange(name === NONE ? undefined : { entrance: { ...entrance, name: name as Entrance['name'] } })}
        options={[{ value: NONE, label: 'None' }, ...entranceAnimations.map((name) => ({ value: name, label: name }))]}
      />
      {entrance && (
        <Select
          label="Plays"
          value={entrance.when ?? 'mount'}
          onValueChange={(when) => onChange({ entrance: { ...entrance, when: when === 'mount' ? undefined : (when as 'inView') } })}
          options={[
            { value: 'mount', label: 'When the page opens' },
            { value: 'inView', label: 'When it scrolls into view' },
          ]}
        />
      )}
    </Container>
  );
}

/** A text field that stores nothing when it's empty. */
export function OptionalText({ label, value, onChange, helperText, error, maxLength }: { label: string; value: string | undefined; onChange: (value: string | undefined) => void; helperText?: string; error?: string; maxLength?: number }) {
  return <Input label={label} value={value ?? ''} maxLength={maxLength} helperText={helperText} error={error} onValueChange={(next) => onChange(next || undefined)} />;
}
