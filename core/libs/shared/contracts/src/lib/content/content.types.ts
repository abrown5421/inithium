import type { z } from 'zod';
import type {
  bannerBlockSchema,
  buttonsBlockSchema,
  contentAlignSchema,
  contentBlockSchema,
  contentButtonSchema,
  contentVisibilitySchema,
  dividerBlockSchema,
  featureBlockSchema,
  headingBlockSchema,
  richTextBlockSchema,
  spacerBlockSchema,
} from './content-blocks.schema';
import type {
  contentColumnSchema,
  contentDocumentSchema,
  contentSectionSchema,
  pageContentSchema,
  pageDraftSaveSchema,
} from './content.schema';

export type ContentAlign = z.infer<typeof contentAlignSchema>;
export type ContentVisibility = z.infer<typeof contentVisibilitySchema>;
export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type RichTextBlock = z.infer<typeof richTextBlockSchema>;
export type ContentButton = z.infer<typeof contentButtonSchema>;
export type ButtonsBlock = z.infer<typeof buttonsBlockSchema>;
export type DividerBlock = z.infer<typeof dividerBlockSchema>;
export type SpacerBlock = z.infer<typeof spacerBlockSchema>;
export type FeatureBlock = z.infer<typeof featureBlockSchema>;
export type BannerBlock = z.infer<typeof bannerBlockSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentBlockType = ContentBlock['type'];
export type ContentColumn = z.infer<typeof contentColumnSchema>;
export type ContentSection = z.infer<typeof contentSectionSchema>;
export type ContentDocument = z.infer<typeof contentDocumentSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type PageDraftSave = z.infer<typeof pageDraftSaveSchema>;
