// North provides this hex string from their dashboard under Checkout Designer → Apple Pay → Domain Verification.
// Add it as APPLE_PAY_DOMAIN_ASSOCIATION in your Vercel env vars.
export async function GET() {
  const content = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;
  if (!content) {
    return new Response("Apple Pay not configured.", { status: 404 });
  }
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
