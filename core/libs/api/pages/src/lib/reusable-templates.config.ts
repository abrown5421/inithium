import type { ReusableTemplate } from '@inithium/shared-contracts';

/** A reusable template as the api knows it: what the CMS lists, and whether its pages hold blocks. */
export type ReusableTemplateConfig = ReusableTemplate & {
  /** Its pages carry `content` (draft and published blocks), starting with one empty section. */
  content: boolean;
};

/**
 * The templates the CMS can create pages from (decision 0093). Their layouts must match the `web` templates with the
 * same keys. Core has one; plugin ones arrive through a slot.
 */
export const reusableTemplates: readonly ReusableTemplateConfig[] = [
  {
    key: 'content',
    label: 'Content page',
    description: 'A page you build from sections and blocks: text, buttons, banners and more.',
    layouts: ['full-width', 'default', 'bare'],
    content: true,
  },
];

/** The CMS's view of the reusable templates (without api-only details). */
export const listReusableTemplates = (): ReusableTemplate[] =>
  reusableTemplates.map(({ key, label, description, layouts }) => ({ key, label, description, layouts: [...layouts] }));
