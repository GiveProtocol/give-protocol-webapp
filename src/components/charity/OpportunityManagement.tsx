import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OpportunityForm } from "@/components/volunteer/OpportunityForm";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { WorkLanguage } from "@/types/volunteer";

interface OpportunityCardProps {
  opportunity: Opportunity;
  t: (_key: string, _fallback?: string) => string;
  formatLanguageName: (_language: string) => string;
}

/**
 * Card component displaying volunteer opportunity details
 * @param opportunity - The volunteer opportunity data
 * @param t - Translation function
 * @param formatLanguageName - Function to format language names
 */
const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  t,
  formatLanguageName,
}) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-medium text-gray-900 flex-grow">
        {opportunity.title}
      </h3>
      <div className="flex space-x-2 ml-4">
        <Button variant="secondary" size="sm" className="flex items-center">
          <Edit className="h-4 w-4 mr-1" />
          {t("common.edit", "Edit")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {t("common.delete", "Delete")}
        </Button>
      </div>
    </div>

    <div className="flex items-center mb-2 text-sm text-gray-500">
      <Globe className="h-4 w-4 mr-1" />
      <span>
        {t(
          `language.${opportunity.work_language}`,
          formatLanguageName(opportunity.work_language),
        )}
      </span>
    </div>

    <p className="mb-3 text-gray-600">{opportunity.description}</p>

    <div className="mb-4 flex flex-wrap gap-2">
      {opportunity.skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          {skill}
        </span>
      ))}
    </div>

    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
      <span>
        <span className="font-medium">
          {t("volunteer.commitment", "Commitment")}:
        </span>{" "}
        {opportunity.commitment}
      </span>
      <span>
        <span className="font-medium">
          {t("volunteer.location", "Location")}:
        </span>{" "}
        {opportunity.location}
      </span>
      <span>
        <span className="font-medium">{t("volunteer.type", "Type")}:</span>{" "}
        {opportunity.type}
      </span>
      <span>
        <span className="font-medium">{t("volunteer.status", "Status")}:</span>{" "}
        {opportunity.status}
      </span>
    </div>
  </div>
);

interface Opportunity {
  id: string;
  title: string;
  description: string;
  skills: string[];
  commitment: string;
  location: string;
  type: string;
  status: string;
  work_language: WorkLanguage;
  created_at: string;
}

export const OpportunityManagement: React.FC = () => {
  const { profile } = useProfile();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { t } = useTranslation();

  const handleShowForm = useCallback(() => setShowForm(true), []);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("volunteer_opportunities")
        .select("*")
        .eq("charity_id", profile?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch opportunities",
      );
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchOpportunities();
    }
  }, [profile?.id, fetchOpportunities]);

  const handleCreateSuccess = useCallback(() => {
    setShowForm(false);
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const formatLanguageName = useCallback((language: string): string => {
    return language
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading&hellip;</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("volunteer.opportunities", "Volunteer Opportunities")}
        </h2>
        <Button onClick={handleShowForm} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t("volunteer.createNew", "Create New")}
        </Button>
      </div>

      {error && (
        <div className="p-4 m-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {showForm ? (
        <div className="p-6">
          <OpportunityForm
            onSuccess={handleCreateSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="p-6">
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t(
                "volunteer.noOpportunitiesYet",
                'No opportunities created yet. Click "Create New" to get started.',
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  t={t}
                  formatLanguageName={formatLanguageName}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
