import React from "react";
import { Award, Clock, Users, Globe } from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import {
  VolunteerOpportunity,
  CommitmentType,
  OpportunityType,
  WorkLanguage,
} from "@/types/volunteer";

/**
 * Extended volunteer opportunity data for the detail page template.
 * Extends the base VolunteerOpportunity with additional display fields.
 */
export interface VolunteerOpportunityProfileData
  extends Omit<VolunteerOpportunity, "status" | "createdAt" | "updatedAt"> {
  /** Organization name for display */
  organization: string;
  /** Image URL for the hero section */
  image: string;
  /** Detailed responsibilities for the role */
  responsibilities?: string[];
  /** Requirements or qualifications */
  requirements?: string[];
  /** Benefits of volunteering */
  benefits?: string[];
  /** Contact email for questions */
  contactEmail?: string;
}

interface VolunteerOpportunityTemplateProps {
  /** The volunteer opportunity data to display */
  opportunity: VolunteerOpportunityProfileData;
  /** Callback when user clicks apply */
  onApply?: () => void;
}

/**
 * Formats commitment type for display
 */
const formatCommitment = (commitment: CommitmentType): string => {
  switch (commitment) {
    case CommitmentType._ONE_TIME:
      return "One-time";
    case CommitmentType._SHORT_TERM:
      return "Short-term";
    case CommitmentType._LONG_TERM:
      return "Long-term";
    default:
      return String(commitment);
  }
};

/**
 * Formats opportunity type for display
 */
const formatType = (type: OpportunityType): string => {
  switch (type) {
    case OpportunityType._ONSITE:
      return "Onsite";
    case OpportunityType._REMOTE:
      return "Remote";
    case OpportunityType._HYBRID:
      return "Hybrid";
    default:
      return String(type);
  }
};

/**
 * Formats work language for display
 */
const formatLanguageName = (language: WorkLanguage | string): string => {
  return String(language)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Reusable template component for rendering volunteer opportunity detail pages.
 * Provides a consistent layout for all opportunity pages with:
 * - Hero section with image and basic info
 * - Opportunity details (commitment, location, type, language)
 * - Required skills
 * - Responsibilities and requirements
 * - Apply button
 *
 * Charities can use this template to create their own opportunity pages.
 * Each charity is limited to 3 active opportunities at any time.
 *
 * @param props - Component props containing opportunity data
 * @returns Rendered volunteer opportunity page
 *
 * @example
 * ```tsx
 * const opportunityData: VolunteerOpportunityProfileData = {
 *   id: "uuid-here",
 *   charityId: "charity-uuid",
 *   title: "Web Developer",
 *   organization: "Education Initiative",
 *   description: "Help build an educational platform",
 *   skills: ["React", "TypeScript"],
 *   commitment: CommitmentType._SHORT_TERM,
 *   location: "Remote",
 *   type: OpportunityType._REMOTE,
 *   workLanguage: WorkLanguage.ENGLISH,
 *   image: "https://example.com/image.jpg",
 *   responsibilities: ["Build new features", "Fix bugs"],
 *   requirements: ["2+ years React experience"],
 *   benefits: ["Make a difference", "Flexible hours"]
 * };
 *
 * <VolunteerOpportunityTemplate
 *   opportunity={opportunityData}
 *   onApply={() => console.log('Applied!')}
 * />
 * ```
 */
export const VolunteerOpportunityTemplate: React.FC<
  VolunteerOpportunityTemplateProps
> = ({ opportunity, onApply }) => {
  return (
    <>
      <HeroSection
        image={opportunity.image}
        title={opportunity.title}
        description={opportunity.description}
      >
        <span className="text-sm font-medium text-indigo-300 mb-2">
          {opportunity.organization}
        </span>
      </HeroSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Opportunity Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-indigo-500" />
                <span className="text-sm text-gray-500 w-24">Commitment:</span>
                <span>{formatCommitment(opportunity.commitment)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-3 text-indigo-500" />
                <span className="text-sm text-gray-500 w-24">Location:</span>
                <span>{opportunity.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Globe className="h-5 w-5 mr-3 text-indigo-500" />
                <span className="text-sm text-gray-500 w-24">Type:</span>
                <span>{formatType(opportunity.type)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Globe className="h-5 w-5 mr-3 text-indigo-500" />
                <span className="text-sm text-gray-500 w-24">Language:</span>
                <span>{formatLanguageName(opportunity.workLanguage)}</span>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Apply for This Opportunity
            </h2>
            <p className="text-gray-600">
              Join {opportunity.organization} and make a difference with your
              skills. This {formatType(opportunity.type).toLowerCase()} position
              requires a {formatCommitment(opportunity.commitment).toLowerCase()}{" "}
              commitment.
            </p>
            {opportunity.contactEmail && (
              <p className="text-sm text-gray-500">
                Questions? Contact us at{" "}
                <a
                  href={`mailto:${opportunity.contactEmail}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {opportunity.contactEmail}
                </a>
              </p>
            )}
            <button
              onClick={onApply}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Apply Now
            </button>
          </div>
        </div>

        {(opportunity.responsibilities?.length ?? 0) > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Responsibilities
            </h2>
            <ul className="space-y-2">
              {opportunity.responsibilities?.map((item) => (
                <li key={item} className="flex items-start text-gray-700">
                  <span className="w-2 h-2 mt-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(opportunity.requirements?.length ?? 0) > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <ul className="space-y-2">
              {opportunity.requirements?.map((item) => (
                <li key={item} className="flex items-start text-gray-700">
                  <span className="w-2 h-2 mt-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(opportunity.benefits?.length ?? 0) > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunity.benefits?.map((item) => (
                <p key={item} className="flex items-start text-gray-700">
                  <span className="w-2 h-2 mt-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VolunteerOpportunityTemplate;
