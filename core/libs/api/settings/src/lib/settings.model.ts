import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

// One record per site (decision 0082), found by its fixed key.
export const SITE_SETTINGS_KEY = 'site';

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SITE_SETTINGS_KEY },
    siteTitle: { type: String, required: true, trim: true },
    logo: {
      type: new Schema({ src: { type: String, required: true }, alt: { type: String, default: '' } }, { _id: false }),
      required: false,
    },
    copyright: { type: String, required: false, trim: true },
    // Hex colours, validated by the contract (decision 0087). Missing means Inithium's default theme.
    theme: {
      type: new Schema(
        {
          colors: new Schema(
            { primary: String, secondary: String, tertiary: String, quaternary: String, accent: String, surface: String },
            { _id: false },
          ),
        },
        { _id: false },
      ),
      required: false,
    },
  },
  { timestamps: true },
);

export type SettingsRecord = InferSchemaType<typeof settingsSchema>;
export type SettingsDocument = HydratedDocument<SettingsRecord>;

export const SettingsModel = model('Settings', settingsSchema);
