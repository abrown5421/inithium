import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

// Setup checklist steps ticked by hand (decision 0120), one record per step, for the whole site.
const setupChecklistTicksSchema = new Schema(
  {
    itemId: { type: String, required: true, unique: true },
    // Who ticked it.
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

export type SetupChecklistTickRecord = InferSchemaType<typeof setupChecklistTicksSchema>;
export type SetupChecklistTickDocument = HydratedDocument<SetupChecklistTickRecord>;

export const SetupChecklistTickModel = model('SetupChecklistTick', setupChecklistTicksSchema, 'setup_checklist_ticks');
