/**
 * IRS code-to-label mappings for Exempt Organizations data fields.
 * Used to translate numeric/letter codes from the IRS BMF into readable text.
 */

/** Deductibility codes from IRS BMF */
const DEDUCTIBILITY_MAP: Record<string, string> = {
  '1': 'Contributions are deductible',
  '2': 'Contributions are not deductible',
  '4': 'Contributions are deductible by treaty (foreign org)',
};

/** Filing requirement codes from IRS BMF */
const FILING_REQ_MAP: Record<string, string> = {
  '01': 'Form 990 (all other)',
  '02': 'Form 990 required (Section 4947(a)(1) trust)',
  '03': 'Form 990-PF required',
  '04': 'Form 990 required (Section 501(c)(3) exempt)',
  '06': 'Form 990-N (e-Postcard)',
  '07': 'Form 990 (Group return)',
  '13': 'No form required (church)',
  '14': 'No form required (government)',
  '00': 'Not required to file',
};

/** Asset range codes from IRS BMF */
const ASSET_RANGE_MAP: Record<string, string> = {
  '0': '$0 (none reported)',
  '1': '$1 – $9,999',
  '2': '$10,000 – $24,999',
  '3': '$25,000 – $99,999',
  '4': '$100,000 – $499,999',
  '5': '$500,000 – $999,999',
  '6': '$1M – $4.9M',
  '7': '$5M – $9.9M',
  '8': '$10M – $49.9M',
  '9': '$50M or more',
};

/** Income range codes from IRS BMF */
const INCOME_RANGE_MAP: Record<string, string> = {
  '0': '$0 (none reported)',
  '1': '$1 – $9,999',
  '2': '$10,000 – $24,999',
  '3': '$25,000 – $99,999',
  '4': '$100,000 – $499,999',
  '5': '$500,000 – $999,999',
  '6': '$1M – $4.9M',
  '7': '$5M – $9.9M',
  '8': '$10M – $49.9M',
  '9': '$50M or more',
};

/** Affiliation codes from IRS BMF */
const AFFILIATION_MAP: Record<string, string> = {
  '1': 'Central organization',
  '2': 'Intermediate organization',
  '3': 'Independent organization',
  '6': 'Central org (not filing group return)',
  '7': 'Intermediate org (parent has GEN)',
  '8': 'Central org (filing group return)',
  '9': 'Subordinate in group ruling',
};

/** Foundation codes from IRS BMF */
const FOUNDATION_MAP: Record<string, string> = {
  '00': 'Not classified',
  '02': 'Private operating foundation exempt',
  '03': 'Private operating foundation (other)',
  '04': 'Private non-operating foundation',
  '09': 'Suspense',
  '10': 'Church 170(b)(1)(A)(i)',
  '11': 'School 170(b)(1)(A)(ii)',
  '12': 'Hospital/medical research 170(b)(1)(A)(iii)',
  '13': 'Organization supporting gov. college 170(b)(1)(A)(iv)',
  '14': 'Governmental unit 170(b)(1)(A)(v)',
  '15': 'Public charity 170(b)(1)(A)(vi)',
  '16': 'Public charity 509(a)(2)',
  '17': 'Public charity 509(a)(3) supporting org',
  '18': 'Public charity 509(a)(4) testing for public safety',
  '21': 'Nationally/internationally supported 509(a)(1)',
  '22': 'Community/membership supported 509(a)(1)',
};

/**
 * Looks up a human-readable label for an IRS code field.
 * @param field - The IRS field name
 * @param code - The numeric/string code value
 * @returns The human-readable label, or the raw code if no match
 */
export function lookupIrsCode(
  field: 'deductibility' | 'filing_req' | 'asset_cd' | 'income_cd' | 'affiliation' | 'foundation',
  code: string | null | undefined,
): string {
  if (!code) return '—';

  const trimmed = code.trim();
  const maps: Record<string, Record<string, string>> = {
    deductibility: DEDUCTIBILITY_MAP,
    filing_req: FILING_REQ_MAP,
    asset_cd: ASSET_RANGE_MAP,
    income_cd: INCOME_RANGE_MAP,
    affiliation: AFFILIATION_MAP,
    foundation: FOUNDATION_MAP,
  };

  return maps[field]?.[trimmed] ?? trimmed;
}

/**
 * Formats an IRS ruling date code (YYYYMM) as a 4-digit year.
 * @param ruling - The ruling code from IRS BMF (e.g. "199201")
 * @returns The 4-digit year string, or "—" if missing
 */
export function formatRulingYear(ruling: string | null | undefined): string {
  if (!ruling || ruling.length < 4) return '—';
  return ruling.substring(0, 4);
}

/**
 * Formats IRS activity codes into a comma-separated readable list.
 * Activity codes are stored as a 9-digit string (three 3-digit codes).
 * @param activity - The activity code string
 * @returns Comma-separated code list, or "—" if none
 */
export function formatActivityCodes(activity: string | null | undefined): string {
  if (!activity || activity === '000000000') return '—';
  const codes: string[] = [];
  for (let i = 0; i < activity.length; i += 3) {
    const code = activity.substring(i, i + 3);
    if (code !== '000') {
      codes.push(code);
    }
  }
  return codes.length > 0 ? codes.join(', ') : '—';
}
