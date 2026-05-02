// Serve the hex string exactly as North provided it — plain text, no decoding.
export async function GET() {
  const hex = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;
  if (!hex) {
    return new Response("Apple Pay not configured.", { status: 404 });
  }
  return new Response(hex, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
