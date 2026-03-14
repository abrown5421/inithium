import React from 'react';
import {
  Disclosure as HeadlessDisclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface DisclosureItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface DisclosureProps {
  items: DisclosureItem[];
  className?: string;
}

const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** Single controlled/uncontrolled disclosure */
export const DisclosureSingle: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}> = ({ trigger, children, defaultOpen = false, className }) => (
  <HeadlessDisclosure defaultOpen={defaultOpen}>
    {({ open }) => (
      <div
        className={cn(
          'rounded-(--radius-lg) border border-(--ui-border) overflow-hidden',
          className,
        )}
      >
        <DisclosureButton
          className={cn(
            'flex w-full items-center justify-between',
            'px-4 py-3 text-left text-sm font-medium',
            'bg-(--ui-bg) text-(--ui-text)',
            'hover:bg-(--ui-bg-subtle) transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
            'focus-visible:ring-(--color-brand-500)',
          )}
        >
          <span>{trigger}</span>
          <ChevronIcon
            className={cn(
              'size-4 text-(--ui-text-muted) shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </DisclosureButton>

        <DisclosurePanel
          transition
          className={cn(
            'px-4 pb-4 pt-2 text-sm text-(--ui-text-muted)',
            'border-t border-(--ui-border) bg-(--ui-bg-subtle)',
            'transition-all duration-150 ease-out',
            'data-[closed]:-translate-y-1 data-[closed]:opacity-0',
          )}
        >
          {children}
        </DisclosurePanel>
      </div>
    )}
  </HeadlessDisclosure>
);

/** Accordion — list of disclosures */
export const Disclosure: React.FC<DisclosureProps> = ({ items, className }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {items.map((item) => (
      <DisclosureSingle
        key={item.id}
        trigger={item.trigger}
        defaultOpen={item.defaultOpen}
      >
        {item.content}
      </DisclosureSingle>
    ))}
  </div>
);
