import { NextResponse } from "next/server";

export async function GET() {
  const privateKey = process.env.NORTH_PRIVATE_API_KEY;
  const checkoutId = process.env.NORTH_CHECKOUT_ID;
  const profileId = process.env.NORTH_PROFILE_ID;

  const requestBody = {
    checkoutId,
    profileId,
    amount: 10,
    tax: 3,
    serviceFee: 2,
    products: [{ name: "Test Item", price: 10, quantity: 1 }],
    metadata: "{}",
  };

  const response = await fetch("https://checkout-api.north.com/public/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;

  const token =
    (payload.sessionToken as string) ||
    (payload.token as string) ||
    ((payload.data as Record<string, string> | undefined)?.sessionToken) || "";

  let jwtDecoded: Record<string, unknown> = {};
  try {
    if (token) {
      const parts = token.split(".");
      jwtDecoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    }
  } catch { /* ignore */ }

  return NextResponse.json({
    requestSentToNorth: requestBody,
    northHttpStatus: response.status,
    northRawResponse: payload,
    sessionTokenJwtDecoded: jwtDecoded,
  });
}
