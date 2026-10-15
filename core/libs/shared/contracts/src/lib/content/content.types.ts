import type { z } from 'zod';
import type { richTextStyleAttrsSchema } from './rich-text.schema';
import type {
  bannerBlockSchema,
  contentTypographySchema,
  buttonsBlockSchema,
  contentAlignSchema,
  contentBlockSchema,
  contentButtonSchema,
  contentVisibilitySchema,
  dividerBlockSchema,
  featureBlockSchema,
  headingBlockSchema,
  imageBlockSchema,
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
export type ImageBlock = z.infer<typeof imageBlockSchema>;
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
export type ContentTypography = z.infer<typeof contentTypographySchema>;
export type RichTextStyleAttrs = z.infer<typeof richTextStyleAttrsSchema>;
