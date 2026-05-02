import { NextResponse } from "next/server";
import { makeDoorDashJWT } from "../_jwt";

const DOORDASH_API_BASE = "https://openapi.doordash.com/drive/v2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get("id");

  if (!deliveryId) {
    return NextResponse.json({ error: "Missing delivery id" }, { status: 400 });
  }

  // Simulated deliveries — return static status
  if (deliveryId.startsWith("DEMO-")) {
    return NextResponse.json({ status: "enroute_to_pickup", simulated: true });
  }

  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;

  if (!developerId || !keyId || !signingSecret) {
    return NextResponse.json({ status: "enroute_to_pickup", simulated: true });
  }

  try {
    const token = makeDoorDashJWT(developerId, keyId, signingSecret);
    const res = await fetch(`${DOORDASH_API_BASE}/deliveries/${deliveryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? "DoorDash status error");

    return NextResponse.json({
      status: data.delivery_status,
      tracking_url: data.tracking_url ?? null,
      dasher: data.dasher ?? null,
      estimated_pickup_time: data.pickup_time_estimated ?? null,
      estimated_delivery_time: data.dropoff_time_estimated ?? null,
    });
  } catch (err) {
    console.error("[doorstep/status]", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
