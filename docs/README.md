# Inithium documentation

The documentation library for the Inithium ecosystem: core, plugins and the tooling around them. It lives in the Inithium repo only and is never copied into client repos. It is written as structured Markdown so that it can later be rendered as the public docs site.

```
docs/
  getting-started/   ┐
  architecture/      │
  backend/           │ the manual: one folder per section, sub-folders are sub-sections,
  ui-library/        │ every folder has an index.md (its sidebar label and landing page)
  plugins/           │
  reference/         ┘
  decisions/         Decision records: why the ecosystem works the way it does (NNNN-kebab-title.md)
  templates/         Starting points for new files (not validated): decision, page, component
  tooling/           The frontmatter schemas and the checker
```

The manual is viewed in the docs app (`core/apps/docs`), which builds its sidebar from these folders and each page's `title` and `order` (decisions [0052](decisions/0052-keep-a-self-documenting-developer-manual.md) and [0053](decisions/0053-view-the-manual-in-a-docs-app.md)).

Plugin documentation is colocated with each plugin, in `plugins/plugin-<name>/docs/`, using the same layout. Plugin decision ids are namespaced: `"<plugin>-0001"`.

## Writing docs

- Copy a file from [`templates/`](templates) and fill in its frontmatter. The schemas in [`tooling/docs.schema.mjs`](tooling/docs.schema.mjs) define every field.
- Decision records are append-only. Once a record is `accepted`, its body is not rewritten. To change the decision, add a new record that `supersedes` it, and mark the old one `superseded` with `supersededBy`.
- Open questions are recorded as `proposed` decisions, and updated to `accepted` once they are settled.

The rules for when docs must be written or updated are in the Documentation protocol section of [CLAUDE.md](../CLAUDE.md#9-documentation-protocol).

## Checking docs

Requires Node 22+.

```sh
cd docs
npm install
npm run check
```

The checker validates frontmatter, file names, the required sections of decision records, references between decisions, and relative links.
