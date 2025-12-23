import React from "react";
import { Clock, Download, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";

interface VolunteerHours {
  id: string;
  volunteer_id: string;
  volunteerName: string;
  hours: number;
  date_performed: string;
  description: string;
}

interface VolunteersTabProps {
  pendingHours: VolunteerHours[];
}

export const VolunteersTab: React.FC<VolunteersTabProps> = ({
  pendingHours,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("volunteer.pendingHours", "Pending Volunteer Hours")}
          </h2>
          <Button
            variant="secondary"
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            {t("contributions.export")}
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {pendingHours.length > 0 ? (
          pendingHours.map((hours) => (
            <div
              key={hours.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex justify-between items-start hover:shadow-sm transition-shadow"
            >
              <div className="flex-grow pr-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {hours.volunteerName}
                </h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">
                    {hours.hours} {t("volunteer.hours")}
                  </span>
                  <span className="text-gray-400">|</span>
                  {formatDate(hours.date_performed)}
                </p>
                {hours.description && (
                  <p className="text-sm text-gray-600 bg-white rounded-lg p-3 mt-2">
                    {hours.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t("volunteer.verify")}
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
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("volunteer.allCaughtUp", "All caught up!")}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {t(
                "volunteer.noPendingHours",
                "No pending volunteer hours to verify.",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteersTab;
