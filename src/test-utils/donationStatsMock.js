// Mock for contribution/DonationStats
// Renders stats in separate spans:
// - "Stats loaded" as exact text (GlobalContributions checks getByText("Stats loaded"))
// - {"totalDonated":N} as a closed JSON object (PersonalContributions checks regex)
// - "(personal)" label when isPersonal is true
export const DonationStats = ({ stats, isPersonal }) => (
  <div data-testid="donation-stats">
    {stats ? (
      <>
        <span>Stats loaded</span>
        <span>{JSON.stringify({ totalDonated: stats.totalDonated })}</span>
      </>
    ) : (
      <span>No stats</span>
    )}
    {isPersonal && <span>(personal)</span>}
  </div>
);
