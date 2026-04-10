import { Router } from 'express';
import {
  initStorageDirs,
  softDeleteFile,
  permanentDeleteFile,
  restoreFile,
  fileExists,
  resolveStoragePath,
} from './adapter/index.js';
import { createHandshakeRouter } from './handshake/index.js';
import { createProxyRouter } from './proxy/index.js';
import { startTokenGarbageCollector } from './handshake/token-store.js';
import { resolveCategory, toSchemaCategory } from './config/index.js';
import type { ProxyTarget } from './types/index.js';

export interface AssetRecord {
  _id?: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  storage_key: string;
  category: string;
  is_system_asset: boolean;
}

export interface AssetManagerService {
  findById(id: string): Promise<AssetRecord | null>;
  findOne(filter: Record<string, unknown>): Promise<AssetRecord | null>;
  updateById(id: string, patch: Record<string, unknown>): Promise<AssetRecord | null>;
  create(data: Record<string, unknown>): Promise<AssetRecord>;
}

export interface AssetManagerDeps {
  assetsService: AssetManagerService;
}

export interface AssetManagerInstance {
  handshakeRouter: Router;
  proxyRouter: Router;
  softDelete: typeof softDeleteFile;
  permanentDelete: typeof permanentDeleteFile;
  restore: typeof restoreFile;
  fileExists: typeof fileExists;
}

export const createAssetManager = async (
  deps: AssetManagerDeps
): Promise<AssetManagerInstance> => {
  await initStorageDirs();
  startTokenGarbageCollector();

  const finalizeAsset = async (params: {
    uploadId: string;
    storageKey: string;
    mimeType: string;
    originalName: string;
    sizeBytes: number;
  }): Promise<void> => {
    const category = resolveCategory(params.mimeType);

    await deps.assetsService.create({
      filename: params.storageKey,
      original_name: params.originalName,
      mimetype: params.mimeType,
      size: params.sizeBytes,
      storage_key: params.storageKey,
      category: toSchemaCategory(category),
      is_system_asset: false,
    });
  };

  const resolveTargetById = async (id: string): Promise<ProxyTarget | null> => {
    const record = await deps.assetsService.findById(id);
    if (!record) return null;
    return {
      absolutePath: resolveStoragePath(record.storage_key, record.mimetype),
      mimeType: record.mimetype,
      storageKey: record.storage_key,
    };
  };

  const resolveTargetByKey = async (storageKey: string): Promise<ProxyTarget | null> => {
    const record = await deps.assetsService.findOne({ storage_key: storageKey });
    if (!record) return null;
    return {
      absolutePath: resolveStoragePath(record.storage_key, record.mimetype),
      mimeType: record.mimetype,
      storageKey: record.storage_key,
    };
  };

  return {
    handshakeRouter: createHandshakeRouter(finalizeAsset),
    proxyRouter: createProxyRouter({
      byId: resolveTargetById,
      byStorageKey: resolveTargetByKey,
    }),
    softDelete: softDeleteFile,
    permanentDelete: permanentDeleteFile,
    restore: restoreFile,
    fileExists,
  };
};
