import { z } from 'zod';
import { buttonVariantSchema } from '../../ui/button.schema';
import { colorValueSchema, solidColorValueSchema } from '../../ui/colors.schema';
import { dividerLineStyleSchema } from '../../ui/divider.schema';
import { iconNameSchema } from '../../ui/icon.schema';
import { polyPatternSchema } from '../../ui/poly-pattern.schema';
import { contentAlignSchema, contentIdSchema, contentShortTextSchema as shortText, contentTypographySchema } from '../content-common.schema';
import { contentLinkSchema } from '../content-links.schema';
import { richTextDocumentSchema } from '../rich-text.schema';

// Version 1 of the content format (decision 0093, superseded by 0116): sections, columns and blocks. Kept so stored
// version 1 content can be read and upgraded (`readContentDocument`).

/** Hides a block on phones (below the section's stacking breakpoint) or on wider screens. */
export const contentVisibilitySchema = z
  .object({ phone: z.boolean().optional(), desktop: z.boolean().optional() })
  .strict();

/** What every block has (decision 0093). */
const blockBase = {
  id: contentIdSchema,
  hideOn: contentVisibilitySchema.optional(),
};

/** A heading. Level 1 is for a page whose title isn't shown elsewhere; most use 2. */
export const headingBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('heading'),
    text: shortText(200, 'the heading'),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    align: contentAlignSchema.optional(),
    textColor: colorValueSchema.optional(),
    typography: contentTypographySchema.optional(),
  })
  .strict();

/** Formatted text: paragraphs, sub-headings, lists, quotes, bold, italic, underline and links. */
export const richTextBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('rich-text'),
    doc: richTextDocumentSchema,
    align: contentAlignSchema.optional(),
    textColor: colorValueSchema.optional(),
    /** The running text's typography; sub-headings inside keep the display font unless words are restyled. */
    typography: contentTypographySchema.optional(),
  })
  .strict();

/** One button in a buttons block. */
export const contentButtonSchema = z
  .object({
    id: contentIdSchema,
    label: shortText(60, 'the button’s text'),
    link: contentLinkSchema,
    variant: buttonVariantSchema.optional(),
    color: solidColorValueSchema.optional(),
    icon: iconNameSchema.optional(),
  })
  .strict();

/** A row of one to four buttons, e.g. calls to action. */
export const buttonsBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('buttons'),
    buttons: z.array(contentButtonSchema).min(1, { error: 'Add a button' }).max(4, { error: 'Use 4 buttons or fewer' }),
    align: contentAlignSchema.optional(),
  })
  .strict();

/** A horizontal rule. */
export const dividerBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('divider'),
    color: colorValueSchema.optional(),
    thickness: z.number().int().min(1).max(8).optional(),
    lineStyle: dividerLineStyleSchema.optional(),
  })
  .strict();

/** Empty space, in px. */
export const spacerBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('spacer'),
    height: z.number().int().min(4, { error: 'Use 4px or more' }).max(400, { error: 'Use 400px or less' }),
  })
  .strict();

/** An icon with a title and a short text, e.g. one of a row of features. */
export const featureBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('feature'),
    icon: iconNameSchema,
    title: shortText(100, 'a title'),
    text: z.string().trim().max(500, { error: 'Use 500 characters or fewer' }).optional(),
    align: z.enum(['start', 'center']).optional(),
    iconColor: colorValueSchema.optional(),
    titleColor: colorValueSchema.optional(),
    textColor: colorValueSchema.optional(),
    titleTypography: contentTypographySchema.optional(),
    textTypography: contentTypographySchema.optional(),
  })
  .strict();

/** A PolyBanner, optionally with a heading and a line of text over it. */
export const bannerBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('banner'),
    pattern: polyPatternSchema,
    height: z.number().int().min(80, { error: 'Use 80px or more' }).max(600, { error: 'Use 600px or less' }),
    heading: z.string().trim().max(120, { error: 'Use 120 characters or fewer' }).optional(),
    text: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    align: contentAlignSchema.optional(),
    textColor: colorValueSchema.optional(),
    headingTypography: contentTypographySchema.optional(),
    textTypography: contentTypographySchema.optional(),
  })
  .strict();

/**
 * An image from the site's assets (decisions 0093, 0098), stored by id. It must be described (alt text) unless it's
 * marked decorative; the editor fills the alt in from the asset's own when the image is chosen.
 */
export const imageBlockSchema = z
  .object({
    ...blockBase,
    type: z.literal('image'),
    assetId: z.string().min(1, { error: 'Choose an image' }),
    alt: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    /** Purely visual: hidden from screen readers, and needs no alt text. */
    decorative: z.boolean().optional(),
    caption: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    captionColor: colorValueSchema.optional(),
    captionTypography: contentTypographySchema.optional(),
    /** 'full' fills the column; a number caps the width in px. Default 'full'. */
    width: z.union([z.literal('full'), z.number().int().min(40).max(4000)]).optional(),
    align: contentAlignSchema.optional(),
    /** Corner rounding, in px. */
    radius: z.number().int().min(0).max(64).optional(),
    /** Makes the image a link. */
    link: contentLinkSchema.optional(),
  })
  .strict()
  .refine((block) => block.decorative || Boolean(block.alt), {
    error: 'Describe the image, or mark it decorative',
    path: ['alt'],
  });

/** Every block a content page can hold (decision 0093). */
export const contentBlockSchema = z.discriminatedUnion('type', [
  headingBlockSchema,
  imageBlockSchema,
  richTextBlockSchema,
  buttonsBlockSchema,
  dividerBlockSchema,
  spacerBlockSchema,
  featureBlockSchema,
  bannerBlockSchema,
]);

/** The block types, in the order the editor offers them. */
export const contentBlockTypes = ['heading', 'rich-text', 'image', 'buttons', 'feature', 'banner', 'divider', 'spacer'] as const;
