import { InferSchemaType, Schema, model, models } from "mongoose";

const feedbackSchema = new Schema(
  {
    authUserId: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    authName: {
      type: String,
      default: "",
      trim: true,
    },
    authEmail: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    pagePath: {
      type: String,
      default: "/",
      trim: true,
    },
    referrer: {
      type: String,
      default: "",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "new",
      enum: ["new", "reviewed", "archived"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Feedback = InferSchemaType<typeof feedbackSchema>;

export const FeedbackModel =
  models.Feedback || model("Feedback", feedbackSchema);
