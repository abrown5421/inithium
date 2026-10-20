import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

// One record per site (decision 0082), found by its fixed key.
export const SITE_SETTINGS_KEY = 'site';

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SITE_SETTINGS_KEY },
    siteTitle: { type: String, required: true, trim: true },
    logo: {
      // An asset id (decision 0098); logos stored as URLs before assets existed have none, and are ignored.
      type: new Schema({ assetId: { type: String }, alt: { type: String, default: '' } }, { _id: false }),
      required: false,
    },
    // The logo in dark mode (decision 0119), as `logo`.
    logoDark: { type: new Schema({ assetId: { type: String }, alt: { type: String, default: '' } }, { _id: false }), required: false },
    // The favicon's asset id (decision 0101).
    favicon: { type: new Schema({ assetId: { type: String } }, { _id: false }), required: false },
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
    // The theme's fonts (decision 0111): library family ids, checked against the library when saved.
    fonts: { type: new Schema({ display: String, body: String }, { _id: false }), required: false },
    // Whether dark mode is offered (decision 0119). Missing means on.
    darkMode: { type: Boolean, required: false },
  },
  { timestamps: true },
);

export type SettingsRecord = InferSchemaType<typeof settingsSchema>;
export type SettingsDocument = HydratedDocument<SettingsRecord>;

export const SettingsModel = model('Settings', settingsSchema);
