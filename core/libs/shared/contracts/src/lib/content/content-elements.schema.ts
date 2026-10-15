import { z } from 'zod';
import { entranceAnimationSchema } from '../ui/animation.schema';
import { colorValueSchema } from '../ui/colors.schema';
import { imageFitSchema } from '../ui/component-props.schema';
import { dividerLabelAlignSchema } from '../ui/divider.schema';
import { iconNameSchema } from '../ui/icon.schema';
import { marginSchema } from '../ui/spacing.schema';
import {
  buttonStylePropsSchema,
  containerStylePropsSchema,
  dividerStylePropsSchema,
  iconStylePropsSchema,
  imageStylePropsSchema,
} from '../ui/style-props.schema';
import { withVariants } from '../ui/variants.schema';
import { contentAlignSchema, contentIdSchema, contentShortTextSchema, contentTypographySchema } from './content-common.schema';
import type { ContainerElement, ContentElement, PluginElement, PluginElementType } from './content.types';
import { contentLinkSchema } from './content-links.schema';
import { richTextDocumentSchema } from './rich-text.schema';

/*
 * A content page's elements (decision 0116): a tree of the UI library's components, each stored as its type and its
 * props. A library element's props are its component's stored props (style props with their breakpoint and state
 * variants) plus its content, e.g. an image's asset id. Only Container holds other elements.
 */

/** The most elements a page holds, counting every nested one. */
export const MAX_CONTENT_ELEMENTS = 250;
/** How deep elements nest: an element on the page itself is at depth 1. */
export const MAX_CONTENT_DEPTH = 10;

/** Only an entrance animation: content plays as it arrives and is never removed. */
const entranceOnlySchema = z.object({ entrance: entranceAnimationSchema.optional() }).strict();

/** Hides the element at some sizes, e.g. { base: true, md: false } shows it from tablets up. */
const hiddenSchema = withVariants(z.boolean());

/**
 * What every element but Container takes. The renderer applies it to a box around the element, so it works the same
 * for components that don't take these props themselves (e.g. rich text).
 */
const elementBoxProps = {
  hidden: hiddenSchema.optional(),
  margin: withVariants(marginSchema).optional(),
  animation: entranceOnlySchema.optional(),
};

/**
 * A Container: layout (stack, row or grid), spacing, size, background colour, text colour, border, radius and
 * shadow, and the elements inside it. Positioning and overflow are left out: they break layouts too easily.
 */
export const containerElementPropsSchema = containerStylePropsSchema
  .omit({ position: true, overflow: true })
  .extend({
    animation: entranceOnlySchema.optional(),
    /** Adds index × ms to each direct child's entrance delay, so children cascade in. */
    stagger: z.number().int().min(0).max(2000).optional(),
    /** An id for links to this element, e.g. 'pricing' for '#pricing'. */
    anchor: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase words joined by hyphens').max(60).optional(),
  })
  .strict();

/**
 * Text: rich text (decision 0102), from headings to quotes, with its alignment, colour, and the typography of its
 * running text and of its headings (decision 0115).
 */
export const textElementPropsSchema = z
  .object({
    doc: richTextDocumentSchema,
    align: contentAlignSchema.optional(),
    textColor: colorValueSchema.optional(),
    /** The running text's font, weight and size. */
    typography: contentTypographySchema.optional(),
    /** The headings' font, weight and size. Left out, headings keep the display font and their sizes. */
    headingTypography: contentTypographySchema.optional(),
    ...elementBoxProps,
  })
  .strict();

/**
 * An image from the site's assets (decision 0098), stored by id. It must be described (alt text) unless it's marked
 * decorative. Its width defaults to the space it's in.
 */
export const imageElementPropsSchema = imageStylePropsSchema
  .omit({ margin: true })
  .extend({
    assetId: z.string().min(1, { error: 'Choose an image' }),
    alt: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    /** Purely visual: hidden from screen readers, and needs no alt text. */
    decorative: z.boolean().optional(),
    fit: imageFitSchema.optional(),
    aspectRatio: z.number().positive().max(10).optional(),
    caption: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    captionColor: colorValueSchema.optional(),
    captionTypography: contentTypographySchema.optional(),
    /** Where the image and its caption sit across their space. Default 'center'. */
    align: contentAlignSchema.optional(),
    /** Makes the image a link. */
    link: contentLinkSchema.optional(),
    ...elementBoxProps,
  })
  .strict()
  .refine((props) => props.decorative || Boolean(props.alt), {
    error: 'Describe the image, or mark it decorative',
    path: ['alt'],
  });

/** A Lucide icon, its size and colours. Decorative unless it has a label. */
export const iconElementPropsSchema = iconStylePropsSchema
  .pick({
    textColor: true,
    bgColor: true,
    borderColor: true,
    padding: true,
    radius: true,
    borderWidth: true,
    borderStyle: true,
    shadow: true,
    size: true,
    strokeWidth: true,
  })
  .extend({
    name: iconNameSchema,
    /** Describes the icon to screen readers, when it means something. */
    label: z.string().trim().min(1).max(120).optional(),
    ...elementBoxProps,
  })
  .strict();

/** One Button: its label, where it goes, and its look (decision 0054). */
export const buttonElementPropsSchema = buttonStylePropsSchema
  .omit({ margin: true })
  .extend({
    label: contentShortTextSchema(60, 'the button’s text'),
    link: contentLinkSchema,
    leadingIcon: iconNameSchema.optional(),
    /** Default: an external-link icon when the link opens a new tab. */
    trailingIcon: iconNameSchema.optional(),
    ...elementBoxProps,
  })
  .strict();

