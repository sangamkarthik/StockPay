import { NextResponse } from "next/server";

const NORTH_API_BASE = "https://checkout.north.com";

function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

type Product = { name: string; price: number; quantity: number };

export async function POST(request: Request) {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  const checkoutId = process.env.NORTH_CHECKOUT_ID;
  const profileId = process.env.NORTH_PROFILE_ID;

  if (!privateKey || !checkoutId || !profileId) {
    return NextResponse.json({ error: "North checkout is not configured." }, { status: 500 });
  }

  let products: Product[] = [];
  let taxOverride: number | undefined;
  let serviceFeeOverride: number | undefined;

  try {
    const body = await request.json();
    products = Array.isArray(body.products) ? body.products : [];
    taxOverride = typeof body.tax === "number" ? body.tax : undefined;
    serviceFeeOverride = typeof body.serviceFee === "number" ? body.serviceFee : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const normalizedProducts = products
    .filter((p) => p.name && Number(p.quantity) > 0)
    .map((p) => ({
      name: String(p.name),
      price: roundMoney(p.price || 0),
      quantity: Number(p.quantity || 1),
    }));

  const tax = roundMoney(taxOverride ?? 0);
  const serviceFee = roundMoney(serviceFeeOverride ?? 0);

  // North charges sum(products) and validates amount == sum(products).
  // Tax and serviceFee are display-only. To authorize the full grand total,
  // append fee line items so sum(products) = grand total, and send tax/serviceFee=0.
  const northProducts = [...normalizedProducts];
  if (tax > 0) northProducts.push({ name: "Tax", price: tax, quantity: 1 });
  if (serviceFee > 0) northProducts.push({ name: "Delivery & Service Fee", price: serviceFee, quantity: 1 });
  const amount = roundMoney(northProducts.reduce((sum, p) => sum + p.price * p.quantity, 0));

  const northBody = {
    checkoutId,
    profileId,
    amount,
    tax: 0,
    serviceFee: 0,
    products: northProducts,
    metadata: JSON.stringify({}),
  };
  console.log("[north/session] request →", JSON.stringify(northBody));

  try {
    const response = await fetch(`${NORTH_API_BASE}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify(northBody),
    });

    const payload = await response.json().catch(() => ({}));
    console.log("[north/session] response ←", response.status, JSON.stringify(payload));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.message || "Failed to create checkout session." },
        { status: response.status },
      );
    }

    const sessionToken =
      payload.sessionToken || payload.token ||
      payload.data?.sessionToken || payload.data?.token || "";

    return NextResponse.json({
      sessionToken,
      amount,
      tax,
      serviceFee,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
