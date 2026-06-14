import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts via tailwind-merge.
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a readable string with units.
 * @param kg - CO2 value in kilograms
 * @returns Formatted string like "12.5 kg CO₂"
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes CO₂`;
  }
  return `${kg.toFixed(2)} kg CO₂`;
}

/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}
