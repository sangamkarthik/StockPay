import { NextResponse } from "next/server";

const NORTH_API_BASE = "https://checkout.north.com";

// Capture finalises a prior auth-only transaction.
export async function POST(request: Request) {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  if (!privateKey) return NextResponse.json({ error: "North not configured." }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { authGuid, amount } = body as { authGuid?: string; amount?: number };
  if (!authGuid) return NextResponse.json({ error: "Missing authGuid." }, { status: 400 });
  if (amount === undefined) return NextResponse.json({ error: "Missing amount." }, { status: 400 });

  try {
    const res = await fetch(`${NORTH_API_BASE}/api/payments/capture`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${privateKey}` },
      body: JSON.stringify({ orig_auth_guid: authGuid, amount }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Capture failed." }, { status: res.status });
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
