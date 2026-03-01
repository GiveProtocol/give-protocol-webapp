import React, { useCallback } from "react";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { ScheduledDonationButton } from "@/components/web3/donation/ScheduledDonationButton";
import { formatCurrency } from "@/utils/money";
import { CharityHeroSection } from "@/components/ui/CharityHeroSection";
import { OrganizationInfoSection } from "@/components/charity/OrganizationInfoSection";
import type { OrganizationProfile } from "@/types/charity";

/**
 * Data structure for charity profile information.
 * This interface defines all the information needed to render a charity page.
 */
export interface CharityProfileData {
  /** Unique identifier for the charity */
  id: string;
  /** Blockchain wallet address for receiving donations */
  walletAddress: string;
  /** Display name of the charity */
  name: string;
  /** Brief description of the charity's work */
  description: string;
  /** Category of the charity (e.g., "Education", "Environment") */
  category: string;
  /** URL to the charity's banner/hero image */
  image: string;
  /** Whether the charity has been verified */
  verified?: boolean;
  /** Country where the charity is based */
  country: string;
  /** Statistics about the charity's impact */
  stats: {
    /** Total amount donated in USD */
    totalDonated: number;
    /** Number of unique donors */
    donorCount: number;
    /** Number of completed projects */
    projectsCompleted: number;
  };
  /** The charity's mission statement */
  mission: string;
  /** List of impact highlights/achievements */
  impact: string[];
  /** Organization profile information (optional) */
  organizationProfile?: OrganizationProfile;
}

interface CharityPageTemplateProps {
  /** The charity profile data to display */
  charity: CharityProfileData;
}

/** Card displaying charity impact statistics (donations, donors, projects). */
function ImpactStatisticsCard({ stats }: { stats: CharityProfileData['stats'] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Statistics</h2>
      <dl className="grid grid-cols-3 gap-4 text-center">
        <div>
          <dt className="text-sm text-gray-500">Total Donated</dt>
          <dd className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalDonated)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Donors</dt>
          <dd className="text-xl font-bold text-gray-900 mt-1">{stats.donorCount}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Projects</dt>
          <dd className="text-xl font-bold text-gray-900 mt-1">{stats.projectsCompleted}</dd>
        </div>
      </dl>
    </div>
  );
}

const SYNE_BUTTON_STYLE: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
};

const SYNE_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
};

/** Card with one-time and monthly donation buttons. */
function GivingOptionsCard({ charityName, walletAddress }: { charityName: string; walletAddress: string }) {
  const renderGiveOnce = useCallback(
    ({ onClick }: { onClick: () => void }) => (
      <button
        onClick={onClick}
        className="w-full h-[58px] rounded-full bg-[#0d9f6e] hover:bg-[#0a8a5e] text-white flex items-center justify-center gap-2.5 uppercase transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9f6e] focus-visible:ring-offset-2"
        style={SYNE_BUTTON_STYLE}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[0.65rem] leading-none">&#9829;</span>
        Give Once
      </button>
    ),
    [],
  );

  const renderGiveMonthly = useCallback(
    ({ onClick }: { onClick: () => void }) => (
      <button
        onClick={onClick}
        className="w-full h-[58px] rounded-full bg-transparent border-[1.5px] border-black/[0.15] dark:border-white/[0.15] text-gray-900 dark:text-[#f2f0ec] hover:border-[#0d9f6e] hover:text-[#0d9f6e] dark:hover:border-[#0d9f6e] dark:hover:text-[#0d9f6e] flex items-center justify-center gap-2.5 uppercase transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9f6e] focus-visible:ring-offset-2"
        style={SYNE_BUTTON_STYLE}
      >
        <span className="w-5 h-5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center text-[0.65rem] leading-none">&#8635;</span>
        Give Monthly
      </button>
    ),
    [],
  );

  return (
    <div className="bg-white dark:bg-[#111110] p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f2f0ec] mb-4">Giving Options</h2>
      <div className="flex flex-col gap-4">
        <DonationButton charityName={charityName} charityAddress={walletAddress} renderTrigger={renderGiveOnce} />
        <ScheduledDonationButton charityName={charityName} charityAddress={walletAddress} renderTrigger={renderGiveMonthly} />
        <a
          href="https://docs.giveprotocol.io/docs/donors/making-donations/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[#0d9f6e] dark:text-[#2dd4a2] hover:opacity-80 mt-2 text-center uppercase"
          style={SYNE_LINK_STYLE}
        >
          Learn about giving options →
        </a>
      </div>
    </div>
  );
}

/** Card displaying the charity's mission statement. */
function MissionCard({ mission }: { mission: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
      <p className="text-gray-600">{mission}</p>
    </div>
  );
}

/** Card displaying charity impact highlights. */
function ImpactHighlightsCard({ impact }: { impact: string[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Highlights</h2>
      <ul className="space-y-2">
        {impact.map((item) => (
          <li key={item} className="flex items-center text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Reusable template component for rendering charity profile pages.
 * Provides a consistent layout for all charity pages with:
 * - Hero section with image and basic info
 * - Impact statistics
 * - Donation buttons (one-time and monthly)
 * - Mission statement
 * - Impact highlights
 *
 * @param props - Component props containing charity data
 * @returns Rendered charity page
 *
 * @example
 * ```tsx
 * const charityData: CharityProfileData = {
 *   id: "1",
 *   walletAddress: "0x...",
 *   name: "Example Charity",
 *   description: "Helping communities worldwide",
 *   category: "Community",
 *   image: "https://example.com/image.jpg",
 *   verified: true,
 *   country: "United States",
 *   stats: { totalDonated: 100000, donorCount: 500, projectsCompleted: 10 },
 *   mission: "Our mission is to help communities thrive.",
 *   impact: ["Helped 1000 families", "Built 5 community centers"]
 * };
 *
 * <CharityPageTemplate charity={charityData} />
 * ```
 */
export const CharityPageTemplate: React.FC<CharityPageTemplateProps> = ({
  charity,
}) => {
  return (
    <div>
      <CharityHeroSection
        image={charity.image}
        title={charity.name}
        description={charity.description}
        country={charity.country}
        verified={charity.verified}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImpactStatisticsCard stats={charity.stats} />
          <GivingOptionsCard charityName={charity.name} walletAddress={charity.walletAddress} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MissionCard mission={charity.mission} />
          <ImpactHighlightsCard impact={charity.impact} />
        </div>
        {charity.organizationProfile && (
          <OrganizationInfoSection
            profile={charity.organizationProfile}
            charityName={charity.name}
          />
        )}
      </main>
    </div>
  );
};

export default CharityPageTemplate;
