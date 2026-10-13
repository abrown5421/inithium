---
id: "0097"
title: Seed a starter privacy policy as an editable content page
status: accepted
date: "2026-10-13"
scope: core
tags: [pages, content, seeds, privacy]
related: ["0020", "0078", "0093", "0094"]
supersedes: []
---

# 0097. Seed a starter privacy policy as an editable content page

## Context

[0093](0093-build-content-pages-from-sections-columns-and-blocks.md) planned a privacy policy seeded at `/privacy-policy`, in the secondary footer, protected, with placeholder sections saying they must be replaced. Every site built on core needs a policy that covers what core itself does: its accounts, profiles and sign-in cookies.

Seeds found their pages by template, which works only for single-use templates. The privacy policy uses the reusable `content` template, which many pages share.

## Decision

**The page**
- On first start, core seeds a **Privacy policy** content page at `/privacy-policy`:
  - published, in the secondary footer;
  - protected: it can't be deleted, and its address, template and layouts are fixed;
  - with a search description.
- **Starting wording:** instead of placeholders, it starts with plain-English wording covering what core collects and its only cookies. Admins then edit it any way they like in the content editor.
  - It covers account details (email, names, the password stored only as a hash), the public profile, sign-in sessions, and the brief IP-based limit on failed sign-ins.
  - It describes the two essential cookies, `inithium_access` and `inithium_refresh`, with their lifetimes taken from `JWT_ACCESS_TTL_MINUTES` and `JWT_REFRESH_TTL_DAYS`. It says there are no advertising, analytics or tracking cookies.
  - It then covers how the information is used, sharing with hosting providers, how long it's kept, the reader's choices and rights, and changes to the policy. "Last updated" is the date it was seeded.
- **Written once:** the seed writes the content once, as both the draft and the published version. Later starts never touch it.

**Seed keys**
- A seed can carry a `seedKey` (here `privacy-policy`), stored on the page record.
- Seeds with a key find their page by it; others still find theirs by template.
- **An address already in use:** if another page already uses the seed's address, the seed leaves it alone and logs a warning. Once that page is moved or deleted, the seed creates the policy on the next start.

## Alternatives considered

- **Placeholder sections that must be replaced** (as 0093 planned): replaced by real starting wording, so every site has basic coverage from the first start.

## Consequences

- **Not legal advice:** the starting wording reflects only what core does. Each site's owner remains responsible for their policy, including anything their plugins, hosting or own processes add, and should have it reviewed.
- **Plugins:** they can seed content pages with their own `seedKey` the same way.
- **Restarts:** the policy's lifetimes and date are fixed when it's written. Changing `JWT_*_TTL_*` later doesn't update an existing policy.
