import { NextResponse } from "next/server";

const NORTH_API_BASE = "https://checkout.north.com";

function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

type Product = { name: string; price: number; quantity: number };

// Restock session: uses the same profile as main checkout (NORTH_PROFILE_ID).
// NORTH_RESTOCK_PROFILE_ID causes North to drop connections — confirmed broken in their portal.
// serviceFee:0 and metadata.type="pantry_restock" differentiate this from a normal checkout.
export async function POST(request: Request) {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  const checkoutId = process.env.NORTH_CHECKOUT_ID;
  const profileId = process.env.NORTH_PROFILE_ID;

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

  const northBody = {
    checkoutId,
    profileId,
    amount: roundMoney(amount),
    tax: roundMoney(tax),
    serviceFee: 0,
    products: normalizedProducts,
    metadata: JSON.stringify({}),
  };
  console.log("[restock-session] sending to North:", JSON.stringify(northBody));

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

    if (!response.ok) {
      const detail = payload.message || payload.error || payload.title || JSON.stringify(payload);
      console.error("[restock-session] North error", response.status, detail);
      return NextResponse.json(
        { error: detail || "Failed to create restock session." },
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
    const cause = err instanceof Error && (err as NodeJS.ErrnoException).cause;
    const code = err instanceof Error && (err as NodeJS.ErrnoException).code;
    console.error("[restock-session] fetch threw:", message, "cause:", cause, "code:", code);
    return NextResponse.json({ error: message, cause: String(cause ?? ""), code: String(code ?? "") }, { status: 502 });
  }
}
