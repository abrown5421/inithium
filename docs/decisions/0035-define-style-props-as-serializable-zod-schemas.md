---
id: "0035"
title: Define style props as serializable Zod schemas
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, zod, contracts]
related: ["0008", "0033", "0034", "0037"]
supersedes: []
---

# 0035. Define style props as serializable Zod schemas

## Context

The page framework will store page sections, including the props of the components in them, in MongoDB. Stored props have to be validated, and the CMS needs to know what each prop accepts in order to edit it. Zod is already the source of truth for shared data shapes ([0008](0008-use-zod-as-the-contract-source-of-truth.md)).

## Decision

- Every style prop is **plain, JSON-serializable data**: no functions, class instances or React elements.
- Each prop family (colour, spacing, and so on) is defined as a **Zod schema**, and its TypeScript types are inferred from the schema.
- Event handlers and other behaviour props are ordinary React props and are not part of the style schemas.

## Alternatives considered

- **TypeScript types only**: rejected. The page framework would need a second, parallel set of schemas to validate stored props.

## Consequences

- Anything a developer can express with props in code can also be stored by the page framework.
- The CMS can generate editing controls from the schemas, e.g. a colour prop gets a colour picker.
- The API must be able to validate stored props without importing React. Where the schemas live is open: [0033](0033-ui-library-design-open-questions.md).
