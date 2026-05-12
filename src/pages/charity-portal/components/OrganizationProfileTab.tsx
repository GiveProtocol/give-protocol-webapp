import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";
import { OrganizationProfileForm } from "./OrganizationProfileForm";
import { LogoBannerUploadCard } from "@/components/charity/LogoBannerUploadCard";
import type { OrganizationProfile } from "@/types/charity";

interface CharityProfileSnapshot {
  ein: string;
  logoUrl: string | null;
  bannerImageUrl: string | null;
  claimedByUserId: string | null;
}

interface OrganizationProfileTabProps {
  profileId: string;
  /** Called with the new URL when a logo is successfully uploaded or removed */
  onLogoUploaded?: (_url: string | null) => void;
  /** Called with the new URL when a banner is successfully uploaded or removed */
  onBannerUploaded?: (_url: string | null) => void;
}

/** Tab panel for viewing and editing the organization's public profile. */
export const OrganizationProfileTab: React.FC<OrganizationProfileTabProps> = ({
  profileId,
  onLogoUploaded,
  onBannerUploaded,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [charityProfile, setCharityProfile] =
    useState<CharityProfileSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /** Loads the organization profile metadata from Supabase. */
    const fetchProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("meta")
          .eq("id", profileId)
          .single();

        if (fetchError) throw fetchError;

        const meta = data?.meta as OrganizationProfile | null;
        setProfile(meta || {});
      } catch (err) {
        Logger.error("Error fetching organization profile", { error: err });
        setError(
          t("organization.loadError", "Failed to load organization profile"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, t]);

  useEffect(() => {
    if (!user?.id) return;

    /** Fetches the charity_profiles row claimed by the current user. */
    const fetchCharityProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("charity_profiles")
          .select("ein, logo_url, banner_image_url, claimed_by")
          .eq("claimed_by", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setCharityProfile({
            ein: data.ein,
            logoUrl: data.logo_url ?? null,
            bannerImageUrl: data.banner_image_url ?? null,
            claimedByUserId: data.claimed_by ?? null,
          });
        }
      } catch (err) {
        Logger.error("Error fetching charity profile for upload card", {
          error: err,
        });
      }
    };

    fetchCharityProfile();
  }, [user?.id]);

  const handleLogoUploaded = useCallback((url: string | null) => {
    setCharityProfile((prev) =>
      prev ? { ...prev, logoUrl: url } : prev,
    );
  }, []);

  const handleBannerUploaded = useCallback((url: string | null) => {
    setCharityProfile((prev) =>
      prev ? { ...prev, bannerImageUrl: url } : prev,
    );
  }, []);

  const handleSave = useCallback(
    async (data: OrganizationProfile) => {
      setSaving(true);
      setError(null);
      setSuccess(false);

      try {
        // Fetch current meta to merge with new data
        const { data: currentProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("meta")
          .eq("id", profileId)
          .single();

        if (fetchError) throw fetchError;

        const currentMeta = (currentProfile?.meta || {}) as Record<
          string,
          unknown
        >;
        const updatedMeta = {
          ...currentMeta,
          yearFounded: data.yearFounded,
          address: data.address,
          contact: data.contact,
          socialLinks: data.socialLinks,
        };

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ meta: updatedMeta })
          .eq("id", profileId);

        if (updateError) throw updateError;

        setProfile(data);
        setSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        Logger.error("Error saving organization profile", { error: err });
        setError(
          t("organization.saveError", "Failed to save organization profile"),
        );
      } finally {
        setSaving(false);
      }
    },
    [profileId, t],
  );

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-64 mt-2 animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="organization-profile" className="mb-8 scroll-mt-24">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2
              className="h-5 w-5 text-emerald-600"
              aria-hidden="true"
            />
            {t("organization.profile", "Organization Profile")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "organization.profileDescription",
              "Manage your organization's public information",
            )}
          </p>
        </div>
      </div>

      {charityProfile !== null && (
        <div className="mb-6">
          <LogoBannerUploadCard
            ein={charityProfile.ein}
            logoUrl={charityProfile.logoUrl}
            bannerImageUrl={charityProfile.bannerImageUrl}
            claimedByUserId={charityProfile.claimedByUserId}
            onLogoUploaded={handleLogoUploaded}
            onBannerUploaded={handleBannerUploaded}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 text-red-600 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <output className="mb-4 p-3 bg-green-50 text-green-600 rounded-md block">
            {t(
              "organization.saveSuccess",
              "Organization profile saved successfully",
            )}
          </output>
        )}

        <OrganizationProfileForm
          initialData={profile}
          onSave={handleSave}
          loading={saving}
        />
      </div>
    </div>
  );
};

export default OrganizationProfileTab;
