import React from "react";
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Impact Statistics
            </h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <div>
                <dt className="text-sm text-gray-500">Total Donated</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(charity.stats.totalDonated)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Donors</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.donorCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Projects</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.projectsCompleted}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Giving Options
            </h2>
            <div className="space-y-4">
              <DonationButton
                charityName={charity.name}
                charityAddress={charity.walletAddress}
                buttonText="Give Once"
              />
              <ScheduledDonationButton
                charityName={charity.name}
                charityAddress={charity.walletAddress}
                buttonText="Give Monthly"
              />
              <a
                href="https://docs.giveprotocol.io/user-guides/donors/#giving-options"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-indigo-600 hover:text-indigo-800 mt-2 text-center"
              >
                Learn about the difference in giving options →
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600">{charity.mission}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Impact Highlights
            </h2>
            <ul className="space-y-2">
              {charity.impact.map((item) => (
                <li key={item} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Organization Info Section */}
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
