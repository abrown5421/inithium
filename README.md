# Inithium

Template-and-plugins workspace. Client projects are cloned from a template and receive only the plugins they use.

| Directory | Purpose |
| --- | --- |
| [`templates/core`](templates/core) | Standalone Nx monorepo (`@inithium` scope) with the `api` (Express), `web` (React) and `cms` (React) apps. Contains no plugin code. |
| [`plugins/`](plugins) | Plugin source library. Each plugin has an `api/` and a `web/` layer that get injected into a cloned template. |
| [`sandbox/`](sandbox) | Local scratch area for cloning `templates/core` and testing plugin injection. |

## Quick start

```sh
cd templates/core
npm install
npx nx serve api      # or: web, cms
```

To try plugins against a throwaway clone, see [sandbox/README.md](sandbox/README.md).
