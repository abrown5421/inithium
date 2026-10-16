import { describe, expect, it } from 'vitest';
import type { ContainerElement } from '@inithium/shared-contracts';
import { arrangedInRow, resolveSides, sidesMatch, spacingStep, stacksOn, storeSides } from './property-values.service';

describe('the page builder’s spacing (decision 0116)', () => {
  it('names the steps and leaves other values custom', () => {
    expect(spacingStep(16)?.label).toBe('M');
    expect(spacingStep(96)?.label).toBe('2XL');
    expect(spacingStep(20)).toBeUndefined();
  });

  it('resolves each side, specific keys winning over general ones', () => {
    expect(resolveSides({ all: 8, y: 16, left: 0 })).toEqual({ top: 16, right: 8, bottom: 16, left: 0 });
    expect(sidesMatch({ all: 8 })).toBe(true);
    expect(sidesMatch({ x: 8, y: 16 })).toBe(false);
    expect(sidesMatch(undefined)).toBe(true);
  });

  it('stores four equal sides as one value, and nothing as nothing', () => {
    expect(storeSides({ top: 8, right: 8, bottom: 8, left: 8 })).toEqual({ all: 8 });
    expect(storeSides({ top: 8, right: 0, bottom: 8, left: 0 })).toEqual({ top: 8, right: 0, bottom: 8, left: 0 });
    expect(storeSides({})).toBeUndefined();
  });
});

const box = (id: string, props: ContainerElement['props'] = {}, children: ContainerElement['children'] = []): ContainerElement => ({ id, type: 'container', props, children });

describe('arranging a Container in a row (decision 0116)', () => {
  it('puts it in a row from Desktop, stacking on phones, its Containers sharing it equally', () => {
    const row = arrangedInRow(box('row', { flex: { direction: 'column', gap: 16 } }, [box('a'), box('b', { flexItem: { grow: 2 } }), { id: 't', type: 'text', props: { doc: { type: 'doc', content: [] } } }]), 'desktop');
    expect(row.props.flex).toEqual({ direction: { base: 'column', md: 'row' }, gap: 16 });
    expect(row.children.map((child) => child.type === 'container' && child.props.flexItem)).toEqual([{ grow: 1, basis: 0 }, { grow: 2 }, false]);
    expect(stacksOn(row, 'desktop')).toBe(false);
    expect(stacksOn(row, 'phone')).toBe(true);
  });

  it('turns a grid into a row, keeping its spacing', () => {
    const row = arrangedInRow(box('grid', { grid: { columns: 3, gap: 24 } }), 'tablet');
    expect(row.props.grid).toBeUndefined();
    expect(row.props.flex).toEqual({ direction: { base: 'column', md: 'row' }, gap: 24 });
  });

  it('on Tablet, changes tablets (and phones, which follow them), leaving desktops stacked', () => {
    const row = arrangedInRow(box('x', { flex: { direction: 'column' } }), 'tablet');
    expect(row.props.flex?.direction).toEqual({ base: 'row', lg: 'column' });
  });
});
