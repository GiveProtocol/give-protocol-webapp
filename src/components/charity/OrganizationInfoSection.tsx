import React, { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import type { OrganizationProfile } from "@/types/charity";

interface OrganizationInfoSectionProps {
  profile: OrganizationProfile | null;
  charityName: string;
}

/**
 * Social media icon component
 */
const SocialIcon: React.FC<{
  platform: "twitter" | "facebook" | "linkedin" | "instagram";
}> = ({ platform }) => {
  const iconClass = "h-5 w-5";

  switch (platform) {
    case "twitter":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

export const OrganizationInfoSection: React.FC<OrganizationInfoSectionProps> =
  ({ profile, charityName }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    // Check if there's any data to display
    const hasData = useMemo(() => {
      if (!profile) return false;
      return Boolean(
        profile.yearFounded ||
          profile.address?.street ||
          profile.address?.city ||
          profile.contact?.phone ||
          profile.contact?.email ||
          profile.contact?.website ||
          profile.socialLinks?.twitter ||
          profile.socialLinks?.facebook ||
          profile.socialLinks?.linkedin ||
          profile.socialLinks?.instagram,
      );
    }, [profile]);

    const formattedAddress = useMemo((): string | null => {
      if (!profile?.address) return null;

      const addr = profile.address;
      const parts = [
        addr.street,
        addr.city,
        addr.stateProvince,
        addr.postalCode,
        addr.country,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(", ") : null;
    }, [profile?.address]);

    if (!hasData) {
      return null;
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg -m-2 p-2"
          aria-expanded={isExpanded}
          aria-controls="organization-info-content"
        >
          <div className="flex items-center gap-2">
            <Building2
              className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Find out more about {charityName}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          )}
        </button>

        {isExpanded && (
          <div
            id="organization-info-content"
            className="mt-6 space-y-6"
          >
            {/* Year Founded */}
            {profile?.yearFounded && (
              <div className="flex items-start gap-3">
                <Calendar
                  className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Founded
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {profile.yearFounded}
                  </dd>
                </div>
              </div>
            )}

            {/* Address */}
            {formattedAddress && (
              <div className="flex items-start gap-3">
                <MapPin
                  className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Address
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {formattedAddress}
                  </dd>
                </div>
              </div>
            )}

            {/* Contact Info */}
            {(profile?.contact?.phone ||
              profile?.contact?.email ||
              profile?.contact?.website) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.contact?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone
                      className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </dt>
                      <dd>
                        <a
                          href={`tel:${profile.contact.phone}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          {profile.contact.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {profile?.contact?.email && (
                  <div className="flex items-start gap-3">
                    <Mail
                      className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </dt>
                      <dd>
                        <a
                          href={`mailto:${profile.contact.email}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          {profile.contact.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {profile?.contact?.website && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Globe
                      className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Website
                      </dt>
                      <dd>
                        <a
                          href={profile.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          {profile.contact.website}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {(profile?.socialLinks?.twitter ||
              profile?.socialLinks?.facebook ||
              profile?.socialLinks?.linkedin ||
              profile?.socialLinks?.instagram) && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Social Media
                </dt>
                <dd className="flex flex-wrap gap-4">
                  {profile?.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label="Twitter/X"
                    >
                      <SocialIcon platform="twitter" />
                      <span className="text-sm">Twitter/X</span>
                    </a>
                  )}
                  {profile?.socialLinks?.facebook && (
                    <a
                      href={profile.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label="Facebook"
                    >
                      <SocialIcon platform="facebook" />
                      <span className="text-sm">Facebook</span>
                    </a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <SocialIcon platform="linkedin" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  {profile?.socialLinks?.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      aria-label="Instagram"
                    >
                      <SocialIcon platform="instagram" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                </dd>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

export default OrganizationInfoSection;
