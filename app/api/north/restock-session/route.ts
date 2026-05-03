import { NextResponse } from "next/server";

const NORTH_API_BASE = "https://checkout-api.north.com/public";

function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

type Product = { name: string; price: number; quantity: number };

// Restock session: same checkoutId + privateKey, separate profileId, no service fee.
// Env vars: NORTH_PRIVATE_API_KEY, NORTH_CHECKOUT_ID, NORTH_RESTOCK_PROFILE_ID
export async function POST(request: Request) {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  const checkoutId = process.env.NORTH_CHECKOUT_ID;
  const profileId = process.env.NORTH_RESTOCK_PROFILE_ID;

  if (!privateKey || !checkoutId || !profileId) {
    return NextResponse.json({ error: "Restock checkout is not configured." }, { status: 500 });
  }

  let products: Product[] = [];
  let taxOverride: number | undefined;
  let totalOverride: number | undefined;

  try {
    const body = await request.json();
    products = Array.isArray(body.products) ? body.products : [];
    taxOverride = typeof body.tax === "number" ? body.tax : undefined;
    totalOverride = typeof body.total === "number" ? body.total : undefined;
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

  const subtotal = normalizedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const tax = taxOverride ?? 0;
  // Service fee is always 0 for restock
  const serviceFee = 0;
  const amount = totalOverride ?? roundMoney(subtotal + tax + serviceFee);

  try {
    const response = await fetch(`${NORTH_API_BASE}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify({
        checkoutId,
        profileId,
        amount: roundMoney(amount),
        tax: roundMoney(tax),
        serviceFee: 0,
        products: normalizedProducts,
        metadata: JSON.stringify({ type: "pantry_restock" }),
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.message || "Failed to create restock session." },
        { status: response.status },
      );
    }

    const sessionToken =
      payload.sessionToken || payload.token ||
      payload.data?.sessionToken || payload.data?.token || "";

    return NextResponse.json({
      sessionToken,
      amount: roundMoney(amount),
      tax: roundMoney(tax),
      serviceFee: 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
