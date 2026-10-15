import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { fontFallbacks } from '@inithium/shared-contracts';

// One file of a family: its font asset, and what it covers as read from the file (decision 0111). The name and type
// are copied from the asset so families can be listed without it.
const fontFamilyFileSchema = new Schema(
  {
    assetId: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    weight: {
      type: new Schema({ min: { type: Number, required: true }, max: { type: Number, required: true } }, { _id: false }),
      required: true,
    },
    style: { type: String, enum: ['normal', 'italic'], required: true },
    // The file's measurements, for its fallback face (decision 0114), validated by fontMetricsSchema.
    metrics: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

// A font family in the library (decision 0111). Files stay assets; a family only groups them.
const fontFamiliesSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    fallback: { type: String, enum: [...fontFallbacks], required: true },
    files: { type: [fontFamilyFileSchema], default: [] },
  },
  { timestamps: true },
);
fontFamiliesSchema.index({ 'files.assetId': 1 });

export type FontFamilyDbRecord = InferSchemaType<typeof fontFamiliesSchema>;
export type FontFamilyDocument = HydratedDocument<FontFamilyDbRecord>;

export const FontFamilyModel = model('FontFamily', fontFamiliesSchema, 'font_families');
