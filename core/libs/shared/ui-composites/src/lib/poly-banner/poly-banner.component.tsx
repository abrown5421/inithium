import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { PolyBannerSerializableProps, PolyPattern } from '@inithium/shared-contracts';
import { Button, Container, Tooltip, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { PolyBannerEditor } from './poly-banner-editor.component';
import { polyBannerStyleSheet } from './poly-banner.styles';
import { PolyPatternCanvas } from './poly-pattern-canvas.component';
import { createPolyPattern } from './poly-pattern.service';

export type PolyBannerProps = PolyBannerSerializableProps &
  AnimationRuntimeProps & {
    /** The pattern's recipe. With `value`, the banner is controlled; otherwise it holds its own. */
    value?: PolyPattern;
    /** The starting recipe when uncontrolled. Default: the default recipe with a random seed. */
    defaultValue?: PolyPattern;
    /** Called with the new recipe when the editor is saved. */
    onChange?: (pattern: PolyPattern) => void;
    /** Anything drawn over the pattern, e.g. a name or an avatar. */
    children?: ReactNode;
  };

/**
 * A low-poly pattern banner (decision 0074): triangles from a jittered grid, coloured by an x and a y gradient,
 * drawn the same way every time from a small recipe (cell size, variance, colours and a seed). With `editable`,
 * an edit button opens a Modal to change the recipe. Colours follow the theme, including dark mode.
 */
export function PolyBanner({
  value,
  defaultValue,
  onChange,
  editable = false,
  label,
  children,
  width = 'full',
  height = 200,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  radius,
  margin,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: PolyBannerProps) {
  const [own, setOwn] = useState(() => defaultValue ?? createPolyPattern());
  const pattern = value ?? own;
  const [editing, setEditing] = useState(false);

  // The pattern is drawn for the banner's real size, so it's measured, and again whenever it changes.
  const root = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const next = { width: Math.round(box.width), height: Math.round(box.height) };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const save = (next: PolyPattern) => {
    setOwn(next);
    onChange?.(next);
  };

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-poly-banner" precedence="default">
        {polyBannerStyleSheet}
      </style>
      <Container
        ref={root}
        position={{ type: 'relative' }}
        overflow={{ all: 'hidden' }}
        width={width}
        height={height}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        maxHeight={maxHeight}
        radius={radius}
        margin={margin}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        <PolyPatternCanvas pattern={pattern} width={size.width} height={size.height} label={label} />
        {children !== undefined && <div className="ui-poly-content">{children}</div>}
        {editable && (
          <>
            <Container position={{ type: 'absolute', top: 12, right: 12 }}>
              <Tooltip content="Edit banner">
                <Button
                  color={{ color: 'surface', intensity: 900 }}
                  leadingIcon="pencil"
                  aria-label="Edit banner"
                  padding={{ x: 6 }}
                  onClick={() => setEditing(true)}
                />
              </Tooltip>
            </Container>
            <PolyBannerEditor
              open={editing}
              onOpenChange={setEditing}
              pattern={pattern}
              width={size.width}
              height={size.height}
              onSave={save}
            />
          </>
        )}
      </Container>
    </>
  );
}
