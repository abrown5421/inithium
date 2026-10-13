---
title: Assets
description: Uploaded files - storage modes and Cloudflare R2, the 2 MB limit, accepted types, processing, members' pictures, the assets API and how files are served.
scope: core
tags: [assets, storage, backend, uploads]
order: 8
decisions: ["0098", "0099", "0029"]
---

# Assets

Assets are uploaded files: images, fonts, documents, audio and video. The api owns them in `@inithium/api-assets` ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). Staff manage them on the CMS's [Media screen](../architecture/cms.md#media) and pick them with `AssetField`.

> **Built:** the database driver, the api, the Media screen, the picker, the logo and the Image block (step A); the R2 driver, the cloud modes and members' avatar and banner uploads (step B, [0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). **Not built yet:** font families (step C).

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
| `cloud-staff` | [Cloudflare R2](#cloudflare-r2) | Yes | No |
| `cloud-all` | [Cloudflare R2](#cloudflare-r2) | Yes | Yes |

- The api picks its driver on startup (`startStorage()`), before it connects to the database, and logs `[ storage ] database` or `[ storage ] r2`. In a cloud mode it first checks the bucket can be reached, and stops with the reason if not (e.g. `404: no such bucket`, `403: the keys were refused`).
- Each asset records its `driver`. Files stay where they were stored when a client changes mode, and keep working: database files are always readable, and R2 files are readable in `database` mode as long as the `R2_*` settings remain. New uploads go to the current mode's driver. There's no tool to move files between them.
- **Check capabilities, never the mode.** `GET /api/assets/storage` reports `{ mode, driver, scalable, maxBytes, usedBytes, quotaBytes?, memberUploads }`. A feature offering member uploads checks `memberUploads` ([0029](../decisions/0029-storage-requirements-for-plugin-uploads.md)).

## Cloudflare R2

The cloud modes store files in an R2 bucket through R2's S3-compatible API ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). To set one up:

1. In the Cloudflare dashboard, open **R2 Object Storage** and create a bucket (one per site). The **Account ID** is shown on the R2 overview page.
2. Under **Manage API tokens**, create a token with **Object Read & Write** permission on that bucket. Copy its **Access Key ID** and **Secret Access Key**; the secret is shown once.
3. Set `STORAGE_MODE` (`cloud-staff` or `cloud-all`), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET` ([Environment variables](environment-variables.md)), then restart the api. A bucket in the EU jurisdiction needs `R2_ENDPOINT=https://<account>.eu.r2.cloudflarestorage.com`.

Each object is stored with its type, its `Content-Disposition` and a year's caching. Keys are the asset ids.

**Public address (optional).** By default the api streams R2 files itself, with all the [safety headers](#serving). Setting `R2_PUBLIC_URL` to the bucket's public address makes `/api/assets/:id` redirect there instead (302, cached for an hour), which saves the api's bandwidth. Cloudflare then sends the files, so add the headers yourself: put the bucket on a **custom domain** (r2.dev addresses can't take rules) and add a response header Transform Rule setting `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; media-src 'self'; sandbox` (one rule covers every type, so PDFs then download rather than open in the browser's viewer). Without that, leave `R2_PUBLIC_URL` unset.

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
| `avatar` | Raster images | Circle |
| `banner` | Raster images | 4:1 |

Cropping happens in the browser, before upload ([Image cropper](../ui-library/composites/image-cropper.md)). The api never crops.

## Members' pictures

In `cloud-all`, members can show an uploaded picture instead of their generated avatar or banner ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)):

- The profile owner's avatar and banner editors gain **Upload a picture**, which opens the upload form for that purpose: PNG, JPEG, WebP, GIF or AVIF, cropped to a circle or 4:1, with no alt text (the profile's name describes it).
- The upload is then attached with `PATCH /api/profiles/me` `{ avatarAssetId }` or `{ bannerAssetId }` ([Profiles](profiles.md)). Only the member's own upload of that kind is accepted (400 otherwise).
- The generated recipe stays stored as the fallback: it shows if the picture fails to load, and saving a generated one in the editor sends `null`, going back to it.
- A replaced or removed picture is deleted.
- Members get **10 uploads an hour**, counted per account (429 after that). Staff uploads aren't limited.
- Staff see members' pictures on the Media screen under **Member uploads**, and owners and admins can delete one. The profile then shows its generated picture.

## API

Mounted at `/api/assets`:

| Route | Who | What |
| --- | --- | --- |
| `GET /storage` | Signed in | The storage info above. |
| `GET /` | `assets.upload` | Staff files, newest first (at most 500); `group=members` lists members' avatars and banners instead. Query also: `purpose`, `kind`, `q` (words in the filename or alt text). |
| `POST /` | Signed in | Multipart upload: `file` (at most 25 MB before processing), `purpose`, `alt?`, `fontLicence?` (`'true'`). `avatar` and `banner` need `memberUploads` and are rate-limited for members; other purposes need `assets.upload`. Returns 201 with the asset. |
| `GET /:id/info` | `assets.upload` | One asset's record. |
| `GET /:id/usage` | `assets.upload` | `{ places: [{ label, blocking }] }`: the site logo (blocking), pages whose content (draft or published) uses it, and profiles showing it. |
| `PATCH /:id` | `assets.upload` | `{ filename?, alt? }`. |
| `DELETE /:id` | `assets.delete` | 204, or 409 while a blocking use remains. |
| `GET /:id` | Anyone | The file itself, or a redirect to the bucket's public address with `R2_PUBLIC_URL`. |

Errors: 400 (fields), 403, 409 (member uploads off, or in use), 413 (too big), 415 (type refused), 429 (member upload limit), 507 (database quota full). Errors carry `field` where a form field is at fault.

## Serving

`GET /api/assets/:id` streams the bytes (from the database or R2) with:

- `X-Content-Type-Options: nosniff`;
- a sandboxing `Content-Security-Policy` (`default-src 'none'` plus `sandbox`) for most types; PDFs get `default-src 'none'; object-src 'none'; script-src 'none'` instead, so browsers still render them;
- `Content-Disposition: inline` for images, fonts, audio, video and PDF, and `attachment` (download) for other types;
- `Cache-Control: public, max-age=31536000, immutable` and an `ETag` (the id), since an asset's bytes never change;
- range requests (206), so audio and video can seek.

## Where assets are used

- **Site logo**: `settings.logo` is `{ assetId, alt }` ([Site settings](site-settings.md)). Its asset can't be deleted while it's the logo.
- **Image block** in content pages ([Content pages](../architecture/content-pages.md)). Deleting its asset warns first; the page then shows a "missing image" placeholder.
- **Profiles**: `profile.avatarAssetId` and `profile.bannerAssetId`. Deleting the asset clears them, so the profile shows its generated picture. Deleting an account deletes the avatars and banners it uploaded (`deleteMemberUploads()`); files staff uploaded stay ([User management](user-management.md#deleting-accounts)).

## Permissions

| Permission | Roles | Allows |
| --- | --- | --- |
| `assets.upload` | owner, admin, editor | Uploading, listing, renaming and describing files |
| `assets.delete` | owner, admin | Deleting files |
