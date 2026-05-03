import { NextResponse } from "next/server";
import { makeDoorDashJWT } from "../_jwt";

const DOORDASH_API_BASE = "https://openapi.doordash.com/drive/v2";

// Advances a sandbox delivery to the next status step.
// DoorDash sandbox doesn't auto-progress — call this to simulate delivery movement.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get("id");

  if (!deliveryId) return NextResponse.json({ error: "Missing delivery id" }, { status: 400 });
  if (deliveryId.startsWith("DEMO-")) return NextResponse.json({ simulated: true, message: "Simulated step advanced" });

  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;

  if (!developerId || !keyId || !signingSecret) {
    return NextResponse.json({ error: "DoorDash not configured" }, { status: 500 });
  }

  try {
    const token = makeDoorDashJWT(developerId, keyId, signingSecret);
    const res = await fetch(`${DOORDASH_API_BASE}/deliveries/${deliveryId}/simulate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? "Simulate failed");
    return NextResponse.json({ status: data.delivery_status, dasher: data.dasher ?? null });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
