import { SignJWT, jwtVerify } from 'jose';

const STATE_SECRET = new TextEncoder().encode(
  process.env.STATE_SIGNING_SECRET || 'your-secret-key-min-32-chars-CHANGE-IN-PRODUCTION'
);

export async function signStateToken(data: { org_id: string }): Promise<string> {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m') // 5 minute expiry
    .sign(STATE_SECRET);
}

export async function verifyStateToken(token: string): Promise<{ org_id: string }> {
  try {
    const { payload } = await jwtVerify(token, STATE_SECRET);
    return payload as { org_id: string };
  } catch (error) {
    throw new Error('Invalid or expired state token');
  }
}
