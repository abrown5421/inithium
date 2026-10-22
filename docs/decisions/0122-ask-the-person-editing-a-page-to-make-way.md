---
id: "0122"
title: Ask the person editing a page to make way
status: accepted
date: "2026-10-22"
scope: core
tags: [cms, pages, page-builder, realtime]
related: ["0066", "0116", "0121"]
supersedes: []
---

# 0122. Ask the person editing a page to make way

## Context

The page builder's edit lock lets one session build a page at a time ([0116](0116-build-content-pages-from-a-tree-of-library-elements.md)). Anyone else opening the page was told who had it, and could only try again later. They had no way to let the editor know they were waiting, and no way to know when the page came free. The Pages list showed who was editing each page only as of its last fetch. The realtime layer ([0121](0121-add-a-realtime-pub-sub-layer-on-socket-io.md)) made all of this possible, and this is its first use.

## Decision

**Someone shut out of a page can ask its editor to make way, once; the editor decides what to do, and nothing comes back.**

- **The ask:** the blocked notice has **Ask to edit**, which calls `POST /api/pages/:id/content/request-edit` (`pages.edit`). The api publishes the request to the one builder session holding the lock, on `core:content-lock/<pageId>/<lockId>` (`contentLockChannel`). Only that session's user may subscribe, and only while the lock is live and theirs.
- **The editor** sees an alert that stays until dismissed: "Sam Lee would like to edit this page", saying that they can let their changes save and leave the builder to hand it over, or keep working. There's no reply, accept or decline. Leaving the builder is how the page is handed over.
- **One ask per person per page per minute** (429 otherwise). Asking when nobody holds the page answers 409 `CONTENT_UNLOCKED` (the CMS simply opens it), and asking for one's own other tab 409 `CONTENT_LOCK_YOURS`.
- **Delivery isn't guaranteed:** a builder that's offline at that moment misses the request. The asker is still told it was sent.
- **Freed pages open by themselves:** taking and letting go of a lock are published on `core:pages` (`pagesChannel`, `pages.edit`). The blocked notice listens and tries for the lock as soon as the page is let go. The Pages list updates who's editing each page live.

## Alternatives considered

- **A conversation** (accept or decline buttons, a reply to the asker): rejected as not wanted. The ask is one-way, and the editor acts on it or not.
- **Taking over the page:** rejected, as in [0116](0116-build-content-pages-from-a-tree-of-library-elements.md). Nobody takes a live lock.
- **Notifying every tab the editor has open:** rejected in favour of the one builder session that holds the lock, which is where the editor is working.

## Consequences

- A lock that expires (a closed or sleeping browser) produces no event, so a waiting notice doesn't open by itself then. **Try again** still works two minutes after the editor stopped.
- The api keeps the last ask per person and page in memory. A restart forgets them, which at worst allows one early repeat.
