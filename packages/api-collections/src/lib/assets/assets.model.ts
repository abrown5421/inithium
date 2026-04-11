import mongoose, { Schema } from 'mongoose';
import type { Asset } from '@inithium/types';

const AssetSchema = new Schema<Asset>(
  {
    filename: { type: String, required: true },
    original_name: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    storage_key: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['image', 'font', 'audio', 'document', 'other'],
      required: true,
    },
    is_system_asset: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AssetSchema.index({ category: 1 });

export const AssetModel = mongoose.model<Asset>('Asset', AssetSchema);

const KNOWN_INDEXES = new Set(['_id_', 'storage_key_1', 'category_1']);

AssetModel.on('index', async () => {
  try {
    const existing = await AssetModel.collection.indexes();
    await Promise.all(
      existing
        .filter((idx) => !KNOWN_INDEXES.has(idx.name as string))
        .map((idx) =>
          AssetModel.collection.dropIndex(idx.name as string).catch(() => undefined)
        )
    );
  } catch {
    // Collection may not exist yet on first run — nothing to do.
  }
});