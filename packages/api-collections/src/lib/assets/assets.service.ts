import { BaseService } from '@inithium/api-core';
import type { Asset } from '@inithium/types';
import { AssetModel } from './assets.model.js';

export class AssetService extends BaseService<Asset> {
  constructor() {
    super(AssetModel);
  }

  async findByStorageKey(storage_key: string): Promise<Asset | null> {
    return this.model.findOne({ storage_key }).lean<Asset>().exec();
  }

  async findByCategory(category: Asset['category']): Promise<Asset[]> {
    const result = await this.readMany({ category } as any);
    return result.items;
  }
}

export const assetsService = new AssetService();