---
id: "0029"
title: Decide which plugin uploads require a scalable storage driver
status: accepted
date: "2026-10-13"
scope: ecosystem
tags: [assets, storage, plugins]
related: ["0027", "0028", "0098"]
supersedes: []
---

# 0029. Decide which plugin uploads require a scalable storage driver

## Context

In core, only avatar and banner image uploads require a scalable (object-storage) driver ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)). Plugins are expected to reuse the image-with-generated-fallback building block for their own documents, e.g. blog post banners, staff member cards and product images ([0027](0027-store-profile-data-in-a-user-profile-subdocument.md)). Those uploads may be few (staff-created posts) or many (user-generated content), and every upload stored with the MongoDB driver adds to the client's database.

## Decision

Settled by the storage modes in [0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md): the rule depends on **who uploads**, not on the plugin.

- **Staff uploads** (anyone uploading with `assets.upload`, e.g. blog post banners, staff cards, product images) work in every mode, the database included, within the 2 MB limit and the database quota.
- **Member uploads** (end users with the `user` role) work only in `cloud-all`. In the other modes a plugin offers members generated images only, as profiles do.
- Plugins check the storage info the api reports (`memberUploads`), never the mode or a driver's name.

## Alternatives considered

- **Each plugin deciding for itself**: not chosen; the storage modes give one ecosystem-wide rule. No further rationale recorded.

## Consequences

- Plugins with staff uploads can be built now; plugins with member uploads need the R2 driver (0098's step B) to be useful.
- A plugin's member-upload field needs a generated or empty fallback for the modes without member uploads.
