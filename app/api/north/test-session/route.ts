import { NextResponse } from "next/server";

const NORTH_API_BASE = "https://checkout.north.com";

async function fetchWithRetry(url: string, options: RequestInit, retries = 4, delayMs = 300): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException }).cause?.code;
      if (code === "ENOTFOUND" && i < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

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
    products: [],
    metadata: "{}",
  };

  try {
    const response = await fetchWithRetry(
      `${NORTH_API_BASE}/api/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${privateKey}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

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
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
