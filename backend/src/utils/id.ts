import { nanoid } from "nanoid";

/**
 * Generate a unique ID using nanoid
 * @param length - Length of the ID (default: 21)
 */
export function generateId(length = 21): string {
  return nanoid(length);
}

/**
 * Generate a short unique ID
 * @param length - Length of the ID (default: 10)
 */
export function generateShortId(length = 10): string {
  return nanoid(length);
}

/**
 * Generate a prefixed ID (e.g., "usr_abc123")
 * @param prefix - Prefix for the ID
 * @param length - Length of the random part (default: 12)
 */
export function generatePrefixedId(prefix: string, length = 12): string {
  return `${prefix}_${nanoid(length)}`;
}
