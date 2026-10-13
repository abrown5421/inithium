import { loadEnv } from '@inithium/api-config';
import { MAX_ASSET_BYTES } from '@inithium/shared-contracts';
import { AssetBlobModel, AssetModel } from './assets.model';

/** What a storage driver can do (decision 0028). Features check these, never which driver is in use. */
export type StorageCapabilities = {
  /** Built to hold many and large files (object storage); member uploads need it. */
  scalable: boolean;
  /** The largest file it takes, in bytes. */
  maxBytes: number;
  /** Its total cap in bytes, if it has one. */
  quotaBytes?: number;
};

/** Where an asset's bytes live (decisions 0028, 0098). */
export type StorageDriver = {
  name: 'database' | 'r2';
  capabilities: StorageCapabilities;
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
};

/** The database driver: files live in the site's own MongoDB, so no third party is needed. */
export function databaseDriver(quotaBytes: number): StorageDriver {
  return {
    name: 'database',
    capabilities: { scalable: false, maxBytes: MAX_ASSET_BYTES, quotaBytes },
    async put(key, data) {
      await AssetBlobModel.create({ _id: key, data });
    },
    async get(key) {
      const blob = await AssetBlobModel.findById(key);
      return blob ? Buffer.from(blob.data) : null;
    },
    async remove(key) {
      await AssetBlobModel.deleteOne({ _id: key });
    },
  };
}

let active: StorageDriver | null = null;

/**
 * The driver new uploads go to, from STORAGE_MODE (decision 0098). Cloud modes need the R2 driver, which isn't built
 * yet, so they fail loudly rather than quietly storing files in the database.
 */
export function storageDriver(): StorageDriver {
  if (active) return active;
  const env = loadEnv();
  if (env.STORAGE_MODE !== 'database') {
    throw new Error(`STORAGE_MODE=${env.STORAGE_MODE} needs the R2 driver, which isn't available yet. Use STORAGE_MODE=database.`);
  }
  active = databaseDriver(env.STORAGE_DATABASE_QUOTA_MB * 1024 * 1024);
  return active;
}

/** The driver that holds an existing asset's bytes (which may differ from the active one after a switch). */
export function driverFor(name: 'database' | 'r2'): StorageDriver {
  const current = storageDriver();
  if (current.name === name) return current;
  if (name === 'database') return databaseDriver(loadEnv().STORAGE_DATABASE_QUOTA_MB * 1024 * 1024);
  throw new Error(`This asset is stored in ${name}, which isn't configured`);
}

/** Bytes stored by a driver. */
export async function usedBytes(driver: 'database' | 'r2'): Promise<number> {
  const [row] = await AssetModel.aggregate<{ total: number }>([{ $match: { driver } }, { $group: { _id: null, total: { $sum: '$size' } } }]);
  return row?.total ?? 0;
}
