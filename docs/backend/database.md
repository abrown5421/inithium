---
title: Database
description: MongoDB and Mongoose in core, covering the connection lifecycle, connection strings, collections and where models live.
scope: core
tags: [mongodb, database, backend]
order: 3
decisions: ["0005", "0009", "0010"]
---

# Database

Core uses **MongoDB** through **Mongoose**. Only the `api` talks to the database.

## Connection

`@inithium/api-database` owns the single Mongoose connection:

| Function | Does |
| --- | --- |
| `connectDatabase(uri)` | Connects, waiting up to 10 seconds for a server, and logs `[ db ] connected to "<database>"`. It never logs the URI, which contains credentials. Once connected, it logs later connection errors and disconnects. |
| `disconnectDatabase()` | Closes the connection. The api calls it on `SIGTERM` or `SIGINT`. |

The api connects **before** it starts listening and exits if it can't, so it never accepts requests without a database ([0010](../decisions/0010-connect-to-the-database-before-listening.md)). A failed connection logs one line, e.g. `[ startup failed ] connect ECONNREFUSED …`.

## Connection strings

`MONGODB_URI` is validated at startup ([0009](../decisions/0009-read-environment-only-through-api-config.md)):

- It must start with `mongodb://` or `mongodb+srv://`.
- It **must name a database:** `…mongodb.net/<database>?…`. Without one, Mongoose silently writes to a database called `test`, so the api refuses to start instead.

| Who | Cluster | Database |
| --- | --- | --- |
| Inithium, the sandbox, plugins, personal projects | One shared Atlas cluster | A separate database per project, e.g. `/inithium` |
| Each client | The client's own Atlas account and cluster ([0005](../decisions/0005-give-each-client-their-own-infrastructure.md)) | A single database |

Moving an app to another database or cluster is only a change to `MONGODB_URI`.

### The `mongodb+srv://` lookup on a VPN

`mongodb+srv://` strings need an SRV DNS lookup. On Windows with a VPN (e.g. AWS Client VPN), Node can fail with `querySrv ECONNREFUSED`. Locally, use Atlas's standard connection string instead; it's the same cluster without the SRV lookup:

```
mongodb://<user>:<password>@host1:27017,host2:27017,host3:27017/<database>?tls=true&replicaSet=<set>&authSource=admin
```

Atlas also requires your IP on its **Network Access** list. Render deploys usually need `0.0.0.0/0`, because Render's addresses change.

## Collections

| Collection | Model | Lib | Holds |
| --- | --- | --- | --- |
| `users` | `UserModel` | `@inithium/api-users` | Every account, with its role. See [Users](users.md). |
| `refreshtokens` | `RefreshTokenModel` | `@inithium/api-auth` | Hashed refresh tokens. MongoDB deletes each one when it expires. See [Authentication](authentication.md). |

## Where models live

Mongoose models live in **data-access libs** under `libs/api/`, as `<entity>.model.ts`, next to an `<entity>.service.ts` of query functions (e.g. `findUserById`). Feature code calls the service functions rather than querying models directly.

Plugins keep their data in their own collections, keyed by `userId`; see [How plugins work](../plugins/how-plugins-work.md#a-plugins-data).
