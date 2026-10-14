---
id: "0109"
title: Decide client hosting plans, backups and storage limits
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [clients, hosting, render, mongodb, backups, costs]
related: ["0089", "0098", "0099", "0104", "0108"]
supersedes: []
---

# 0109. Decide client hosting plans, backups and storage limits

## Context

Each client runs two Render services (production and staging) and two databases on one Atlas cluster, all on their own accounts ([0104](0104-separate-development-showcase-staging-and-production-environments.md)). Free tiers, as reported in October 2026 (check before relying on them):

| Provider | Free allowance | Fits production + staging? |
| --- | --- | --- |
| Render | 750 instance hours per workspace a month. Free services sleep after 15 minutes idle and take about a minute to wake. | Only because both sleep; one service that never sleeps uses nearly all 750 hours |
| MongoDB Atlas | One free cluster per project, commonly reported at about 512 MB; **no backups** (only manual `mongodump`) | Tight: both databases share the space, and staging may be a copy of production |
| GitHub | Unlimited private repos | Yes |
| Cloudflare R2 | 10 GB storage, 1M writes and 10M reads a month, free downloads | Yes, at this scale |

## Decision

Undecided. Open questions, with the suggestions raised so far.

**1. Plans.** Suggested:
- **Free baseline,** fine for launch and very small clients:
  - both Render services free;
  - an Atlas free cluster with both databases;
  - R2 for uploads;
  - scheduled manual backups.
- **Recommended production upgrade,** at the client's cost:
  - a paid Render instance for production (about $7 a month, as reported), so it never sleeps and staging is the only service using free hours;
  - a paid Atlas tier with backups.
  - Staging stays free.

**2. Backups.** A free cluster has none. Either clients' production uses a paid Atlas tier, or Inithium builds a scheduled `mongodump` job (where it runs and where dumps are kept are then open too).

**3. Upload storage on a free cluster.**
- **The problem:** in `database` storage mode the default quota is 250 MB **per database** ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)), so production plus staging could pass the cluster's ~512 MB in uploads alone.
- **Suggested:** clients on a free cluster use R2 (`cloud-staff` or `cloud-all`, [0099](0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)), or set `STORAGE_DATABASE_QUOTA_MB` lower (e.g. 100 per environment).

**4. The showcase.** It runs on Inithium's free Render account and shared cluster. Sleeping is acceptable, though a prospect's first click may take about a minute.

## Alternatives considered

None evaluated yet.

## Consequences

The provisioning guide ([Deploying to Render](../getting-started/deploying-to-render.md)) will gain the chosen plan and the staging service once this and [0108](0108-client-staging-workflow-and-data.md) are settled.
