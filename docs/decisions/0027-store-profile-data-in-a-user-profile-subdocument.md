---
id: "0027"
title: Store profile data in a profile subdocument, with images as an asset or a generator recipe
status: superseded
date: "2026-10-07"
scope: core
tags: [users, profiles, avatars, data-model]
related: ["0022", "0026", "0028"]
supersedes: []
supersededBy: "0074"
---

# 0027. Store profile data in a profile subdocument, with images as an asset or a generator recipe

## Context

Users will have avatars and profile banners. Each is either an uploaded image or a generated placeholder: Dicebear for avatars, Trianglify for banners. The choice has to persist across sign-ins. Both generators are deterministic: the same seed and options always produce the same image.

## Decision

- Profile data lives in a `profile` subdocument on the user, kept separate from authentication fields (`passwordHash`, `role`, etc.).
- An avatar or banner is stored as one of two things:
  - a **generator recipe** (the generator's style or options plus a seed), from which the frontend renders the image;
  - an **asset id** for an uploaded image ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)).
  The rendered image is never stored.
- When an image is missing or fails to load, it falls back to the generated version.
- The image-with-generated-fallback shape and its component are core building blocks that plugins can reuse for their own documents, e.g. blog post banners, staff member cards and product images.
- The fields are added when the profile feature is built, not before. Users without a `profile` get a generated default.

## Alternatives considered

- **Storing the rendered placeholder image**: unnecessary, since the generators are deterministic. The recipe is a few bytes.
- **Adding empty profile fields now**: rejected. Their exact shape would be a guess, and MongoDB needs no migration to add fields later.

## Consequences

- Generated avatars and banners need no file storage at all.
- Uploaded profile images depend on the storage driver's capabilities: see [0028](0028-store-assets-behind-pluggable-storage-drivers.md).
