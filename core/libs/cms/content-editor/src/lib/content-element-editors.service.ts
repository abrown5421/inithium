import type { ComponentType } from 'react';
import type { ContentElement, Page, PluginElement, PluginElementType } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';
import type { EditDevice } from './device-values.service';

/** What a plugin element's properties panel gets, as core's panels do. */
export type PluginElementPropertiesProps = {
  element: PluginElement;
  onChange: (element: PluginElement) => void;
  /** The device being edited (the preview's). Device-aware values can use `DeviceField` and `writeAt()`. */
  device: EditDevice;
  /** Every page, for links. */
  pages: Page[];
  /** Each field's problem, keyed by its path within the element, e.g. 'props.columns'. */
  problems: Record<string, string>;
};

/**
 * A plugin's (or libs/client's) element in the page builder (decision 0116): how the Add picker and the Layers show it,
 * what a new one starts as, and its properties panel. The plugin's `cms` lib exports it; the CMS's registry lists it.
 */
export type ContentElementEditor = {
  type: PluginElementType;
  label: string;
  icon: IconName;
  /** A line about it in the Add picker. */
  description: string;
  /** The Add picker's group it joins, e.g. 'Text and media'; a new name makes a new group after core's. Default 'More'. */
  group?: string;
  /** A new element's props (valid for its contract) and, if it holds others, its first children. */
  create: () => { props: Record<string, unknown>; children?: ContentElement[] };
  /** Its properties. Without one, the panel says it has no settings. */
  properties?: ComponentType<PluginElementPropertiesProps>;
};

const registered = new Map<string, ContentElementEditor>();

/** Sets the page builder's plugin elements, replacing any set before: the CMS calls it once with its registry's list. */
export function registerContentElementEditors(editors: readonly ContentElementEditor[]): void {
  registered.clear();
  for (const editor of editors) {
    if (registered.has(editor.type)) throw new Error(`Two page builder entries for '${editor.type}'`);
    registered.set(editor.type, editor);
  }
}

/** A plugin element's builder entry, if its plugin is registered. */
export const contentElementEditor = (type: string): ContentElementEditor | undefined => registered.get(type);

/** Every registered plugin element's builder entry, in registry order. */
export const contentElementEditors = (): ContentElementEditor[] => [...registered.values()];
