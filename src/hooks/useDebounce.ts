import { useState, useEffect } from "react";

/**
 * Debounce hook for delaying state updates until input stabilizes
 * @function useDebounce
 * @description Generic debounce hook that delays updating a value until it stops changing for a specified duration.
 * Useful for search inputs, API calls, and other scenarios where you want to wait for user input to stabilize.
 * @template T - The type of the value being debounced
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds before updating the debounced value
 * @returns {T} The debounced value that updates only after the delay period without changes
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // This will only run 500ms after user stops typing
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 *
 * return (
 *   <input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     placeholder="Search charities..."
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
