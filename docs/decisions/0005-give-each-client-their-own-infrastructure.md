---
id: "0005"
title: Give each client their own GitHub, Atlas and Render accounts
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [clients, hosting, mongodb, render]
related: ["0004", "0006"]
supersedes: []
---

# 0005. Give each client their own GitHub, Atlas and Render accounts

## Context

Client usage and any paid upgrades shouldn't land on the Inithium owner's personal accounts. Each client also needs full control of their own project, without having to sift through personal projects or other clients' work.

## Decision

| | Inithium, sandbox, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | Personal account | Client's own account and repo |
| MongoDB | One shared Atlas cluster, one database per project | Client's own Atlas account and cluster, with a single database |
| Render | Personal account | Client's own account, signed in with their GitHub |

Switching an app between databases or clusters is only ever a change to `MONGODB_URI`.

## Alternatives considered

- **Hosting clients on Inithium's own accounts**: rejected. Costs would land on Inithium, and handing a project over would mean untangling it from personal projects and other clients.

## Consequences

- Provisioning a client includes creating their Atlas and Render accounts.
- Nothing in code may be tied to a specific cluster or account.
