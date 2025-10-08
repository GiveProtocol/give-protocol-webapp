import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values and resolves Tailwind CSS conflicts.
 * Uses clsx for conditional classes and tailwind-merge for conflict resolution.
 *
 * @function cn
 * @param {...ClassValue[]} inputs - Class values to combine (strings, objects, arrays)
 * @returns {string} Merged and conflict-resolved class string
 * @example
 * ```typescript
 * // Basic usage
 * cn('text-red-500', 'bg-blue-100') // 'text-red-500 bg-blue-100'
 *
 * // Conditional classes
 * cn('base-class', { 'active-class': isActive, 'disabled-class': !isEnabled })
 *
 * // Tailwind conflict resolution
 * cn('text-red-500', 'text-blue-500') // 'text-blue-500' (last wins)
 *
 * // Array input
 * cn(['class1', 'class2'], { 'conditional': true })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
