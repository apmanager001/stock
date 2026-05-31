import "server-only";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { FeedbackModel } from "@/lib/backend/mongoose/schemas/feedback";

export type FeedbackAdminEntry = {
  id: string;
  submitterName: string;
  contactEmail: string | null;
  message: string;
  pagePath: string;
  status: "new" | "reviewed" | "archived";
  isAuthenticated: boolean;
  submittedAt: string;
};

type FeedbackDocument = {
  _id: { toString(): string } | string;
  authUserId?: string | null;
  authName?: string | null;
  authEmail?: string | null;
  name?: string | null;
  email?: string | null;
  message: string;
  pagePath?: string | null;
  status?: "new" | "reviewed" | "archived" | null;
  createdAt?: Date | null;
};

function resolveSubmitterName(feedback: FeedbackDocument) {
  return (
    feedback.name?.trim() ||
    feedback.authName?.trim() ||
    feedback.email?.trim() ||
    feedback.authEmail?.trim() ||
    "Anonymous"
  );
}

function resolveContactEmail(feedback: FeedbackDocument) {
  return feedback.email?.trim() || feedback.authEmail?.trim() || null;
}

export async function getRecentFeedbackEntries(
  limit = 100,
): Promise<FeedbackAdminEntry[]> {
  await connectMongoose();

  const normalizedLimit = Math.min(Math.max(Math.floor(limit), 1), 250);
  const feedbackEntries = (await FeedbackModel.find(
    {},
    {
      authUserId: 1,
      authName: 1,
      authEmail: 1,
      name: 1,
      email: 1,
      message: 1,
      pagePath: 1,
      status: 1,
      createdAt: 1,
    },
  )
    .sort({ createdAt: -1 })
    .limit(normalizedLimit)
    .lean()) as FeedbackDocument[];

  return feedbackEntries.map((feedback) => ({
    id:
      typeof feedback._id === "string" ? feedback._id : feedback._id.toString(),
    submitterName: resolveSubmitterName(feedback),
    contactEmail: resolveContactEmail(feedback),
    message: feedback.message,
    pagePath: feedback.pagePath?.trim() || "/",
    status: feedback.status ?? "new",
    isAuthenticated: Boolean(feedback.authUserId?.trim()),
    submittedAt:
      feedback.createdAt instanceof Date
        ? feedback.createdAt.toISOString()
        : new Date().toISOString(),
  }));
}
