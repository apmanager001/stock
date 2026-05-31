import { z } from "zod";

const optionalText = (maxLength: number, message: string) =>
  z
    .union([z.string().trim().max(maxLength, message), z.literal("")])
    .transform((value) => value || undefined);

export const feedbackSubmissionSchema = z.object({
  name: optionalText(60, "Name must be 60 characters or fewer."),
  email: z
    .union([
      z.string().trim().email("Enter a valid email address."),
      z.literal(""),
    ])
    .transform((value) => value || undefined),
  message: z
    .string()
    .trim()
    .min(10, "Share at least 10 characters.")
    .max(1200, "Keep feedback under 1200 characters."),
  pagePath: z
    .string()
    .trim()
    .min(1, "A page path is required.")
    .max(200, "Page path must be 200 characters or fewer."),
});

export const feedbackRequestSchema = feedbackSubmissionSchema.extend({
  captchaToken: z.string().trim().min(1, "Complete the CAPTCHA challenge."),
});

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;
export type FeedbackRequestInput = z.infer<typeof feedbackRequestSchema>;
