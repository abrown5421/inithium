import { z } from 'zod';

/**
 * Where a content link goes (decision 0093): one of the site's pages, by id, so it survives the page moving; or an
 * external address. Only http(s), mailto: and tel: addresses are allowed, so a stored link can never run script.
 */
export const contentLinkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('page'), pageId: z.string().min(1, { error: 'Choose a page' }) }).strict(),
  z
    .object({
      type: z.literal('url'),
      href: z
        .string()
        .trim()
        .max(2000, { error: 'Use 2,000 characters or fewer' })
        .regex(/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d][\d\s()-]*)$/i, {
          error: 'Enter an address starting with https://, mailto: or tel:',
        }),
      /** Opens it in a new tab. Default false. */
      newTab: z.boolean().optional(),
    })
    .strict(),
]);

export type ContentLink = z.infer<typeof contentLinkSchema>;
