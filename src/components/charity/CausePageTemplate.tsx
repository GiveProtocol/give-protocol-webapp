import React from "react";
import { GivingOptionsCard } from "@/components/web3/donation/GivingButtons";
import { HeroSection } from "@/components/ui/HeroSection";
import type { CauseProfileData } from "@/types/charity";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function ProjectDetailsCard({ cause }: {
  cause: CauseProfileData;
}): React.ReactElement {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Project Details
      </h2>
      <div>
        <p className="text-sm text-gray-500">Timeline</p>
        <p className="font-medium mb-3">{cause.timeline}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Location</p>
        <p className="font-medium mb-3">{cause.location}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Key Partners</p>
        <ul className="list-disc list-inside space-y-1">
          {cause.partners.map((partner) => (
            <li key={partner} className="text-gray-700">
              {partner}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ImpactHighlightsCard({ impact }: {
  impact: string[];
}): React.ReactElement {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Impact Highlights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {impact.map((item) => (
          <p key={item} className="flex items-start text-gray-700">
            <span className="w-2 h-2 mt-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

interface CausePageTemplateProps {
  /** The cause profile data to display */
  cause: CauseProfileData;
}

/**
 * Reusable template component for rendering cause/project detail pages.
 * Provides a consistent layout for all cause pages with:
 * - Hero section with image and basic info
 * - Donation buttons
 * - Project details (timeline, location, partners)
 * - Impact highlights
 *
 * Charities can use this template to create their own cause pages.
 * Each charity is limited to 3 active causes at any time.
 *
 * @param props - Component props containing cause data
 * @returns Rendered cause page
 *
 * @example
 * ```tsx
 * const causeData: CauseProfileData = {
 *   id: "1",
 *   name: "Clean Water Initiative",
 *   description: "Providing clean water access to rural communities",
 *   targetAmount: 50000,
 *   raisedAmount: 25000,
 *   charityId: "charity-1",
 *   category: "Water & Sanitation",
 *   image: "https://example.com/image.jpg",
 *   impact: ["Provided water to 10,000 people"],
 *   timeline: "2024-2025",
 *   location: "East Africa",
 *   partners: ["Partner Organization"]
 * };
 *
 * <CausePageTemplate cause={causeData} />
 * ```
 */
export const CausePageTemplate: React.FC<CausePageTemplateProps> = ({
  cause,
}) => {
  return (
    <>
      <HeroSection
        image={cause.image}
        title={cause.name}
        description={cause.description}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal direction="up" delay={100} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GivingOptionsCard heading="Support This Cause" charityName={cause.name} charityAddress={cause.charityId} />
          <ProjectDetailsCard cause={cause} />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <ImpactHighlightsCard impact={cause.impact} />
        </ScrollReveal>
      </main>
    </>
  );
};

export default CausePageTemplate;
