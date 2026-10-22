import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

// One record per CMS user who has changed their dashboard (decision 0120). Users without one see the default.
const dashboardsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    // Checked by the contract (`dashboardWidgetsSchema`) before saving; each widget's settings are its own.
    widgets: {
      type: [
        new Schema(
          {
            id: { type: String, required: true },
            type: { type: String, required: true },
            width: { type: String, required: true },
            settings: { type: Schema.Types.Mixed, default: {} },
          },
          { _id: false, minimize: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export type DashboardRecord = InferSchemaType<typeof dashboardsSchema>;
export type DashboardDocument = HydratedDocument<DashboardRecord>;

export const DashboardModel = model('Dashboard', dashboardsSchema);
