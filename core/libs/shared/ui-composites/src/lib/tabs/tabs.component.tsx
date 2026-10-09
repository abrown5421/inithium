import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import type { TabItem, TabsSerializableProps } from '@inithium/shared-contracts';
import { Container, Icon, toCssColor, type AnimationRuntimeProps, type IconName } from '@inithium/shared-ui-components';
import { tabsStyleSheet } from './tabs.styles';

/** Icon size in a tab, in px. */
const ICON_SIZE = 16;

/** One tab: its value, label, optional icon, whether it's disabled, and its panel's content. */
export type TabsItem = Omit<TabItem, 'icon'> & { icon?: IconName; content: ReactNode };

export type TabsProps = Omit<TabsSerializableProps, 'tabs'> &
  AnimationRuntimeProps & {
    tabs: TabsItem[];
    /** The active tab's value. */
    value?: string;
    /** The tab active at first. Default: the first tab that isn't disabled. */
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Keeps inactive panels rendered (hidden), so what's typed in them survives switching. Default false. */
    keepMounted?: boolean;
    /** Names the tab bar for screen readers, e.g. 'Account settings'. */
    'aria-label'?: string;
  };

/**
 * A set of panels with one shown at a time, chosen by tabs (decisions 0056 and 0068): Radix's accessible tabs, with
 * an underline in one colour that slides to the active tab, and panels that fade in. Tabs are data, so their
 * labels can be stored; each tab's content is any React content.
 */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  color = 'primary',
  fill = false,
  keepMounted = false,
  margin,
  padding,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
  'aria-label': ariaLabel,
}: TabsProps) {
  const [current, setCurrent] = useState(defaultValue ?? tabs.find((tab) => !tab.disabled)?.value);
  const active = value ?? current;
  const list = useRef<HTMLDivElement>(null);

  // Places the underline under the active tab, and again whenever a tab resizes (e.g. when the web font loads).
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const update = () => {
      const tab = element.querySelector<HTMLElement>('[role=tab][data-state=active]');
      element.style.setProperty('--ui-tabs-indicator-x', `${tab?.offsetLeft ?? 0}px`);
      element.style.setProperty('--ui-tabs-indicator-width', `${tab?.offsetWidth ?? 0}px`);
    };
    update();
    // From the next frame on, the underline slides instead of jumping.
    const frame = requestAnimationFrame(() => element.setAttribute('data-measured', ''));
    const observer = new ResizeObserver(update);
    element.querySelectorAll('[role=tab]').forEach((tab) => observer.observe(tab));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many Tabs render. */}
      <style href="inithium-tabs" precedence="default">
        {tabsStyleSheet}
      </style>
      <RadixTabs.Root
        asChild
        value={active}
        onValueChange={(next) => {
          setCurrent(next);
          onValueChange?.(next);
        }}
        className="ui-tabs"
        data-fill={fill ? '' : undefined}
        style={{ '--ui-tabs-accent': toCssColor(color) } as CSSProperties}
      >
        <Container
          margin={margin}
          padding={padding}
          animation={animation}
          show={show}
          replay={replay}
          onEntranceEnd={onEntranceEnd}
          onExitEnd={onExitEnd}
        >
          <RadixTabs.List ref={list} className="ui-tabs-list" aria-label={ariaLabel}>
            {tabs.map((tab) => (
              <RadixTabs.Trigger key={tab.value} value={tab.value} disabled={tab.disabled} className="ui-tabs-trigger">
                {tab.icon && <Icon name={tab.icon} size={ICON_SIZE} />}
                {tab.label}
              </RadixTabs.Trigger>
            ))}
            <span className="ui-tabs-indicator" aria-hidden="true" />
          </RadixTabs.List>
          {tabs.map((tab) => (
            <RadixTabs.Content key={tab.value} value={tab.value} forceMount={keepMounted || undefined} className="ui-tabs-panel">
              {tab.content}
            </RadixTabs.Content>
          ))}
        </Container>
      </RadixTabs.Root>
    </>
  );
}
