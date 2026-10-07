---
id: "0028"
title: Store assets behind pluggable storage drivers, with MongoDB as core's default
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [assets, storage, plugins, security, render]
related: ["0002", "0005", "0006", "0015", "0027"]
supersedes: []
---

# 0028. Store assets behind pluggable storage drivers, with MongoDB as core's default

## Context

Clients often need file storage, usually R2, which (like GitHub, MongoDB and Render, [0005](0005-give-each-client-their-own-infrastructure.md)) would mean every client creating a storage account and entering a card. Many clients don't need it, and core's own needs are small: a logo, a couple of font files, and optional avatar and banner images.

Earlier attempts to store uploads on local disk and offer cloud storage as a plugin failed on Render. A Render web service's filesystem is ephemeral, so uploads were lost on redeploy. Asset URLs also broke whenever the domain changed.

## Decision

- **Core owns assets.** Every asset has a record: its owner, content type, size, and which driver holds the bytes.
- **Documents store asset ids, never URLs.** Assets are served from `/api/assets/:id` on the same origin ([0006](0006-serve-each-client-from-one-origin.md)), so a domain or storage-provider change never breaks a reference.
- **Bytes live behind a storage driver.** Core ships a MongoDB driver as the default, so uploads work with no extra account and survive deploys. The storage plugin adds an R2 (object-storage) driver through a slot ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). Core and other plugins never check which driver is installed.
- **Drivers declare capabilities**, including whether they are built to scale and their maximum asset size. The MongoDB driver is not scalable and accepts up to **2 MB per asset**; object-storage drivers set their own limit.
- **Avatar and banner image uploads require a scalable driver.** Without one, only generated avatars (Dicebear) and banners (Trianglify) are offered ([0027](0027-store-profile-data-in-a-user-profile-subdocument.md)). With one, images are offered too. The API enforces this; the UI only reflects it.
- **Any file type may be uploaded**, but every asset is served safely:
  - `X-Content-Type-Options: nosniff`, so the browser never guesses a file's type;
  - a sandboxing `Content-Security-Policy`, so scripts in a file can't run;
  - `Content-Disposition: attachment` for types not on an inline-safe list (e.g. images, fonts, PDF), forcing a download.

## Alternatives considered

- **R2 required by core**: rejected. Every client would need a storage account and card on day one, even if they never upload anything, and core would depend on it.
- **Local disk, or a Render persistent disk**: rejected. Files on Render's ephemeral filesystem are lost on deploy. A persistent disk is a paid add-on tied to one instance.
- **A settings flag switching local and cloud storage**: rejected as clunky. Every feature would branch on it, whereas drivers keep that choice in one place.
- **Storing URLs in documents**: rejected. References break when the domain or provider changes.
- **Accepting images only**: rejected. Core needs fonts, and plenty of other file types have legitimate uses. Safe serving covers the risk.

## Consequences

- With the MongoDB driver, assets aren't served from a CDN, the database and its backups grow, and the API carries the bandwidth. Atlas's free tier allows 512 MB in total, so the 2 MB limit and the scalable-driver requirement for per-user images keep growth in check.
- An asset record notes its driver, so a client can move to R2 later and older assets keep working until they're migrated.
- The storage driver slot belongs in the slot catalogue: [0015](0015-slot-catalogue.md).
- Whether plugin uploads must require a scalable driver is still open: [0029](0029-storage-requirements-for-plugin-uploads.md).
- Nothing here is built yet; it's implemented with the assets feature.
