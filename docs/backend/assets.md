---
title: Assets
description: Uploaded files - storage modes and Cloudflare R2, the 2 MB limit, accepted types, processing, members' pictures, the assets API and how files are served.
scope: core
tags: [assets, storage, backend, uploads]
order: 8
decisions: ["0098", "0099", "0101", "0029"]
---

# Assets

Assets are uploaded files: images, fonts, documents, audio and video. The api owns them in `@inithium/api-assets` ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). Staff manage them on the CMS's [Media screen](../architecture/cms.md#media) and pick them with `AssetField`.

> **Built:** the database driver, the api, the Media screen, the picker, the logo and the Image block (step A); the R2 driver, the cloud modes and members' avatar and banner uploads (step B, [0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). Step C, font families ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)), is being built in phases: the [font library](#font-families), the theme's fonts, the font picker and fonts in the page builder are all built ([0115](../decisions/0115-style-text-in-the-page-builder-per-part-and-per-word.md)).

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
| Font | WOFF2, WOFF, TTF, OTF | TTF and OTF are converted to WOFF2. The uploader must confirm the licence (`fontLicence`). The file's family name, weight (a variable font's weight range), style and metrics are read from it and stored on the asset as `font`; a font that can't be read is refused (415). |
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
| `favicon` | Images: ICO and SVG kept; others become a PNG up to 512 px ([0101](../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)) | Square |
| `font` | Fonts | — |
| `document` | Documents | — |
| `avatar` | Raster images | Circle |
| `banner` | Raster images | 4:1 |

Cropping happens in the browser, before upload ([Image cropper](../ui-library/composites/image-cropper.md)). The api never crops.

## Font families

Font files are grouped into **families** in a font library ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)). A family is a record in `font_families` (`@inithium/api-fonts`): a **name**, a **fallback** (`sans`, `serif` or `mono`, the generic family used while the font loads or if it fails) and its **files**. Each file is a `font` asset with the weight and style read from the file when it was uploaded (`readFontInfo()`, using `fontkit`):

- A single-weight file covers one weight (`{ min: 700, max: 700 }`); a variable font covers its weight axis (`{ min: 300, max: 800 }`).
- Two files in a family can't cover the same style and an overlapping weight (400, naming both files).
- A file belongs to at most one family (409).
- Font uploads from before files were read get read when they're first added to a family.
- The library holds at most **six** families (`MAX_FONT_FAMILIES`; 409 after that). Inithium's two default fonts are built in and don't count.
- Removing a family keeps its files, which go back to being loose fonts. Deleting a file takes it out of its family, and the family stays even if that leaves it empty.
- Every family is served under an internal name, `Inithium Font <familyId>` (`fontFamilyCssName()`), never the font's own name. `fontFaceCss()` writes its `@font-face` rules, and `fontStack()` its CSS `font-family` value.

- Each family file keeps its file's metrics, for the theme's size-matched fallbacks.
- **The theme's fonts:** Settings points `display` and `body` at families ([Site settings](site-settings.md)), and the api writes them into each app's page so they load without a flash ([Theme fonts in the page](site-settings.md#theme-fonts-in-the-page)). A family the theme uses can't be removed (409), and its only file can't be deleted (blocking usage). Add another file or choose another font in Settings first.
- **With `R2_PUBLIC_URL`**, fonts come from the bucket's address, another origin, and browsers only use cross-origin fonts with CORS. Give the bucket a CORS policy allowing `GET` from the site's origin (Cloudflare dashboard → R2 → the bucket → Settings → CORS policy). Without `R2_PUBLIC_URL`, fonts are served from the site's own origin and need nothing.

- **In page content:** blocks' typography and restyled words store `{ familyId }` ([Content pages](../architecture/content-pages.md#blocks)). Removing a family warns with the pages that use it (`GET /api/fonts/:id/usage`, `fontFamilyUsage()`), and that text then draws in the body font.

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
| `GET /:id/usage` | `assets.upload` | `{ places: [{ label, blocking }] }`: the site logo and favicon (blocking), pages whose content (draft or published) uses it, and profiles showing it. |
| `PATCH /:id` | `assets.upload` | `{ filename?, alt? }`. |
| `DELETE /:id` | `assets.delete` | 204, or 409 while a blocking use remains. |
| `GET /:id` | Anyone | The file itself, or a redirect to the bucket's public address with `R2_PUBLIC_URL`. |

The font library is mounted at `/api/fonts`, all routes needing `assets.upload`:

| Route | What |
| --- | --- |
| `GET /` | Every family, by name, each with its files (`assetId`, `filename`, `contentType`, `url`, `weight`, `style`). |
| `POST /` | `{ name, fallback, assetIds }`: adds a family. 201; 400 for a file that isn't a font, no longer exists or overlaps another; 409 for a file in another family or a full library. |
| `GET /:id/usage` | `{ places: [{ label, blocking }] }`: the theme's roles (blocking) and pages whose content, draft or published, uses it. |
| `PATCH /:id` | Any of `{ name, fallback, assetIds }` (`assetIds` is the whole new list). |
| `DELETE /:id` | 204. Its files stay. 409 while the theme uses it. |

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
- **Favicon**: `settings.favicon` is `{ assetId }`. Its asset can't be deleted while it's the favicon.
- **Image block** in content pages ([Content pages](../architecture/content-pages.md)). Deleting its asset warns first; the page then shows a "missing image" placeholder.
- **Font families**: a font file's family. Deleting the file warns first, then takes it out of the family. If it's the only file of a family the theme uses, it can't be deleted.
- **Profiles**: `profile.avatarAssetId` and `profile.bannerAssetId`. Deleting the asset clears them, so the profile shows its generated picture. Deleting an account deletes the avatars and banners it uploaded (`deleteMemberUploads()`); files staff uploaded stay ([User management](user-management.md#deleting-accounts)).

## Permissions

| Permission | Roles | Allows |
| --- | --- | --- |
| `assets.upload` | owner, admin, editor | Uploading, listing, renaming and describing files; managing font families |
| `assets.delete` | owner, admin | Deleting files |
