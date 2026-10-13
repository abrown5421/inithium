import type { z } from 'zod';
import type {
  assetKindSchema,
  assetPurposeSchema,
  assetSchema,
  assetUpdateSchema,
  assetUploadFieldsSchema,
  assetUsageSchema,
  storageInfoSchema,
  storageModeSchema,
} from './assets.schema';

export type StorageMode = z.infer<typeof storageModeSchema>;
export type AssetPurpose = z.infer<typeof assetPurposeSchema>;
export type AssetKind = z.infer<typeof assetKindSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type AssetUpdate = z.infer<typeof assetUpdateSchema>;
export type AssetUploadFields = z.infer<typeof assetUploadFieldsSchema>;
export type StorageInfo = z.infer<typeof storageInfoSchema>;
export type AssetUsage = z.infer<typeof assetUsageSchema>;
