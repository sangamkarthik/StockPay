import { NextResponse } from "next/server";

const SESSION_STATUS_URL = "https://checkout.north.com/api/sessions/status";

// Server-side payment verification — never trust the client alone.
// Polls North's session status until Approved or Declined.
export async function POST(request: Request) {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  const checkoutId = process.env.NORTH_CHECKOUT_ID;
  const profileId = process.env.NORTH_PROFILE_ID;

  if (!privateKey || !checkoutId || !profileId) {
    return NextResponse.json({ error: "North not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const sessionToken = body.sessionToken as string | undefined;

  if (!sessionToken) {
    return NextResponse.json({ error: "Missing sessionToken." }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${privateKey}`,
    SessionToken: sessionToken,
    CheckoutId: checkoutId,
    ProfileId: profileId,
  };

  // Poll up to 6 times with 1 s gap — status may start as Verified/Open
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));

    try {
      const res = await fetch(SESSION_STATUS_URL, { headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json({ error: data.message ?? "Status check failed." }, { status: res.status });
      }

      const status = String(data.status ?? "").toLowerCase();

      if (status === "approved") {
        return NextResponse.json({ verified: true, status: "approved", data });
      }
      if (status === "declined" || status === "failed") {
        return NextResponse.json({ verified: false, status, data }, { status: 402 });
      }
      // Still pending (Verified/Open) — keep polling
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 502 });
    }
  }

  // Timed out — return last known state as unverified
  return NextResponse.json({ verified: false, status: "timeout" }, { status: 408 });
}
