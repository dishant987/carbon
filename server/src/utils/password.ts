import bcrypt from 'bcryptjs';

/** Salt rounds for bcrypt hashing */
const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 *
 * @param plaintext - The raw password string
 * @returns Bcrypt hash string
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plaintext, salt);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 *
 * @param plaintext - The raw password string to verify
 * @param hash - The stored bcrypt hash to compare against
 * @returns true if the password matches the hash
 */
export async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
