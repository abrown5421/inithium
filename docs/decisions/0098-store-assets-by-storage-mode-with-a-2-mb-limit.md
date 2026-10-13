---
id: "0098"
title: Store assets by storage mode, with a 2 MB limit and an allowlist of file types
status: accepted
date: "2026-10-13"
scope: core
tags: [assets, storage, security, cms, content]
related: ["0005", "0006", "0027", "0029", "0074", "0075", "0082", "0090", "0093"]
supersedes: ["0028"]
---

# 0098. Store assets by storage mode, with a 2 MB limit and an allowlist of file types

## Context

[0028](0028-store-assets-behind-pluggable-storage-drivers.md) settled that documents store asset ids, that bytes live behind a storage driver, and that MongoDB is core's default driver. Before building assets, the user set out what clients actually need: no client should be forced to sign up for cloud storage, but some want it for their staff only, and some for everyone. The cloud storage is Cloudflare R2.

Uploaded images rarely fit where they're used, so the user wanted a step after choosing an image that crops or fits it to its destination's shape. The site logo was a URL typed into Settings ([0082](0082-keep-site-wide-settings-in-one-record.md)), and content pages had no image block yet ([0093](0093-build-content-pages-from-sections-columns-and-blocks.md)).

## Decision

**Storage modes.** `STORAGE_MODE` (an env var, default `database`) picks one of three:

| Mode | Where bytes go | Who may upload |
| --- | --- | --- |
| `database` | MongoDB (`asset_blobs`), with no third party | Staff only |
| `cloud-staff` | R2 | Staff only |
| `cloud-all` | R2 | Staff, and members for their own avatar and banner |

- The R2 driver ships in core, configured by env vars. It isn't built yet; until it is, the api refuses to start in either cloud mode.
- The database driver has a quota (`STORAGE_DATABASE_QUOTA_MB`, default 250); uploads past it are refused with 507.
- Each asset records its driver, so assets keep working when a client changes mode.

**Limits and types.**
- **Every asset is at most 2 MB**, whatever the mode. Raster images are converted to WebP and shrunk until they fit: the api tries lower qualities, then smaller sizes, within 2560 px. Other files must already be under 2 MB.
- **An allowlist of types, checked by their contents** (not their name or the browser's claim):
  - images: PNG, JPEG, WebP, GIF, AVIF, SVG, ICO;
  - fonts: WOFF2, WOFF; TTF and OTF are converted to WOFF2, and the uploader must confirm their licence;
  - documents: PDF, plain text, CSV, Word, Excel, PowerPoint;
  - audio: MP3; video: MP4.
- **SVGs are sanitised** (DOMPurify) and are staff-only. Members may upload raster images only.
- No virus scanning.

**Uploading.**
- Each upload has a `purpose`: `content`, `logo`, `favicon`, `font`, `document`, `avatar`, `banner`. A purpose allows only matching kinds (e.g. a logo must be an image).
- After choosing an image, the uploader **crops or fits it** to a shape suited to its purpose (a circle for avatars, 4:1 for banners, a square for favicons, a choice for the rest) in the browser, with a background colour around a fitted image.
- Permissions: `assets.upload` (owner, admin, editor) to upload, list, rename and describe; `assets.delete` (owner, admin) to delete.
- Members (step B): only their own avatar and banner, rate-limited, and replacing one deletes the old file.

**Serving.**
- **Every asset is public** at `/api/assets/:id`. The api streams the bytes, or redirects to R2 when `R2_PUBLIC_URL` is set (step B).
- Every response sends `X-Content-Type-Options: nosniff` and a sandboxing CSP. Images, fonts, audio, video and PDF display inline; other types download.
- Responses are cached for a year as immutable, since an asset's bytes never change.

**Using assets.**
- Each asset has a default alt text, which each place it's used can override.
- The site logo is an asset id plus alt text. Logo URLs are dropped.
- Content pages gain an **Image** block.
- **Usage tracking**: the logo blocks deleting its asset; other uses (page content, draft or published) warn before deleting.

**Build order**: (A) database driver, api, Media screen, picker, logo and Image block; (B) R2 driver, the cloud modes and member avatar/banner uploads; (C) font families.

## Alternatives considered

- **The R2 driver as a storage plugin through a slot** ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)): replaced by modes chosen by env var. No further rationale recorded.
- **Any file type, made safe only by headers** (0028): replaced by the allowlist. No further rationale recorded.
- **Uploads larger than 2 MB with cloud storage**: rejected by the user; every asset stays under 2 MB.
- **Private assets**: rejected; every asset is public.

## Consequences

- A client with no cloud account still gets uploads for staff, at the cost of database space, and only staff can add files.
- Members see only generated avatars and banners unless the mode is `cloud-all` ([0090](0090-generate-and-show-user-profiles.md)).
- Plugin uploads follow the same rule: by who uploads, not by plugin ([0029](0029-storage-requirements-for-plugin-uploads.md)).
- Video is limited to very short clips by the 2 MB limit.
- Logos stored as URLs before this change are no longer shown; sites fall back to the default logo until one is uploaded.
