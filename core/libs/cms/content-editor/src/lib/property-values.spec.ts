import { describe, expect, it } from 'vitest';
import { resolveSides, sidesMatch, spacingStep, storeSides } from './property-values.service';

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
