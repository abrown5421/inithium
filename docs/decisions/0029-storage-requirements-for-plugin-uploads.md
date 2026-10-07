---
id: "0029"
title: Decide which plugin uploads require a scalable storage driver
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [assets, storage, plugins]
related: ["0027", "0028"]
supersedes: []
---

# 0029. Decide which plugin uploads require a scalable storage driver

## Context

In core, only avatar and banner image uploads require a scalable (object-storage) driver ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)). Plugins are expected to reuse the image-with-generated-fallback building block for their own documents, e.g. blog post banners, staff member cards and product images ([0027](0027-store-profile-data-in-a-user-profile-subdocument.md)). Those uploads may be few (staff-created posts) or many (user-generated content), and every upload stored with the MongoDB driver adds to the client's database.

## Decision

Undecided. Open questions: does each plugin decide whether its uploads require a scalable driver, or is there an ecosystem-wide rule (e.g. by who uploads, or by expected volume)? Does an image field without a scalable driver fall back to generated images only, as avatars and banners do?

## Alternatives considered

None recorded yet.

## Consequences

Plugins with uploads can't be built until this is decided.
