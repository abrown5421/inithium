---
title: Working on Inithium
description: How a change goes from request to main, including branches, verification, documentation and review.
scope: ecosystem
tags: [process, git, docs]
order: 3
decisions: ["0052"]
---

# Working on Inithium

Every change follows the same path. The rules behind it are in `CLAUDE.md`; this page explains them for anyone working on the repo.

## The flow

1. **Clarify first.** If a request depends on something undecided, settle it before writing code. Open questions are tracked as `proposed` decision records.
2. **Branch.** Check for an existing branch that fits (`git branch -a`). Otherwise branch from `main` as `<type>/<kebab-name>`: `feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/` or `docs/`, e.g. `feat/user-collection`. Never work on `main`.
3. **Build it** following [Conventions](../reference/conventions.md).
4. **Verify** (below).
5. **Document it** (below). A change isn't done until the manual describes it.
6. **Commit** with a Conventional Commit message whose type matches the branch prefix, e.g. `feat: add user collection`.
7. **Browser-test.** The person reviewing runs the apps and tests the change in the browser.
8. **Iterate** on the same branch until it's right.
9. **Push and merge.** Push the branch, open a pull request on GitHub, merge it into `main`, then update locally:

```bash
git push origin feat/user-collection
# open and merge the pull request on GitHub
git checkout main && git pull
```

Stop running dev servers (`nx serve …`) before switching branches. A server holding files open can stop git from removing or replacing a folder.

When a branch builds on another that isn't merged yet, merge them in order. The second pull request then shows only its own commits.

## Verifying

Everything must pass before a change is handed over:

```bash
cd core
npx nx run-many -t lint typecheck build

cd ../docs
npm run check
```

- **Lint** includes the module-boundary rules. Fix a boundary error by changing the dependency, never with an `eslint-disable` comment.
- **The docs check** validates the manual's structure, links and decision records. It fails if a UI component has no page.

## Documenting your change

The manual is written alongside the code, in the same commit ([0052](../decisions/0052-keep-a-self-documenting-developer-manual.md)). Use this as a guide:

| If your change… | Update |
| --- | --- |
| Adds or changes a UI component, composite or layout | Its page in `docs/ui-library/<layer>s/` (from `docs/templates/component.md`), plus its example files in `core/apps/docs/src/examples/` |
| Adds or changes a style prop, theme token or animation | `ui-library/style-props.md`, `ui-library/theme/` or `ui-library/animations/`, and every component page that lists it |
| Adds or changes a lib | [Core libs](../reference/libs.md) and the page for its area |
| Adds or changes an env var | [Environment variables](../backend/environment-variables.md) and `core/.env.example` |
| Changes API routes, models or backend behaviour | The page for that area in `backend/` |
| Changes commands, ports, URLs or routes | [Commands](../reference/commands.md), [Routing and hosting](../reference/routing-and-hosting.md), and [Local setup](local-setup.md) if setup changed |
| Changes conventions, tags or boundaries | [Conventions](../reference/conventions.md) |
| Changes how core, plugins, the sandbox or client repos work | [Architecture](../architecture/index.md) |
| Makes or changes a decision | A record in `docs/decisions/`. A changed decision gets a new record that supersedes the old one. |

**How pages are organised:**
- Pages live in a section folder of `docs/`, and every section folder has an `index.md`.
- Every page has an `order` in its frontmatter, unique within its folder.
- New pages start from `docs/templates/`.
- Read the result in the docs app: `npx nx serve docs`, then http://localhost:5175.

## Decisions

Why Inithium works the way it does is recorded in `docs/decisions/` as numbered decision records. Each one has a Context, Decision, Alternatives considered and Consequences.

- Records are never rewritten. A changed decision is a new record that supersedes the old one.
- Open questions are `proposed` records until they're settled.
- Pages in this manual link to the decisions behind them. In the docs app, those links open the record in VS Code.
