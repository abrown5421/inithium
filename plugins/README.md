# Plugins

Plugin source lives here, outside `core/`, so client repos only contain the plugins installed into them. No plugins exist yet.

```
plugins/plugin-<name>/
  api/         Express routes, Mongoose models, services, seed/unseed
  web/         React slot components + RTK Query endpoints (end-user site)
  cms/         React slot components + RTK Query endpoints (client portal)
  contracts/   Zod schemas + inferred types
```

Each layer is an Nx lib. On install, it lands in `core/libs/plugins/<name>/<layer>` and is wired into the apps through their slot registries. Core never imports from this directory.

The full plugin contract (slots, seeding, ejecting) is in [CLAUDE.md](../CLAUDE.md#2-plugin-architecture).
