import { z } from 'zod';

// Frontmatter contracts for the documentation library. A future docs UI should
// import these schemas rather than redefine them.

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Core/ecosystem decisions are numbered "0001"; plugin decisions are namespaced "<plugin>-0001".
// YAML reads an unquoted 0001 as the number 1, so ids must be quoted strings.
export const decisionIdSchema = z
  .string({ error: 'must be a quoted string, e.g. "0001" or "ecom-0001"' })
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*-)?\d{4}$/, { error: 'must look like "0001" or "<plugin>-0001"' });

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'must be a quoted YYYY-MM-DD date' });
const tags = z.array(z.string().regex(kebab, { error: 'tags must be kebab-case' })).default([]);

export const docScopes = ['ecosystem', 'core', 'plugin'];
export const decisionStatuses = ['proposed', 'accepted', 'superseded'];

export const decisionSchema = z
  .object({
    id: decisionIdSchema,
    title: z.string().min(1),
    status: z.enum(decisionStatuses),
    date: isoDate,
    scope: z.enum(docScopes),
    tags,
    related: z.array(decisionIdSchema).default([]),
    supersedes: z.array(decisionIdSchema).default([]),
    supersededBy: decisionIdSchema.optional(),
  })
  .strict()
  .refine((d) => (d.status === 'superseded') === (d.supersededBy !== undefined), {
    error: 'supersededBy is required when status is "superseded", and only then',
    path: ['supersededBy'],
  });

// UI building blocks that each get their own reference page (reference/ui/<layer>s/<kebab-name>.md).
export const uiLayers = ['component', 'composite', 'layout'];

/** Identifies the UI component a page documents, so a docs UI can index components without parsing prose. */
export const componentMetaSchema = z
  .object({
    name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, { error: 'must be the exported PascalCase name, e.g. "Container"' }),
    layer: z.enum(uiLayers),
    import: z.string().regex(/^@inithium\/[a-z0-9-]+$/, { error: 'must be the import path, e.g. "@inithium/shared-ui-components"' }),
    element: z.string().min(1).optional(),
  })
  .strict();

// Guides (task-oriented) and reference (look-up) pages share one shape.
export const pageSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    scope: z.enum(docScopes),
    tags,
    order: z.number().int().nonnegative().optional(),
    decisions: z.array(decisionIdSchema).default([]),
    component: componentMetaSchema.optional(),
  })
  .strict();

// Sections every decision record must contain, in this order.
export const decisionSections = ['Context', 'Decision', 'Alternatives considered', 'Consequences'];
