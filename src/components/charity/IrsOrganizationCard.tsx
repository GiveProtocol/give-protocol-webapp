import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import type { IrsOrganization } from '@/types/irsOrganization';
import { Card } from '@/components/ui/Card';

interface IrsOrganizationCardProps {
  organization: IrsOrganization;
}

/**
 * Card component for displaying an IRS organization record.
 * Shows name, EIN, location, NTEE code, and deductibility status.
 * @param props - Component props
 * @param props.organization - The IRS organization data to display
 * @returns The rendered card component
 */
export const IrsOrganizationCard: React.FC<IrsOrganizationCardProps> = ({ organization }) => {
  const location = [organization.city, organization.state, organization.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      to={`/charity/${organization.ein}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {organization.name}
          </h3>
          {organization.is_on_platform && (
            <span className="ml-2 shrink-0 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              On Platform
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Building2 aria-hidden="true" className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
            <span>EIN: {organization.ein}</span>
          </div>

          {location && (
            <div className="flex items-center">
              <MapPin aria-hidden="true" className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {organization.ntee_cd && (
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
              NTEE: {organization.ntee_cd}
            </span>
          )}
          {organization.deductibility && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              Deductibility: {organization.deductibility}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
};
