import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first valid JSON array from a string.
 * Throws if not found or not valid.
 */
export function extractJsonArrayFromText(text: string): any[] {
  const match = text.match(/\[.*\]/s);
  if (!match) throw new Error("No valid JSON array found in text.");
  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error("Extracted text is not valid JSON array.");
  }
}
