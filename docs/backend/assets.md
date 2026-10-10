---
title: Assets
description: How uploaded files will be stored and served, behind pluggable storage drivers (not built yet).
scope: core
tags: [assets, storage, backend]
order: 8
decisions: ["0028", "0029"]
---

# Assets

> **Not built yet.** This page describes the decided design ([0028](../decisions/0028-store-assets-behind-pluggable-storage-drivers.md)), so that work built before assets exist fits it.

Assets are uploaded files: images, fonts, and anything else a client or a plugin stores.

## The design

- **Documents store asset ids, never URLs.** Assets are served from `/api/assets/:id` on the client's own origin. A domain or storage-provider change never breaks a reference.
- **Every asset has a record:** its owner, content type, size, and which storage driver holds the bytes.
- **Bytes live behind a storage driver:**
  - **Core's default is a MongoDB driver.** It works with no extra account and survives redeploys (unlike Render's disk, which is wiped on every deploy).
  - **The storage plugin adds an object-storage driver (R2)** for clients who need it.
- **Features check the driver's capabilities, never which plugin is installed:**

  | Driver | Scalable | Max per asset |
  | --- | --- | --- |
  | MongoDB (core) | No | 2 MB |
  | Object storage (storage plugin) | Yes | Set by the plugin |

- **Avatar and banner image uploads need a scalable driver.** Without one, only generated avatars and banners are offered.
- **Any file type may be uploaded, but every asset is served safely:**
  - `X-Content-Type-Options: nosniff`, so the browser never guesses a file's type;
  - a sandboxing `Content-Security-Policy`, so scripts in a file can't run;
  - `Content-Disposition: attachment` for types not on an inline-safe list (e.g. images, fonts, PDF), forcing a download.

## Still open

Whether plugin uploads (e.g. blog or product images) must require a scalable driver ([0029](../decisions/0029-storage-requirements-for-plugin-uploads.md)).
