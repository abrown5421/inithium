# @inithium/asset-manager

Local-first asset storage for the Inithium NX monorepo. Mimics S3-style cloud storage on the local filesystem with a three-phase upload handshake, stream-based adapter, and proxy routing.

## Architecture

```
src/lib/
├── types/          # Shared TypeScript interfaces
├── config/         # Paths, MIME → category map, constants
├── adapter/        # fs stream read/write/soft-delete/restore
├── handshake/      # Intent + Transfer upload phases, token store
└── proxy/          # Asset serving by ID or storageKey
```

## Storage Layout

```
<project-root>/assets/
├── images/
├── fonts/
├── videos/
├── audio/
├── documents/
├── misc/
└── .trash/
    ├── images/
    └── ...
```

## Usage

```ts
import { createAssetManager } from '@inithium/asset-manager';
import { assetsService } from '@inithium/api-collections';

const assetManager = await createAssetManager({ assetsService });

app.use('/upload', assetManager.handshakeRouter);
app.use('/assets', assetManager.proxyRouter);
```

## Upload Handshake (S3-style)

**1. Intent Phase** — `POST /upload/intent`
```json
{ "mimeType": "image/png", "originalName": "photo.png" }
```
Returns a `presignedPath` and `uploadId` valid for 15 minutes.

**2. Transfer Phase** — `PUT /__upload__/:uploadId`
Pipe the binary stream directly. On success, the Asset record is created in MongoDB via `assetsService`.

## Proxy Routes

- `GET /assets/by-id/:id` — DB lookup by `_id`, streams file
- `GET /assets/by-key/:storageKey` — streams by storage key directly

## Soft Delete

Files are moved to `.trash/` before permanent removal:

```ts
await assetManager.softDelete(storageKey, mimeType);
await assetManager.permanentDelete(storageKey, mimeType);
await assetManager.restore(storageKey, mimeType);
```
