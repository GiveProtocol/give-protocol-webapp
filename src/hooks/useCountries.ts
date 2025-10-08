interface Country {
  code: string;
  name: string;
}

/**
 * Countries data hook for accessing country code and name mappings
 * @function useCountries
 * @description Provides a static list of countries with ISO country codes and display names.
 * Currently includes a basic set of countries that can be extended as needed for international charity operations.
 * @returns {Object} Countries data object
 * @returns {Country[]} returns.countries - Array of country objects with 'code' (ISO country code) and 'name' (display name) properties
 * @example
 * ```tsx
 * const { countries } = useCountries();
 *
 * return (
 *   <select>
 *     <option value="">Select Country</option>
 *     {countries.map(country => (
 *       <option key={country.code} value={country.code}>
 *         {country.name}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useCountries() {
  const countries: Country[] = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    // Add more countries as needed
  ];

  return { countries };
}
