# Plugins

Plugin source lives here, outside `templates/core`, so client clones only contain the plugins that were injected into them.

```
plugins/plugin-<name>/
  api/   Express routes and Mongoose models  -> apps/api/src/plugins/plugin-<name>/
  web/   React slot components and RTK Query endpoints -> apps/web/src/plugins/plugin-<name>/
```

Available: `plugin-blog`, `plugin-contact`, `plugin-ecom`, `plugin-friends`, `plugin-gallery`, `plugin-storage`.

The core template must never import from this directory. The injection routine in [`sandbox/`](../sandbox) copies plugin files into a clone.
