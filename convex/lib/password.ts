import bcrypt from "bcryptjs";

const ROUNDS = 12;

/** Sync only — Convex mutations cannot use bcrypt's async API (setTimeout). */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function createSessionToken(): string {
  return crypto.randomUUID();
}

export function sessionExpiresAt(now = Date.now()): number {
  return now + 1000 * 60 * 60 * 24 * 7;
}
