/**
 * The setup checklist slot (decisions 0015, 0120): a step a new site should take, shown on the CMS dashboard's Setup
 * checklist. Register a plugin's (or `libs/client/`'s) in the api's registry (`apps/api/src/app/plugins.registry.ts`).
 */
export type SetupChecklistItem = {
  /** Unique among items; a plugin's are `plugin-<name>:<step>`, e.g. 'plugin-ecom:payments'. */
  id: string;
  /** What to do, e.g. 'Set up payments'. */
  label: string;
  /** A line saying why or how. */
  description?: string;
  /** Where in the CMS to do it, from the CMS's root, e.g. '/settings'. */
  href?: string;
  /** Where it sits in the list: core's steps use 100–900. */
  order: number;
  /**
   * Whether it's done, read from data each time the checklist loads. Leave it out for a step that can't be detected:
   * an owner or admin then ticks it by hand, for the whole site.
   */
  isDone?: () => Promise<boolean>;
};
