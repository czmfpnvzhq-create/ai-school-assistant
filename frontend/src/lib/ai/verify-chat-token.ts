import { jwtVerify } from "jose";

export interface ChatUserPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_key"
);

export async function verifyChatToken(
  authHeader: string | null
): Promise<ChatUserPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const id = Number(payload.id);
    const name = String(payload.name ?? "");
    const email = String(payload.email ?? "");
    const role = String(payload.role ?? "");
    if (!id || !name || !role) return null;
    return { id, name, email, role };
  } catch {
    return null;
  }
}
