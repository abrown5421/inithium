import { model, Schema, type InferSchemaType } from 'mongoose';

const refreshTokensSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // SHA-256 of the token. The raw token only ever exists in the user's cookie.
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    // Set when the token is rotated or the user logs out.
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// MongoDB deletes each token once it expires.
refreshTokensSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenRecord = InferSchemaType<typeof refreshTokensSchema>;

export const RefreshTokenModel = model('RefreshToken', refreshTokensSchema);
