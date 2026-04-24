interface DonationEntry {
  date: string;
}

/**
 * Pure helper that computes the consecutive-month giving streak ending at the given reference
 * month. Exported for unit testing; the hook wrapper below reads `donations` from useDonorData.
 */
export function computeGivingStreak(
  donations: DonationEntry[],
  reference: Date = new Date(),
): number {
  if (donations.length === 0) return 0;

  const monthKeys = new Set<string>();
  for (const donation of donations) {
    const parsed = new Date(donation.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = `${parsed.getUTCFullYear()}-${parsed.getUTCMonth()}`;
    monthKeys.add(key);
  }

  let streak = 0;
  const cursor = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1),
  );
  while (monthKeys.has(`${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}`)) {
    streak += 1;
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
  }

  return streak;
}

/**
 * Returns the donor's current consecutive-month giving streak derived from their donation history.
 */
export function useGivingStreak(
  donations: DonationEntry[] | undefined,
): number {
  if (!donations) return 0;
  return computeGivingStreak(donations);
}
