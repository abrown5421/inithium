import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { navLocations, pageAudiences, pageStatuses } from '@inithium/shared-contracts';

// Shapes are validated with the shared Zod contracts before anything is saved (decision 0078).
const navigationSchema = new Schema(
  {
    locations: { type: [{ type: String, enum: [...navLocations] }], default: [] },
    label: { type: String },
    order: { type: Number, required: true, default: 0 },
    icon: { type: String },
    group: { type: String },
  },
  { _id: false },
);

const seoSchema = new Schema({ title: { type: String }, description: { type: String } }, { _id: false });

const pagesSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    path: { type: String, required: true, unique: true },
    status: { type: String, enum: [...pageStatuses], required: true, default: 'published' },
    template: { type: String, required: true, index: true },
    layout: { type: String, required: true },
    layouts: { type: [String], required: true },
    // Colour values and animations are small objects or names, validated by the contracts.
    bgColor: { type: Schema.Types.Mixed },
    textColor: { type: Schema.Types.Mixed },
    animation: { type: Schema.Types.Mixed },
    audience: { type: String, enum: [...pageAudiences], required: true, default: 'all' },
    navigation: { type: navigationSchema, required: true, default: () => ({}) },
    seo: { type: seoSchema, required: true, default: () => ({}) },
    protected: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, minimize: false },
);

export type PageRecord = InferSchemaType<typeof pagesSchema>;
export type PageDocument = HydratedDocument<PageRecord>;

export const PageModel = model('Page', pagesSchema);
