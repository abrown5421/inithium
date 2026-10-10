import { useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import type { Animation } from '@inithium/shared-contracts';
import { Container, Loader, Text, toCssColor, useAnimation } from '@inithium/shared-ui-components';
import type { FooterProps } from '@inithium/shared-ui-composites';
import { PageReadyContext, type PageReadyContextValue } from './page-ready.context';
import type { PageTemplate } from './page-template.types';
import type { ResolvedPage } from './routes.service';

/** A page's default entrance and exit (decision 0079). */
export const DEFAULT_PAGE_ANIMATION: Required<Pick<Animation, 'entrance' | 'exit'>> = {
  entrance: { name: 'fadeIn', speed: 'fast' },
  exit: { name: 'fadeOut', speed: 'fast' },
};

/** A frame a page sits in, e.g. DefaultLayout. */
export type PageLayout = ComponentType<{ children?: ReactNode; footer?: FooterProps }>;

/** One visit to a page: what it shows, and where to scroll when it enters (null: leave the scroll alone). */
export type PageEntry = { key: string; locationKey: string; resolved: ResolvedPage; scrollTo: number | null };

// A page waiting its turn (loading during another's exit, or not ready yet) takes no space and can't be reached.
const WAITING: CSSProperties = { position: 'absolute', inset: 0, visibility: 'hidden', pointerEvents: 'none' };

type PageSlotProps = {
  entry: PageEntry;
  template?: PageTemplate;
  layout: PageLayout;
  footer?: FooterProps;
  /** The page on screen, not leaving. It enters once it's ready. */
  active: boolean;
  /** The page on screen, leaving: it plays its exit, then onExitEnd. */
  leaving: boolean;
  onExitEnd?: () => void;
};

/**
 * One page in its layout, animated by the shell (decision 0079). It renders at once, so its data loads even
 * while it waits, and enters only when it's the active page and ready (see usePageReady).
 */
export function PageSlot({ entry, template, layout: Layout, footer, active, leaving, onExitEnd }: PageSlotProps) {
  const { page, params } = entry.resolved;
  // The page record wins, then its template's defaults, then the shell's.
  const defaults = template?.defaults;

  // Ready unless the page claims readiness with usePageReady, whose layout effect runs before this one.
  const [ready, setReady] = useState(false);
  const claimed = useRef(false);
  const readiness = useMemo<PageReadyContextValue>(() => ({ claim: () => void (claimed.current = true), report: setReady }), []);
  useLayoutEffect(() => {
    if (!claimed.current) setReady(true);
  }, []);

  const show = active && ready;
  const { mounted, className, style, attach, getElement, handleAnimationEnd } = useAnimation({
    animation: {
      entrance: page.animation?.entrance ?? defaults?.animation?.entrance ?? DEFAULT_PAGE_ANIMATION.entrance,
      exit: page.animation?.exit ?? defaults?.animation?.exit ?? DEFAULT_PAGE_ANIMATION.exit,
    },
    show,
    onExitEnd,
  });

  // Leaving a page that never appeared (it wasn't ready yet): there's no exit to wait for.
  const leaveUnseen = useEffectEvent(() => {
    if (!mounted) onExitEnd?.();
  });
  useEffect(() => {
    if (leaving) leaveUnseen();
  }, [leaving]);

  // As it enters: scroll (to the top, or back to where a back/forward visit left off) and focus its heading.
  const arrived = useRef(false);
  useLayoutEffect(() => {
    if (!show || arrived.current) return;
    arrived.current = true;
    if (entry.scrollTo === null) return;
    window.scrollTo(0, entry.scrollTo);
    const heading = getElement()?.querySelector<HTMLElement>('h1');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [show, entry.scrollTo, getElement]);

  const Template = template?.component;
  const colours = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    background: toCssColor(page.bgColor ?? defaults?.bgColor ?? { color: 'surface', intensity: 50 }),
    color: toCssColor(page.textColor ?? defaults?.textColor ?? { color: 'surface', intensity: 950 }),
  } satisfies CSSProperties;

  return (
    <PageReadyContext.Provider value={readiness}>
      {active && !ready && (
        <Container flex={{ align: 'center', justify: 'center' }} flexItem={{ grow: 1 }} padding={{ all: 48 }}>
          <Loader size={32} label="Loading page" />
        </Container>
      )}
      <div
        ref={attach}
        className={mounted ? className : undefined}
        style={mounted ? { ...colours, ...style } : { ...colours, ...WAITING }}
        onAnimationEnd={handleAnimationEnd}
        aria-hidden={mounted ? undefined : true}
        inert={!mounted}
      >
        <Layout footer={footer}>
          {Template ? (
            <Template page={page} params={params} />
          ) : (
            <Text as="h1" fontSize={20}>
              No template is registered for '{page.template}'.
            </Text>
          )}
        </Layout>
      </div>
    </PageReadyContext.Provider>
  );
}
