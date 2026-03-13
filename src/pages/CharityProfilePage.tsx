import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  Lock,
  Users,
  Heart,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/charity/StatusBadge";
import { getCharityProfileByEin } from "@/services/charityProfileService";
import type {
  CharityProfile,
  CharityProfileStatus,
} from "@/types/charityProfile";

/* ------------------------------------------------------------------ */
/* Sub-components (private to this file)                               */
/* ------------------------------------------------------------------ */

function UnclaimedBanner({ nominationsCount }: { nominationsCount: number }) {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
      <AlertTriangle
        aria-hidden="true"
        className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
      />
      <div className="text-sm text-amber-800">
        <p className="font-medium">This profile has not been claimed.</p>
        <p className="mt-1">
          Information sourced from IRS public records.
          {nominationsCount > 0 &&
            ` ${nominationsCount} donor${nominationsCount === 1 ? " has" : "s have"} nominated this charity.`}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            disabled
            title="Coming soon in Phase 2"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-200 text-amber-500 cursor-not-allowed"
          >
            Nominate
          </button>
          <button
            type="button"
            disabled
            title="Coming soon in Phase 2"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-200 text-amber-500 cursor-not-allowed"
          >
            Claim This Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ClaimedPendingBanner component that displays a banner indicating pending claim verification.
 *
 * @returns {JSX.Element} A banner showing that claim verification is in progress.
 */
function ClaimedPendingBanner() {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
      <Clock
        aria-hidden="true"
        className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
      />
      <p className="text-sm text-blue-800">
        Claim verification in progress — usually 24–48 hours.
      </p>
    </div>
  );
}

/**
 * Renders the header section for a charity profile page.
 *
 * @param {{profile: CharityProfile}} props - The props containing charity profile data.
 * @param {CharityProfile} props.profile - The charity profile to display.
 * @returns {JSX.Element} The rendered profile header component.
 */
function ProfileHeader({ profile }: { profile: CharityProfile }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          {profile.name}
        </h1>
        <StatusBadge status={profile.status} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {profile.location && (
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-4 w-4 text-gray-400" />
            {profile.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Building2 aria-hidden="true" className="h-4 w-4 text-gray-400" />
          EIN: {profile.ein}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays IRS-related information for a charity in a styled card.
 *
 * @param {Object} props - The component props.
 * @param {CharityProfile} props.profile - The charity's IRS profile data.
 * @returns {JSX.Element} A card component showing IRS data fields.
 */
function IrsDataCard({ profile }: { profile: CharityProfile }) {
  const rows: Array<{ label: string; value: string | number | null }> = [
    { label: "NTEE Code", value: profile.ntee_code },
    { label: "Employees", value: profile.employees },
    { label: "Tax Status", value: profile.irs_status },
    { label: "EIN", value: profile.ein },
  ];

  return (
    <Card hover={false} className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">IRS Data</h3>
      <dl className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className="text-gray-500">{row.label}</dt>
            <dd className="text-gray-900 font-medium">{row.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/**
 * Renders the content for a locked tab.
 *
 * @param {string} message - The message to display under the lock icon.
 * @returns {JSX.Element} The rendered card component with a lock icon and provided message.
 */
function LockedTabContent({ message }: { message: string }) {
  return (
    <Card hover={false} className="p-8 text-center">
      <Lock aria-hidden="true" className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </Card>
  );
}

/**
 * Renders a placeholder in the sidebar with an icon and a message.
 *
 * @param {React.ReactNode} icon - The icon to display in the placeholder.
 * @param {string} message - The message to display in the placeholder.
 * @returns {JSX.Element} The sidebar placeholder component.
 */
function SidebarPlaceholder({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <Card hover={false} className="p-5 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{message}</p>
    </Card>
  );
}

/**
 * Returns messages for the financials and volunteers tabs based on the profile's status.
 *
 * @param {CharityProfileStatus} status - The current status of the charity profile.
 * @returns {{ financials: string; volunteers: string }} An object containing tab messages for each section.
 */
function getTabMessages(status: CharityProfileStatus) {
  if (status === "unclaimed") {
    return {
      financials:
        "Financial data will be available once this profile is claimed and verified.",
      volunteers:
        "Volunteer opportunities will be available once this profile is claimed and verified.",
    };
  }
  if (status === "claimed-pending") {
    return {
      financials: "Coming soon once verified.",
      volunteers: "Coming soon once verified.",
    };
  }
  return {
    financials: "Coming soon.",
    volunteers: "Coming soon.",
  };
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Charity profile page that displays unclaimed, claimed-pending, or verified states.
 * Fetches the profile via get_or_create_charity_profile RPC using the EIN from the URL.
 * @returns The rendered charity profile page
 */
function CharityProfilePage() {
  const { ein } = useParams<{ ein: string }>();
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!ein) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const result = await getCharityProfileByEin(ein);
    if (result) {
      setProfile(result);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [ein]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card hover={false} className="p-8 text-center">
          <Building2
            aria-hidden="true"
            className="h-10 w-10 text-gray-300 mx-auto mb-4"
          />
          <p className="text-gray-600">
            We couldn&apos;t find a charity with this EIN.
          </p>
        </Card>
      </div>
    );
  }

  const tabMessages = getTabMessages(profile.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Status banners */}
      {profile.status === "unclaimed" && (
        <UnclaimedBanner nominationsCount={profile.nominations_count} />
      )}
      {profile.status === "claimed-pending" && <ClaimedPendingBanner />}

      {/* Profile header */}
      <ProfileHeader profile={profile} />

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="space-y-4 mt-4">
                {/* Mission */}
                <Card hover={false} className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Mission
                  </h3>
                  <p className="text-sm text-gray-600">
                    {profile.mission || "No mission statement available."}
                  </p>
                </Card>

                {/* IRS data */}
                <IrsDataCard profile={profile} />

                {/* Social proof */}
                <Card hover={false} className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Community Interest
                  </h3>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users
                        aria-hidden="true"
                        className="h-4 w-4 text-gray-400"
                      />
                      <span>
                        {profile.nominations_count} nomination
                        {profile.nominations_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart
                        aria-hidden="true"
                        className="h-4 w-4 text-gray-400"
                      />
                      <span>
                        {profile.interested_donors_count} interested donor
                        {profile.interested_donors_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financials">
              <div className="mt-4">
                <LockedTabContent message={tabMessages.financials} />
              </div>
            </TabsContent>

            <TabsContent value="volunteers">
              <div className="mt-4">
                <LockedTabContent message={tabMessages.volunteers} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SidebarPlaceholder
            icon={
              <Heart aria-hidden="true" className="h-6 w-6 text-gray-300" />
            }
            message="Donation features coming soon."
          />
          <SidebarPlaceholder
            icon={
              <Users aria-hidden="true" className="h-6 w-6 text-gray-300" />
            }
            message="Nomination features coming soon."
          />
          {profile.status === "unclaimed" && (
            <SidebarPlaceholder
              icon={
                <Building2
                  aria-hidden="true"
                  className="h-6 w-6 text-gray-300"
                />
              }
              message="Are you an authorized representative? Claim this profile to unlock all features."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CharityProfilePage;
