import { InferSchemaType, Schema, model, models } from "mongoose";

const userProfileSchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    roles: {
      type: [String],
      default: ["member"],
    },
  },
  {
    timestamps: true,
  },
);

export type UserProfile = InferSchemaType<typeof userProfileSchema>;

export const UserProfileModel =
  models.UserProfile || model("UserProfile", userProfileSchema);
