import React from "react";
import { Briefcase, ClipboardList, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

interface VolunteerApplication {
  id: string;
  full_name: string;
  opportunity?: {
    id: string;
    title: string;
  };
}

interface ApplicationsTabProps {
  pendingApplications: VolunteerApplication[];
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  pendingApplications,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("volunteer.pendingApplications", "Pending Applications")}
        </h2>
      </div>
      <div className="p-6 space-y-4">
        {pendingApplications.length > 0 ? (
          pendingApplications.map((application) => (
            <div
              key={application.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex justify-between items-start hover:shadow-sm transition-shadow"
            >
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">
                  {application.full_name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  {t("volunteer.appliedFor")}:{" "}
                  <span className="font-medium">
                    {application.opportunity?.title || "Unknown Opportunity"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t("volunteer.accept")}
                </Button>
                <Button variant="secondary" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {t("volunteer.reject")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("volunteer.noApplications", "No pending applications")}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {t(
                "volunteer.noPendingApplications",
                "No pending applications to review.",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsTab;
