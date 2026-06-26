import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plaintext, hash);
}

export function stripSensitive<T extends { cafePassword?: string }>(obj: T): Omit<T, "cafePassword"> {
  const { cafePassword: _, ...rest } = obj;
  return rest as Omit<T, "cafePassword">;
}
