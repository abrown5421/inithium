import mongoose, { Schema } from "mongoose";
import type { User } from "@inithium/types";

const TrianglifyOptionsSchema = new Schema(
  {
    variance: { type: Number, required: true },
    cell_size: { type: Number, required: true },
    x_colors: [{ type: String }],
    y_colors: [{ type: String }],
  },
  { _id: false },
);

const AvatarOptionsSchema = new Schema(
  {
    gradient: { type: String },
    font: { type: String },
    variant: { type: String, enum: ["square", "circular"] },
  },
  { _id: false },
);
const GenderSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Male", "Female", "Prefer Not to Say", "Other"],
    },
    custom: { type: String },
  },
  { _id: false },
);

const AddressSchema = new Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  { _id: false },
);

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["super-admin", "admin", "editor", "writer", "user"],
      default: "user",
    },
    user_banner: { type: TrianglifyOptionsSchema },
    user_avatar: { type: AvatarOptionsSchema },
    bio: { type: String },
    gender: { type: GenderSchema },
    phone_number: { type: String },
    dob: { type: String },
    address: { type: AddressSchema },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<User>("User", UserSchema);
