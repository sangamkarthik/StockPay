import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

// North POSTs to this endpoint nightly for newly boarded merchants.
// Signature: X-Webhook-Signature contains "t=<ts>,v1=<hex>"
// Verify: HMAC-SHA256(signingSecret, "<timestamp>.<rawBody>") must match v1 in hex.
export async function POST(request: Request) {
  const signingSecret = process.env.NORTH_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    console.error("[north/webhook] NORTH_WEBHOOK_SIGNING_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get("x-webhook-signature") ?? "";

  // Parse t= and v1= from header
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = parts["t"];
  const receivedSig = parts["v1"];

  if (!timestamp || !receivedSig) {
    return NextResponse.json({ error: "Missing signature header." }, { status: 400 });
  }

  // Reject stale webhooks (> 5 min)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) {
    return NextResponse.json({ error: "Webhook timestamp too old." }, { status: 400 });
  }

  const expected = createHmac("sha256", signingSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(receivedSig, "hex");

  const valid =
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf);

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(rawBody); } catch { /* ignore */ }

  console.log("[north/webhook] Verified merchant signup:", payload);

  // TODO: store newly boarded merchant data in DB when needed
  return NextResponse.json({ received: true });
}
