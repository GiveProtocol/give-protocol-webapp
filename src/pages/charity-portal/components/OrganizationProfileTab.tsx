import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";
import { OrganizationProfileForm } from "./OrganizationProfileForm";
import type { OrganizationProfile } from "@/types/charity";

interface OrganizationProfileTabProps {
  profileId: string;
}

export const OrganizationProfileTab: React.FC<OrganizationProfileTabProps> = ({
  profileId,
}) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
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
          <div
            className="mb-4 p-3 bg-green-50 text-green-600 rounded-md"
            role="status"
          >
            {t(
              "organization.saveSuccess",
              "Organization profile saved successfully",
            )}
          </div>
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
