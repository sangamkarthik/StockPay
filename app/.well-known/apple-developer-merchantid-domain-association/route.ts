export async function GET() {
  const hex = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;
  if (!hex) {
    return new Response("Apple Pay not configured.", { status: 404 });
  }
  const bytes = Buffer.from(hex, "hex");
  return new Response(bytes, {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
