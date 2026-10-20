import { describe, expect, it } from 'vitest';
import { registerContentElementContracts } from '@inithium/shared-contracts';
import { registeredContentElementContracts, registeredUserDeletionHooks } from './plugins.registry';

// Checks whatever the install tooling has registered. Core ships the registry empty, so this matters once a plugin
// (or libs/client) adds a hook; each plugin also proves its own hook with expectUserDeletionHook (decision 0103).
describe('the api registry (decision 0100)', () => {
  it('gives every user deletion hook a key of its own and a label', () => {
    const keys = registeredUserDeletionHooks.map((hook) => hook.key);
    expect(new Set(keys).size, 'two hooks share a key').toBe(keys.length);
    for (const hook of registeredUserDeletionHooks) {
      expect(hook.key, 'a hook has no key').toMatch(/\S/);
      expect(hook.label, `hook ${hook.key} has no label`).toMatch(/\S/);
    }
  });
});

describe('the api registry’s content elements (decision 0116)', () => {
  it('names each plugin element plugin-<name>:<element>, once', () => {
    expect(() => registerContentElementContracts(registeredContentElementContracts)).not.toThrow();
    registerContentElementContracts([]);
  });
});
