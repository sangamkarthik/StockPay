import { createHmac } from "crypto";

function base64url(data: string) {
  return Buffer.from(data).toString("base64url");
}

export function makeDoorDashJWT(developerId: string, keyId: string, signingSecret: string) {
  const header = base64url(
    JSON.stringify({ alg: "HS256", typ: "JWT", kid: keyId, "dd-ver": "DD-JWT-V1" }),
  );
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ iss: developerId, sub: keyId, kid: keyId, aud: "doordash", exp: now + 300, iat: now }),
  );
  const input = `${header}.${payload}`;
  const secretBuf = Buffer.from(signingSecret, "base64url");
  const sig = createHmac("sha256", secretBuf).update(input).digest("base64url");
  return `${input}.${sig}`;
}
