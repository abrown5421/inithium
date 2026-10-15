import { projectTestConfig } from '../../../vitest.preset.mts';

export default projectTestConfig(import.meta.dirname, { database: true });
