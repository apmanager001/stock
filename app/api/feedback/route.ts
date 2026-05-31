import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { FeedbackModel } from "@/lib/backend/mongoose/schemas/feedback";
import { feedbackRequestSchema } from "@/lib/feedback/validation";

type TurnstileVerificationResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function getStringField(body: unknown, field: string) {
  if (typeof body !== "object" || body === null || !(field in body)) {
    return "";
  }

  const value = body[field as keyof typeof body];
  return typeof value === "string" ? value : "";
}

function truncate(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return headers.get("cf-connecting-ip")?.trim() || forwardedFor || "";
}

async function verifyCaptcha(token: string, headers: Headers) {
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!turnstileSecretKey) {
    return {
      ok: false,
      reason: "Feedback CAPTCHA is not configured. Set TURNSTILE_SECRET_KEY.",
    } as const;
  }

  const formData = new URLSearchParams({
    secret: turnstileSecretKey,
    response: token,
  });
  const clientIp = getClientIp(headers);

  if (clientIp) {
    formData.set("remoteip", clientIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      reason: "CAPTCHA verification is unavailable right now.",
    } as const;
  }

  const payload = (await response.json()) as TurnstileVerificationResponse;

  if (!payload.success) {
    return {
      ok: false,
      reason: "Complete the CAPTCHA challenge and try again.",
    } as const;
  }

  return { ok: true } as const;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid feedback request body." },
      { status: 400 },
    );
  }

  if (getStringField(body, "company").trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = feedbackRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const captcha = await verifyCaptcha(
    parsed.data.captchaToken,
    request.headers,
  );

  if (!captcha.ok) {
    return NextResponse.json(
      {
        error: captcha.reason,
        fieldErrors: {
          captchaToken: [captcha.reason],
        },
      },
      { status: 400 },
    );
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    await connectMongoose();
    await FeedbackModel.create({
      authUserId: session?.user.id ?? "",
      authName: session?.user.name ?? "",
      authEmail: session?.user.email ?? "",
      name: parsed.data.name ?? session?.user.name ?? "",
      email: parsed.data.email ?? session?.user.email ?? "",
      message: parsed.data.message,
      pagePath: parsed.data.pagePath,
      referrer: truncate(request.headers.get("referer") ?? "", 500),
      userAgent: truncate(request.headers.get("user-agent") ?? "", 400),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit feedback right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
