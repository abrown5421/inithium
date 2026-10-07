# Inithium

Template-and-plugins ecosystem. Client projects are cloned from core and receive only the plugins they use.

| Directory | Purpose |
| --- | --- |
| [`core/`](core) | Standalone Nx monorepo (`@inithium` scope) with the `api` (Express), `web` (React) and `cms` (React) apps. Contains no plugin code. |
| [`plugins/`](plugins) | Library of installable/ejectable plugins that extend core through slot registries. |
| [`sandbox/`](sandbox) | Tooling that rebuilds a replica of core with every plugin installed, for browser testing. |

Architecture, conventions and the working protocol are in [CLAUDE.md](CLAUDE.md).

## Quick start

```sh
cd core
npm install
npx nx serve api      # or: web, cms
```
