import type { z } from 'zod';
import type { richTextStyleAttrsSchema } from './rich-text.schema';
import type { contentAlignSchema, contentTypographySchema } from './content-common.schema';
import type {
  buttonElementPropsSchema,
  containerElementPropsSchema,
  dividerElementPropsSchema,
  iconElementPropsSchema,
  imageElementPropsSchema,
  textElementPropsSchema,
} from './content-elements.schema';
import type { contentDocumentSchema, pageContentSchema, pageDraftSaveSchema } from './content.schema';
import type {
  bannerBlockSchema,
  buttonsBlockSchema,
  contentBlockSchema,
  contentButtonSchema,
  contentVisibilitySchema,
  dividerBlockSchema,
  featureBlockSchema,
  headingBlockSchema,
  imageBlockSchema,
  richTextBlockSchema,
  spacerBlockSchema,
} from './v1/content-blocks-v1.schema';
import type { contentColumnSchema, contentDocumentV1Schema, contentSectionSchema } from './v1/content-v1.schema';

export type ContentAlign = z.infer<typeof contentAlignSchema>;
export type ContentTypography = z.infer<typeof contentTypographySchema>;
export type RichTextStyleAttrs = z.infer<typeof richTextStyleAttrsSchema>;

// --- Elements (decision 0116) ---

export type ContainerElementProps = z.infer<typeof containerElementPropsSchema>;
export type TextElementProps = z.infer<typeof textElementPropsSchema>;
export type ImageElementProps = z.infer<typeof imageElementPropsSchema>;
export type IconElementProps = z.infer<typeof iconElementPropsSchema>;
export type ButtonElementProps = z.infer<typeof buttonElementPropsSchema>;
export type DividerElementProps = z.infer<typeof dividerElementPropsSchema>;

// Elements nest, so their envelope is written out here (a recursive schema can't infer its own type); each one's
// props are still inferred from its schema.
type ElementOf<Type extends string, Props> = { id: string; type: Type; label?: string; props: Props };

export type ContainerElement = ElementOf<'container', ContainerElementProps> & { children: ContentElement[] };
export type TextElement = ElementOf<'text', TextElementProps>;
export type ImageElement = ElementOf<'image', ImageElementProps>;
export type IconElement = ElementOf<'icon', IconElementProps>;
export type ButtonElement = ElementOf<'button', ButtonElementProps>;
export type DividerElement = ElementOf<'divider', DividerElementProps>;

/** A plugin element's type, e.g. 'plugin-ecom:product-grid'. */
export type PluginElementType = `plugin-${string}:${string}`;
export type PluginElement = ElementOf<PluginElementType, Record<string, unknown>> & { children?: ContentElement[] };

export type CoreContentElement = ContainerElement | TextElement | ImageElement | IconElement | ButtonElement | DividerElement;
export type ContentElement = CoreContentElement | PluginElement;
export type ContentElementType = CoreContentElement['type'];

export type ContentDocument = z.infer<typeof contentDocumentSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type PageDraftSave = z.infer<typeof pageDraftSaveSchema>;

// --- Version 1 (decision 0093): sections, columns and blocks ---

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
export type ContentDocumentV1 = z.infer<typeof contentDocumentV1Schema>;
