---
id: "0108"
title: Decide how client staging works and what data it holds
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [staging, clients, hosting, git, render, mongodb]
related: ["0004", "0017", "0098", "0104", "0109"]
supersedes: []
---

# 0108. Decide how client staging works and what data it holds

## Context

Every client gets a staging site on their own accounts, beside production, with its own database on the same cluster ([0104](0104-separate-development-showcase-staging-and-production-environments.md)). The client and their staff review changes there, and production stays untouched until they approve. Staging tooling will be built later, but the open questions are recorded now so the rest of the design doesn't close them off.

## Decision

Undecided. Open questions, with the suggestions raised so far.

**1. One repo or two.**
- **First described:** a staging repo deployed first, then duplicated for production.
- **Suggested instead:** one client repo with two branches: `staging` deploys to the staging service and `main` to production. Moving an approved change to production is then a merge from `staging` into `main`, so the two sites can't silently drift apart.

**2. Staging data.** Suggested:
- **At first launch:** the client builds their site on staging, and on go-live its database is copied to production once.
- **After launch:** production owns the content (clients edit content in production's CMS; drafts and Publish already give content its own preview). Before each review, staging is refreshed from a production snapshot, so the client sees their real site plus the change.
- **The catch:** a snapshot copies end users' accounts and data into staging, so staging must be locked down (below).
- **Alternatives:** treat staging data as throwaway, or build a way to promote what the client set up in staging.

**3. Access and isolation.** Suggested requirements:
- Staging requires sign-in for everyone.
- It isn't indexed by search engines.
- It has its own secrets.
- It has its own storage bucket in the cloud storage modes ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)).
- Once core sends email, staging never emails real users.

**4. Uploaded files.** Whether staging gets copies of production's uploads, reads them from production's bucket, or shows placeholders.

**5. Tooling.** What's scripted (provisioning both services, refreshing staging, promoting changes) and what stays a documented manual step, given about 15–20 clients at most ([0104](0104-separate-development-showcase-staging-and-production-environments.md)).

## Alternatives considered

None evaluated yet.

## Consequences

- Provisioning can't be finalised until question 1 is settled, since it decides how many repos each client has.
- Core updates and plugin upgrades should reach staging before production, which interacts with [0017](0017-upstream-mechanism.md).
