import slugifyLib from "slugify";
import { generateShortId } from "./id";

/**
 * Generate a URL-friendly slug from text
 * @param text - Text to slugify
 * @param options - Slugify options
 */
export function generateSlug(
  text: string,
  options?: {
    lowercase?: boolean;
    strict?: boolean;
    maxLength?: number;
  }
): string {
  const { lowercase = true, strict = true, maxLength = 100 } = options || {};

  let slug = slugifyLib(text, {
    lower: lowercase,
    strict,
    trim: true,
  });

  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing hyphen if exists
    if (slug.endsWith("-")) {
      slug = slug.slice(0, -1);
    }
  }

  return slug;
}

/**
 * Generate a unique slug with a random suffix
 * @param text - Text to slugify
 * @param suffixLength - Length of the random suffix (default: 6)
 */
export function generateUniqueSlug(text: string, suffixLength = 6): string {
  const baseSlug = generateSlug(text, { maxLength: 90 });
  const suffix = generateShortId(suffixLength);
  return `${baseSlug}-${suffix}`;
}
