---
title: Assets
description: Uploaded files - storage modes, the 2 MB limit, accepted types, processing, the assets API and how files are served.
scope: core
tags: [assets, storage, backend, uploads]
order: 8
decisions: ["0098", "0029"]
---

# Assets

Assets are uploaded files: images, fonts, documents, audio and video. The api owns them in `@inithium/api-assets` ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). Staff manage them on the CMS's [Media screen](../architecture/cms.md#media) and pick them with `AssetField`.

> **Built:** the database driver, the api, the Media screen, the picker, the logo and the Image block (step A). **Not built yet:** the R2 driver, the two cloud modes and member avatar and banner uploads (step B), and font families (step C).

## Rules

- **Documents store asset ids, never URLs.** An asset is served from `/api/assets/:id` (`assetUrl(id)` from `@inithium/shared-contracts`), so a domain or storage change never breaks a reference.
- **Every asset is at most 2 MB** (`MAX_ASSET_BYTES`). Images are shrunk to fit; other files must already fit.
- **Every asset is public.** Anyone with its address can fetch it.
- **Each asset has a default alt text.** Each place that uses it may override it (the Image block and the logo keep their own copy).

## Storage modes

`STORAGE_MODE` ([Environment variables](environment-variables.md)) chooses where bytes go and who may upload:

| Mode | Driver | Staff uploads | Member avatar/banner uploads |
| --- | --- | --- | --- |
| `database` (default) | MongoDB, collection `asset_blobs` | Yes, up to `STORAGE_DATABASE_QUOTA_MB` (250) | No |
| `cloud-staff` | R2 (not built) | Yes | No |
| `cloud-all` | R2 (not built) | Yes | Yes |

- The api picks its driver on startup (`storageDriver()`), before it connects to the database, and refuses to start in a cloud mode until the R2 driver exists.
- Each asset records its `driver`, so files stay readable when a client changes mode.
- **Check capabilities, never the mode.** `GET /api/assets/storage` reports `{ mode, driver, scalable, maxBytes, usedBytes, quotaBytes?, memberUploads }`. A feature offering member uploads checks `memberUploads` ([0029](../decisions/0029-storage-requirements-for-plugin-uploads.md)).

## Accepted files

Files are identified by their contents, not by their name or the browser's claimed type. Anything else is refused with 415.

| Kind | Types | Processing |
| --- | --- | --- |
| Image | PNG, JPEG, WebP, GIF, AVIF | Rotated upright, then converted to WebP within 2560 px. Quality steps down (82 → 40), then the size shrinks, until the file is under 2 MB. Animations are kept. |
| Image | SVG | Sanitised with DOMPurify (scripts and event handlers removed). Staff only. |
| Image | ICO | Kept as it is. |
| Font | WOFF2, WOFF, TTF, OTF | TTF and OTF are converted to WOFF2. The uploader must confirm the licence (`fontLicence`). |
| Document | PDF, TXT, CSV, DOCX, XLSX, PPTX | Kept as they are. |
| Audio | MP3 | Kept as it is. |
| Video | MP4 | Kept as it is. Only very short clips fit in 2 MB. |

Members may upload raster images only.

## Purposes

Every upload says what it's for. The purpose limits which kinds are accepted and which crop shapes the upload form offers:

| Purpose | Kinds | Crop shape |
| --- | --- | --- |
| `content` | Images, documents, audio, video | A choice, or the image's own shape |
| `logo` | Images | Its own shape, square or 16:9 |
| `favicon` | Images | Square |
| `font` | Fonts | — |
| `document` | Documents | — |
| `avatar` | Images | Circle (members, step B) |
| `banner` | Images | 4:1 (members, step B) |

Cropping happens in the browser, before upload ([Image cropper](../ui-library/composites/image-cropper.md)). The api never crops.

## API

Mounted at `/api/assets`:

| Route | Who | What |
| --- | --- | --- |
| `GET /storage` | Signed in | The storage info above. |
| `GET /` | `assets.upload` | Assets, newest first (at most 500). Query: `purpose`, `kind`, `q` (words in the filename or alt text). |
| `POST /` | Signed in | Multipart upload: `file` (at most 25 MB before processing), `purpose`, `alt?`, `fontLicence?` (`'true'`). `avatar` and `banner` need `memberUploads`; other purposes need `assets.upload`. Returns 201 with the asset. |
| `GET /:id/info` | `assets.upload` | One asset's record. |
| `GET /:id/usage` | `assets.upload` | `{ places: [{ label, blocking }] }`: the site logo (blocking) and pages whose content (draft or published) uses it. |
| `PATCH /:id` | `assets.upload` | `{ filename?, alt? }`. |
| `DELETE /:id` | `assets.delete` | 204, or 409 while a blocking use remains. |
| `GET /:id` | Anyone | The file itself. |

Errors: 400 (fields), 403, 409 (member uploads off, or in use), 413 (too big), 415 (type refused), 507 (database quota full). Errors carry `field` where a form field is at fault.

## Serving

`GET /api/assets/:id` streams the bytes with:

- `X-Content-Type-Options: nosniff`;
- a sandboxing `Content-Security-Policy` (`default-src 'none'` plus `sandbox`) for most types; PDFs get `default-src 'none'; object-src 'none'; script-src 'none'` instead, so browsers still render them;
- `Content-Disposition: inline` for images, fonts, audio, video and PDF, and `attachment` (download) for other types;
- `Cache-Control: public, max-age=31536000, immutable` and an `ETag` (the id), since an asset's bytes never change;
- range requests (206), so audio and video can seek.

## Where assets are used

- **Site logo**: `settings.logo` is `{ assetId, alt }` ([Site settings](site-settings.md)). Its asset can't be deleted while it's the logo.
- **Image block** in content pages ([Content pages](../architecture/content-pages.md)). Deleting its asset warns first; the page then shows a "missing image" placeholder.

## Permissions

| Permission | Roles | Allows |
| --- | --- | --- |
| `assets.upload` | owner, admin, editor | Uploading, listing, renaming and describing files |
| `assets.delete` | owner, admin | Deleting files |
