import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { assetKinds, assetPurposes } from '@inithium/shared-contracts';

// An asset's record (decisions 0028, 0098). Its id is random (not a guessable ObjectId), since every asset is
// public: knowing a file's address is the only way to fetch it.
const assetsSchema = new Schema(
  {
    _id: { type: String, required: true },
    purpose: { type: String, enum: [...assetPurposes], required: true, index: true },
    kind: { type: String, enum: [...assetKinds], required: true, index: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    filename: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
    uploadedBy: { type: String, required: true, index: true },
    // Which storage holds the bytes, and where within it.
    driver: { type: String, enum: ['database', 'r2'], required: true },
    key: { type: String, required: true },
  },
  { timestamps: true },
);

export type AssetRecord = InferSchemaType<typeof assetsSchema>;
export type AssetDocument = HydratedDocument<AssetRecord>;

export const AssetModel = model('Asset', assetsSchema);

// The database driver's bytes, one document per file (each at most 2 MB, well inside MongoDB's 16 MB limit).
const assetBlobsSchema = new Schema({ _id: { type: String, required: true }, data: { type: Buffer, required: true } }, { versionKey: false });

export const AssetBlobModel = model('AssetBlob', assetBlobsSchema, 'asset_blobs');
