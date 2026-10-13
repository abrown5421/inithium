import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { loadEnv } from '@inithium/api-config';
import { MAX_ASSET_BYTES } from '@inithium/shared-contracts';
import { AssetBlobModel, AssetModel } from './assets.model';

/** What a storage driver can do (decisions 0028, 0098). Features check these, never which driver is in use. */
export type StorageCapabilities = {
  /** Built to hold many and large files (object storage); member uploads need it. */
  scalable: boolean;
  /** The largest file it takes, in bytes. */
  maxBytes: number;
  /** Its total cap in bytes, if it has one. */
  quotaBytes?: number;
};

/** How a stored file should be sent: its type, and inline or as a download with its name. */
export type StoredFileInfo = { contentType: string; disposition: string };

/** Where an asset's bytes live (decisions 0028, 0098). */
export type StorageDriver = {
  name: 'database' | 'r2';
  capabilities: StorageCapabilities;
  put(key: string, data: Buffer, info: StoredFileInfo): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
  /** Where the file can be fetched directly, if the driver has a public address; otherwise the api sends it. */
  publicUrl?(key: string): string;
  /** Checks the driver can be reached, so a misconfigured site fails on startup rather than on its first upload. */
  verify?(): Promise<void>;
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

type R2Settings = { accountId?: string; accessKeyId: string; secretAccessKey: string; bucket: string; endpoint?: string; publicUrl?: string };

/**
 * The R2 driver (decision 0098): Cloudflare R2 through its S3-compatible API. Objects carry their type, disposition
 * and a year's caching, so a public bucket address sends them the same way the api would.
 */
export function r2Driver(settings: R2Settings): StorageDriver {
  const client = new S3Client({
    region: 'auto',
    endpoint: settings.endpoint ?? `https://${settings.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey },
    forcePathStyle: true,
    // R2 doesn't take every checksum newer SDKs add by default; send and check them only when an operation needs one.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  const Bucket = settings.bucket;
  return {
    name: 'r2',
    capabilities: { scalable: true, maxBytes: MAX_ASSET_BYTES },
    async put(key, data, info) {
      await client.send(
        new PutObjectCommand({
          Bucket,
          Key: key,
          Body: data,
          ContentType: info.contentType,
          ContentDisposition: info.disposition,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    },
    async get(key) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket, Key: key }));
        return object.Body ? Buffer.from(await object.Body.transformToByteArray()) : null;
      } catch (error) {
        if ((error as { name?: string }).name === 'NoSuchKey') return null;
        throw error;
      }
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
    },
    ...(settings.publicUrl ? { publicUrl: (key: string) => `${settings.publicUrl}/${encodeURIComponent(key)}` } : {}),
    async verify() {
      await client.send(new HeadBucketCommand({ Bucket }));
    },
  };
}

/** The R2 driver from the environment, or null when R2 isn't configured. */
function r2FromEnv(): StorageDriver | null {
  const env = loadEnv();
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET || (!env.R2_ACCOUNT_ID && !env.R2_ENDPOINT)) return null;
  return r2Driver({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    endpoint: env.R2_ENDPOINT,
    publicUrl: env.R2_PUBLIC_URL,
  });
}

const drivers: Partial<Record<StorageDriver['name'], StorageDriver | null>> = {};

/** The driver new uploads go to, from STORAGE_MODE (decision 0098): the database, or R2 in the cloud modes. */
export function storageDriver(): StorageDriver {
  const env = loadEnv();
  return env.STORAGE_MODE === 'database' ? driverFor('database') : driverFor('r2');
}

/**
 * The driver that holds an existing asset's bytes, which may differ from the one new uploads use after the mode
 * changes: database assets stay readable in the cloud modes, and R2 assets in database mode while R2 is configured.
 */
export function driverFor(name: StorageDriver['name']): StorageDriver {
  if (drivers[name] === undefined) {
    drivers[name] = name === 'database' ? databaseDriver(loadEnv().STORAGE_DATABASE_QUOTA_MB * 1024 * 1024) : r2FromEnv();
  }
  const driver = drivers[name];
  if (!driver) throw new Error(`This file is stored in ${name}, which isn't configured`);
  return driver;
}

/** Picks and checks the upload driver on startup; in the cloud modes, fails with a clear message if R2 can't be reached. */
export async function startStorage(): Promise<StorageDriver> {
  const driver = storageDriver();
  try {
    await driver.verify?.();
  } catch (error) {
    // HeadBucket has no body, so the SDK often can't name the error: the status says more (403 keys, 404 bucket).
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    const reason = status === 403 ? 'the keys were refused' : status === 404 ? 'no such bucket' : (error as Error).message;
    throw new Error(`Can't reach the R2 bucket "${loadEnv().R2_BUCKET}" (${status ?? 'no answer'}: ${reason}). Check the R2_* settings.`);
  }
  return driver;
}

/** Bytes stored by a driver. */
export async function usedBytes(driver: StorageDriver['name']): Promise<number> {
  const [row] = await AssetModel.aggregate<{ total: number }>([{ $match: { driver } }, { $group: { _id: null, total: { $sum: '$size' } } }]);
  return row?.total ?? 0;
}
