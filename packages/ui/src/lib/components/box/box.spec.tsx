import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  BoxAs,
  Display,
  FlexDirection,
  FlexWrap,
  FlexAlign,
  FlexJustify,
  FlexContent,
  BorderRadius,
  BorderWidth,
  Overflow,
  Position,
  SpacingScale,
  GapScale,
} from './box.types';
import { ThemeColor } from '@inithium/types';
import { Box } from './box';

const CHILD_TEXT = 'Box Child';

const renderBox = (props = {}) =>
  render(<Box data-testid="box" {...props}>{CHILD_TEXT}</Box>);

const getBox = (): HTMLElement => screen.getByTestId('box');

describe('Box Component', () => {
  describe('Defaults', () => {
    it('should render a <div> by default', () => {
      renderBox();
      expect(getBox().tagName).toBe('DIV');
    });

    it('should apply default display and direction classes', () => {
      renderBox();
      const { className } = getBox();
      expect(className).toContain('flex');
      expect(className).toContain('flex-row');
    });

    it('should render children', () => {
      renderBox();
      expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
    });
  });

  describe('Semantic Element Matrix', () => {
    const tagMatrix: Array<[BoxAs, string]> = [
      ['div', 'DIV'],
      ['section', 'SECTION'],
      ['article', 'ARTICLE'],
      ['aside', 'ASIDE'],
      ['header', 'HEADER'],
      ['footer', 'FOOTER'],
      ['main', 'MAIN'],
      ['nav', 'NAV'],
      ['figure', 'FIGURE'],
      ['form', 'FORM'],
      ['ul', 'UL'],
      ['ol', 'OL'],
      ['li', 'LI'],
    ];

    it.each(tagMatrix)(
      'should render as <%s> when as="%s"',
      (as, expectedTag) => {
        renderBox({ as });
        expect(getBox().tagName).toBe(expectedTag);
      },
    );
  });

  describe('Display Matrix', () => {
    const displayMatrix: Array<[Display, string]> = [
      ['flex', 'flex'],
      ['inline-flex', 'inline-flex'],
      ['block', 'block'],
      ['inline-block', 'inline-block'],
      ['inline', 'inline'],
      ['grid', 'grid'],
      ['hidden', 'hidden'],
    ];

    it.each(displayMatrix)(
      'should apply "%s" class for display="%s"',
      (display, expectedClass) => {
        renderBox({ display });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Direction Matrix', () => {
    const directionMatrix: Array<[FlexDirection, string]> = [
      ['row', 'flex-row'],
      ['row-reverse', 'flex-row-reverse'],
      ['col', 'flex-col'],
      ['col-reverse', 'flex-col-reverse'],
    ];

    it.each(directionMatrix)(
      'should apply "%s" class for direction="%s"',
      (direction, expectedClass) => {
        renderBox({ direction });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Wrap Matrix', () => {
    const wrapMatrix: Array<[FlexWrap, string]> = [
      ['wrap', 'flex-wrap'],
      ['nowrap', 'flex-nowrap'],
      ['wrap-reverse', 'flex-wrap-reverse'],
    ];

    it.each(wrapMatrix)(
      'should apply "%s" class for wrap="%s"',
      (wrap, expectedClass) => {
        renderBox({ wrap });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Align Matrix', () => {
    const alignMatrix: Array<[FlexAlign, string]> = [
      ['start', 'items-start'],
      ['end', 'items-end'],
      ['center', 'items-center'],
      ['baseline', 'items-baseline'],
      ['stretch', 'items-stretch'],
    ];

    it.each(alignMatrix)(
      'should apply "%s" class for align="%s"',
      (align, expectedClass) => {
        renderBox({ align });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Justify Matrix', () => {
    const justifyMatrix: Array<[FlexJustify, string]> = [
      ['start', 'justify-start'],
      ['end', 'justify-end'],
      ['center', 'justify-center'],
      ['between', 'justify-between'],
      ['around', 'justify-around'],
      ['evenly', 'justify-evenly'],
    ];

    it.each(justifyMatrix)(
      'should apply "%s" class for justify="%s"',
      (justify, expectedClass) => {
        renderBox({ justify });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Content Matrix', () => {
    const contentMatrix: Array<[FlexContent, string]> = [
      ['start', 'content-start'],
      ['end', 'content-end'],
      ['center', 'content-center'],
      ['between', 'content-between'],
      ['around', 'content-around'],
      ['evenly', 'content-evenly'],
      ['stretch', 'content-stretch'],
    ];

    it.each(contentMatrix)(
      'should apply "%s" class for content="%s"',
      (content, expectedClass) => {
        renderBox({ content });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Flex Utility Flags', () => {
    it('should apply flex-grow when grow=true', () => {
      renderBox({ grow: true });
      expect(getBox().className).toContain('flex-grow');
    });

    it('should apply flex-shrink-0 when shrink=false', () => {
      renderBox({ shrink: false });
      expect(getBox().className).toContain('flex-shrink-0');
    });

    it('should apply flex-1 when flex=true', () => {
      renderBox({ flex: true });
      expect(getBox().className).toContain('flex-1');
    });
  });

  describe('Position Matrix', () => {
    const positionMatrix: Array<[Position, string]> = [
      ['static', 'static'],
      ['relative', 'relative'],
      ['absolute', 'absolute'],
      ['fixed', 'fixed'],
      ['sticky', 'sticky'],
    ];

    it.each(positionMatrix)(
      'should apply "%s" class for position="%s"',
      (position, expectedClass) => {
        renderBox({ position });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Sizing Flags', () => {
    it('should apply w-full when fullWidth=true', () => {
      renderBox({ fullWidth: true });
      expect(getBox().className).toContain('w-full');
    });

    it('should apply h-full when fullHeight=true', () => {
      renderBox({ fullHeight: true });
      expect(getBox().className).toContain('h-full');
    });
  });

  describe('Padding', () => {
    it('should apply p-4 for p="4"', () => {
      renderBox({ p: '4' as SpacingScale });
      expect(getBox().className).toContain('p-4');
    });

    it('should apply px-6 for px="6"', () => {
      renderBox({ px: '6' as SpacingScale });
      expect(getBox().className).toContain('px-6');
    });

    it('should apply py-2 for py="2"', () => {
      renderBox({ py: '2' as SpacingScale });
      expect(getBox().className).toContain('py-2');
    });

    it('should apply directional padding classes', () => {
      renderBox({ pt: '1', pr: '2', pb: '3', pl: '4' } as any);
      const { className } = getBox();
      expect(className).toContain('pt-1');
      expect(className).toContain('pr-2');
      expect(className).toContain('pb-3');
      expect(className).toContain('pl-4');
    });
  });

  describe('Margin', () => {
    it('should apply m-4 for m="4"', () => {
      renderBox({ m: '4' as SpacingScale });
      expect(getBox().className).toContain('m-4');
    });

    it('should apply mx-auto for mx="auto"', () => {
      renderBox({ mx: 'auto' as SpacingScale });
      expect(getBox().className).toContain('mx-auto');
    });

    it('should apply directional margin classes', () => {
      renderBox({ mt: '1', mr: '2', mb: '3', ml: '4' } as any);
      const { className } = getBox();
      expect(className).toContain('mt-1');
      expect(className).toContain('mr-2');
      expect(className).toContain('mb-3');
      expect(className).toContain('ml-4');
    });
  });

  describe('Gap', () => {
    it('should apply gap-4 for gap="4"', () => {
      renderBox({ gap: '4' as GapScale });
      expect(getBox().className).toContain('gap-4');
    });

    it('should apply gap-x-2 for gapX="2"', () => {
      renderBox({ gapX: '2' as GapScale });
      expect(getBox().className).toContain('gap-x-2');
    });

    it('should apply gap-y-8 for gapY="8"', () => {
      renderBox({ gapY: '8' as GapScale });
      expect(getBox().className).toContain('gap-y-8');
    });
  });

  describe('Background Color Matrix', () => {
    const bgMatrix: Array<[ThemeColor, string]> = [
      ['primary', 'bg-primary'],
      ['secondary', 'bg-secondary'],
      ['accent', 'bg-accent'],
      ['success', 'bg-success'],
      ['warning', 'bg-warning'],
      ['danger', 'bg-danger'],
      ['info', 'bg-info'],
      ['surface2', 'bg-surface2'],
    ];

    it.each(bgMatrix)(
      'should apply "%s" bg class for bg="%s"',
      (bg, expectedClass) => {
        renderBox({ bg });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Border', () => {
    it('should apply border class when border=true', () => {
      renderBox({ border: true });
      expect(getBox().className).toContain('border');
    });

    it('should apply border color class when border=true and borderColor is set', () => {
      renderBox({ border: true, borderColor: 'accent' });
      const { className } = getBox();
      expect(className).toContain('border');
      expect(className).toContain('border-accent');
    });

    const borderWidthMatrix: Array<[BorderWidth, string]> = [
      ['0', 'border-0'],
      ['1', 'border'],
      ['2', 'border-2'],
      ['4', 'border-4'],
      ['8', 'border-8'],
    ];

    it.each(borderWidthMatrix)(
      'should apply "%s" border-width class for borderWidth="%s"',
      (borderWidth, expectedClass) => {
        renderBox({ border: true, borderWidth });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Border Radius Matrix', () => {
    const roundedMatrix: Array<[BorderRadius, string]> = [
      ['none', 'rounded-none'],
      ['sm', 'rounded-sm'],
      ['md', 'rounded-md'],
      ['lg', 'rounded-lg'],
      ['xl', 'rounded-xl'],
      ['2xl', 'rounded-2xl'],
      ['3xl', 'rounded-3xl'],
      ['full', 'rounded-full'],
    ];

    it.each(roundedMatrix)(
      'should apply "%s" rounded class for rounded="%s"',
      (rounded, expectedClass) => {
        renderBox({ rounded });
        expect(getBox().className).toContain(expectedClass);
      },
    );
  });

  describe('Overflow Matrix', () => {
    const overflowMatrix: Array<[Overflow, string]> = [
      ['auto', 'overflow-auto'],
      ['hidden', 'overflow-hidden'],
      ['visible', 'overflow-visible'],
      ['scroll', 'overflow-scroll'],
      ['clip', 'overflow-clip'],
    ];

    it.each(overflowMatrix)(
      'should apply "%s" overflow class for overflow="%s"',
      (overflow, expectedClass) => {
        renderBox({ overflow });
        expect(getBox().className).toContain(expectedClass);
      },
    );

    it('should apply overflow-x-hidden for overflowX="hidden"', () => {
      renderBox({ overflowX: 'hidden' });
      expect(getBox().className).toContain('overflow-x-hidden');
    });

    it('should apply overflow-y-scroll for overflowY="scroll"', () => {
      renderBox({ overflowY: 'scroll' });
      expect(getBox().className).toContain('overflow-y-scroll');
    });
  });

  describe('Composition', () => {
    it('should merge consumer className without overwriting token classes', () => {
      renderBox({ className: 'custom-class' });
      const { className } = getBox();
      expect(className).toContain('custom-class');
      expect(className).toContain('flex');
    });

    it('should forward arbitrary HTML attributes', () => {
      renderBox({ 'aria-label': 'container', id: 'box-id' });
      const el = getBox();
      expect(el.getAttribute('aria-label')).toBe('container');
      expect(el.getAttribute('id')).toBe('box-id');
    });

    it('should apply a combined multi-prop style correctly', () => {
      renderBox({
        direction: 'col',
        align: 'center',
        justify: 'between',
        gap: '4',
        p: '6',
        bg: 'surface2',
        rounded: 'lg',
        border: true,
        borderColor: 'primary',
        fullWidth: true,
      });
      const { className } = getBox();
      expect(className).toContain('flex-col');
      expect(className).toContain('items-center');
      expect(className).toContain('justify-between');
      expect(className).toContain('gap-4');
      expect(className).toContain('p-6');
      expect(className).toContain('bg-surface2');
      expect(className).toContain('rounded-lg');
      expect(className).toContain('border');
      expect(className).toContain('border-primary');
      expect(className).toContain('w-full');
    });
  });
});