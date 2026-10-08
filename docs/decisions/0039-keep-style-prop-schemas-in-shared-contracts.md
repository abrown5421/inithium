---
id: "0039"
title: Keep the style prop schemas in shared-contracts
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [ui, props, zod, contracts, plugins]
related: ["0008", "0035", "0038"]
supersedes: []
---

# 0039. Keep the style prop schemas in shared-contracts

## Context

Style props are serializable Zod schemas ([0035](0035-define-style-props-as-serializable-zod-schemas.md)). The UI libs need them to type their props, the API needs them to validate stored page sections without importing React, and plugins will most likely need them as well.

## Decision

The style prop schemas and their inferred types live in `@inithium/shared-contracts`, alongside the other shared contracts.

## Alternatives considered

- **In `@inithium/shared-ui-theme`, kept free of React**: not chosen. The schemas are a contract shared by apps, libs and plugins, not part of the theme.
- **A separate schema lib**: not chosen, for the same reason.

## Consequences

- The UI libs (`type:ui`) import the schemas from `shared-contracts` (`type:util`), which the boundary rules allow.
- The API and plugins can validate style props without depending on any React code.