/** A Divider: a line, optionally with a label in it. Decorative unless it has a label. */
export const dividerElementPropsSchema = dividerStylePropsSchema
  .omit({ margin: true })
  .extend({
    thickness: z.number().int().min(1).max(8).optional(),
    label: z.string().trim().min(1).max(60).optional(),
    labelAlign: dividerLabelAlignSchema.optional(),
    ...elementBoxProps,
  })
  .strict();

/** A name for an element, shown in the editor's Layers. */
export const contentElementLabelSchema = z.string().trim().min(1).max(60, { error: 'Use 60 characters or fewer' });

const element = <Type extends string, Props extends z.ZodType>(type: Type, props: Props) =>
  z.object({ id: contentIdSchema, type: z.literal(type), label: contentElementLabelSchema.optional(), props }).strict();

const childrenSchema = z.array(z.lazy(() => contentElementSchema));

export const contentContainerElementSchema: z.ZodType<ContainerElement> = z
  .object({
    id: contentIdSchema,
    type: z.literal('container'),
    label: contentElementLabelSchema.optional(),
    props: containerElementPropsSchema,
    children: childrenSchema,
  })
  .strict();
export const contentTextElementSchema = element('text', textElementPropsSchema);
export const contentImageElementSchema = element('image', imageElementPropsSchema);
export const contentIconElementSchema = element('icon', iconElementPropsSchema);
export const contentButtonElementSchema = element('button', buttonElementPropsSchema);
export const contentDividerElementSchema = element('divider', dividerElementPropsSchema);

/** Core's element types, in the order the editor offers them. */
export const contentElementTypes = ['container', 'text', 'image', 'icon', 'button', 'divider'] as const;

const coreElementSchemas: Record<(typeof contentElementTypes)[number], z.ZodType> = {
  container: contentContainerElementSchema,
  text: contentTextElementSchema,
  image: contentImageElementSchema,
  icon: contentIconElementSchema,
  button: contentButtonElementSchema,
  divider: contentDividerElementSchema,
};

const pluginElementTypePattern = /^plugin-[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*$/;

/** A plugin element's type: 'plugin-<plugin name>:<element>', e.g. 'plugin-ecom:product-grid'. */
export const pluginElementTypeSchema = z.custom<PluginElementType>(
  (value) => typeof value === 'string' && pluginElementTypePattern.test(value),
  { error: 'Use plugin-<name>:<element>' },
);

/**
 * An element a plugin adds (decisions 0015, 0116). Core keeps whatever props it has: the plugin's own contract
 * checks them once it's installed, and an inactive or ejected plugin's elements must still save.
 */
export const pluginElementSchema: z.ZodType<PluginElement> = z
  .object({
    id: contentIdSchema,
    type: pluginElementTypeSchema,
    label: contentElementLabelSchema.optional(),
    props: z.record(z.string(), z.unknown()),
    children: childrenSchema.optional(),
  })
  .strict();

/** The contract for an element's type, if there is one. */
function schemaForType(type: unknown): z.ZodType | undefined {
  if (typeof type !== 'string') return undefined;
  if (Object.prototype.hasOwnProperty.call(coreElementSchemas, type)) return coreElementSchemas[type as keyof typeof coreElementSchemas];
  return type.startsWith('plugin-') ? pluginElementSchema : undefined;
}

/**
 * Any element: checked against its own type's contract, so problems point at the field (e.g. `props.label`) rather
 * than at every type it isn't.
 */
export const contentElementSchema: z.ZodType<ContentElement> = z.unknown().transform((value, ctx) => {
  const type = typeof value === 'object' && value !== null ? (value as { type?: unknown }).type : undefined;
  const schema = schemaForType(type);
  if (!schema) {
    ctx.addIssue({ code: 'custom', message: 'Unknown element type', path: ['type'] });
    return z.NEVER;
  }
  const result = schema.safeParse(value);
  if (result.success) return result.data as ContentElement;
  for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
  return z.NEVER;
});

/**
 * Checks a page's elements before they're parsed: at most MAX_CONTENT_ELEMENTS of them, nested at most
 * MAX_CONTENT_DEPTH deep, each with its own id. Checking first keeps a deeply nested body from being parsed at all.
 */
export function checkContentTree(elements: unknown[], ctx: z.RefinementCtx): void {
  const seen = new Set<string>();
  let count = 0;
  const stack: { node: unknown; depth: number; path: (string | number)[] }[] = elements.map((node, index) => ({ node, depth: 1, path: [index] }));
  while (stack.length) {
    const { node, depth, path } = stack.shift() as (typeof stack)[number];
    if (++count > MAX_CONTENT_ELEMENTS) {
      ctx.addIssue({ code: 'custom', message: `Use ${MAX_CONTENT_ELEMENTS} elements or fewer on a page` });
      return;
    }
    if (depth > MAX_CONTENT_DEPTH) {
      ctx.addIssue({ code: 'custom', message: `Nest elements ${MAX_CONTENT_DEPTH} deep or fewer`, path });
      return;
    }
    if (typeof node !== 'object' || node === null) continue;
    const { id, children } = node as { id?: unknown; children?: unknown };
    if (typeof id === 'string') {
      if (seen.has(id)) ctx.addIssue({ code: 'custom', message: 'Each element needs its own id', path: [...path, 'id'] });
      seen.add(id);
    }
    if (Array.isArray(children)) {
      children.forEach((child, index) => stack.push({ node: child, depth: depth + 1, path: [...path, 'children', index] }));
    }
  }
}
