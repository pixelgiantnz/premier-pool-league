import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function createSessionToken(): string {
  return crypto.randomUUID();
}

export function sessionExpiresAt(now = Date.now()): number {
  return now + 1000 * 60 * 60 * 24 * 7;
}
