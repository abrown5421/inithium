---
id: "0099"
title: Store cloud files in R2 through its S3 API, and let members upload profile pictures
status: accepted
date: "2026-10-13"
scope: core
tags: [assets, storage, r2, profiles, security]
related: ["0027", "0029", "0074", "0075", "0090", "0098"]
supersedes: []
---

# 0099. Store cloud files in R2 through its S3 API, and let members upload profile pictures

## Context

[0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md) set out three storage modes and left their cloud side, Cloudflare R2, and members' own avatar and banner uploads for a second step. Profiles always store a generated avatar and banner ([0090](0090-generate-and-show-user-profiles.md)), and the user wanted a profile never to be left with nothing to show.

## Decision

**R2 driver.**
- Core talks to R2 through its S3-compatible API (`@aws-sdk/client-s3`, region `auto`, path-style addresses).
- Settings come from env vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET`, required in the cloud modes. `R2_ENDPOINT` optionally overrides the endpoint, e.g. for an EU bucket. `R2_PUBLIC_URL` is optional.
- On startup the api checks it can reach the bucket, and stops with the reason if it can't.
- Each object is stored with its type, disposition and a year's caching.

**Serving.**
- The api streams files from R2 at `/api/assets/:id`, with the same safety headers as database files.
- With `R2_PUBLIC_URL`, the api redirects there instead (302, cached for an hour). The safety headers must then be added at Cloudflare.

**Switching modes.** Files stay where they were stored and keep working. New uploads go to the current mode's driver. There is no migration tool.

**Profile pictures.**
- A profile keeps its generated avatar and banner and gains an optional uploaded picture for each: `profile.avatarAssetId` and `profile.bannerAssetId`.
- The picture shows instead of the generated one. If it fails to load, the generated one shows.
- In `cloud-all`, the avatar and banner editors offer "Upload a picture" with the crop step: a circle for avatars, 4:1 for banners.
  - Saving a generated avatar or banner goes back to it.
  - Replacing or removing a picture deletes the old file.
- A member may show only their own upload of that kind.
- Members get 10 uploads an hour.

**Moderation.**
- Member uploads are kept apart on the Media screen, under "Member uploads".
- Owners and admins can delete one there. The profile then shows its generated picture again.

**Editors** keep upload without delete. Only owners and admins delete files.

## Alternatives considered

- **Storing the picture inside the avatar or banner recipe**: not chosen. Separate fields keep the recipes as UI contracts and keep the generated fallback stored. No further rationale recorded.
- **Letting editors delete their own unused uploads**: considered and declined; owners and admins delete.
- **A tool to move existing files to R2**: deferred until a client needs it.

## Consequences

- A site in a cloud mode needs a Cloudflare account, an R2 bucket and an API token, and won't start without them.
- With `R2_PUBLIC_URL`, the safety headers depend on Cloudflare configuration, which an r2.dev address can't have, so a custom domain with header rules is needed.
- Uploads that a member never attaches to their profile stay in storage until staff delete them.
