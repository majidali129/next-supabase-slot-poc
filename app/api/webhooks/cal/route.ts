import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Cal.com subscriber URL (prod):
 *   https://next-supabase-slot-poc.vercel.app/api/webhooks/cal
 *
 * Verifies `X-Cal-Signature-256` (HMAC-SHA256 of the raw body) against
 * `CAL_WEBHOOK_SECRET`, then logs the event so you can confirm delivery
 * in Vercel function logs. No side effects yet — testing only.
 */

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature);
  const computed = Buffer.from(expected);

  // timingSafeEqual throws if lengths differ — treat that as invalid.
  if (received.length !== computed.length) return false;
  return timingSafeEqual(received, computed);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhooks/cal",
    hint: "POST Cal.com webhook events here",
  });
}

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[cal webhook] CAL_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256");

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[cal webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { triggerEvent?: string; createdAt?: string; payload?: unknown };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Minimal test sink — inspect this in Vercel → Logs after triggering a booking.
  console.log("[cal webhook]", {
    triggerEvent: event.triggerEvent,
    createdAt: event.createdAt,
    payload: event.payload,
  });

  return NextResponse.json({ received: true, triggerEvent: event.triggerEvent ?? null });
}
