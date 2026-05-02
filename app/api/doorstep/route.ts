import { NextResponse } from "next/server";
import { makeDoorDashJWT } from "./_jwt";

const DOORDASH_API_BASE = "https://openapi.doordash.com/drive/v2";
const STORE_ADDRESS = "500 7th Ave, New York, NY 10018";
const STORE_PHONE = "+12125551234";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { deliveryAddress, items = [], orderTotal = 10 } = body as {
    deliveryAddress?: string;
    items?: string[];
    orderTotal?: number;
  };

  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;

  if (!developerId || !keyId || !signingSecret) {
    return NextResponse.json(simulatedDelivery());
  }

  try {
    const token = makeDoorDashJWT(developerId, keyId, signingSecret);
    const externalId = `rr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const res = await fetch(`${DOORDASH_API_BASE}/deliveries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        external_delivery_id: externalId,
        pickup_address: STORE_ADDRESS,
        pickup_business_name: "Recipe Remix Grocery",
        pickup_phone_number: STORE_PHONE,
        pickup_instructions: "Items packed and ready at the counter.",
        dropoff_address: deliveryAddress ?? STORE_ADDRESS,
        dropoff_business_name: "Customer",
        dropoff_phone_number: "+12125559999",
        dropoff_instructions: "Leave at the door.",
        order_value: Math.round(orderTotal * 100),
        items: items.map((name) => ({ name, quantity: 1, price: 299 })),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? "DoorDash error");

    return NextResponse.json({
      simulated: false,
      delivery_id: data.external_delivery_id ?? externalId,
      status: data.delivery_status ?? "created",
      tracking_url: data.tracking_url ?? null,
      dasher: data.dasher ?? null,
      estimated_pickup_time: data.pickup_time_estimated ?? null,
      estimated_delivery_time: data.dropoff_time_estimated ?? null,
    });
  } catch (err) {
    console.error("[doorstep/create]", err);
    return NextResponse.json(simulatedDelivery());
  }
}

function simulatedDelivery() {
  return {
    simulated: true,
    delivery_id: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: "created",
    tracking_url: null,
    dasher: null,
    estimated_pickup_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
  };
}
