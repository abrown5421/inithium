# Sandbox

Throwaway clones of `templates/core` for testing plugin injection. Clones are written to `sandbox/workspaces/`, which is git-ignored.

No dependencies needed; requires Node 22+.

```sh
cd sandbox

# Clone the core template (add --install to run npm install, --force to replace an existing clone)
npm run clone -- demo --install

# Inject one or more plugins ("plugin-" prefix is optional)
npm run inject -- demo blog gallery

# Run the result
cd workspaces/demo
npx nx serve api
```

Injection copies `plugins/<plugin>/api` to `apps/api/src/plugins/<plugin>` and `plugins/<plugin>/web` to `apps/web/src/plugins/<plugin>`, replacing any previous copy. Target paths are defined in [`scripts/paths.mjs`](scripts/paths.mjs).
