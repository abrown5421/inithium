---
id: "0020"
title: Choose the authentication approach
status: proposed
date: "2026-10-07"
scope: core
tags: [auth, security]
related: ["0006"]
supersedes: []
---

# 0020. Choose the authentication approach

## Context

`jsonwebtoken` is installed in core, but nothing else has been decided. Serving everything from one origin ([0006](0006-serve-each-client-from-one-origin.md)) means any auth cookies would be first-party.

## Decision

Undecided. Open questions: the authentication approach, and which lib owns it.

## Alternatives considered

None recorded yet.

## Consequences

Nothing in core is protected by authentication until this is decided.
