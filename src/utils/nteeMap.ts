/**
 * NTEE (National Taxonomy of Exempt Entities) code prefix to category name lookup.
 * Maps the letter prefix of an NTEE code to a human-readable category.
 * @see https://nccs.urban.org/publication/irs-activity-codes
 */
const NTEE_PREFIX_MAP: Record<string, string> = {
  A: 'Arts, Culture & Humanities',
  B: 'Education',
  C: 'Environment',
  D: 'Animal-Related',
  E: 'Health Care',
  F: 'Mental Health & Crisis Intervention',
  G: 'Voluntary Health Associations & Medical Disciplines',
  H: 'Medical Research',
  I: 'Crime & Legal-Related',
  J: 'Employment',
  K: 'Food, Agriculture & Nutrition',
  L: 'Housing & Shelter',
  M: 'Public Safety, Disaster Preparedness & Relief',
  N: 'Recreation & Sports',
  O: 'Youth Development',
  P: 'Human Services',
  Q: 'International, Foreign Affairs & National Security',
  R: 'Civil Rights, Social Action & Advocacy',
  S: 'Community Improvement & Capacity Building',
  T: 'Philanthropy, Voluntarism & Grantmaking Foundations',
  U: 'Science & Technology',
  V: 'Social Science',
  W: 'Public & Societal Benefit',
  X: 'Religion-Related',
  Y: 'Mutual & Membership Benefit',
  Z: 'Unknown',
};

/**
 * Looks up a human-readable category name for an NTEE code.
 * @param nteeCode - The full NTEE code (e.g. "B20", "E12")
 * @returns The category name, or the original code if no match
 */
export function getNteeCategory(nteeCode: string | null | undefined): string {
  if (!nteeCode) return 'Unknown';
  const prefix = nteeCode.charAt(0).toUpperCase();
  return NTEE_PREFIX_MAP[prefix] ?? nteeCode;
}

/**
 * Returns both the code and its category label for display.
 * @param nteeCode - The full NTEE code
 * @returns Formatted string like "B20 — Education"
 */
export function formatNteeCode(nteeCode: string | null | undefined): string {
  if (!nteeCode) return '—';
  const category = getNteeCategory(nteeCode);
  return `${nteeCode} — ${category}`;
}
