import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { IrsOrganizationCard } from '@/components/charity/IrsOrganizationCard';
import { Button } from '@/components/ui/Button';
import { useIrsOrganizationSearch } from '@/hooks/useIrsOrganizationSearch';
import type { IrsOrganization } from '@/types/irsOrganization';

interface IrsOrganizationSearchProps {
  onOrganizationSelect: (organization: IrsOrganization) => void;
  onSkip: () => void;
}

/**
 * IRS organization search step for charity registration.
 * Allows users to search the IRS database and select their organization.
 * @param props - Component props
 * @param props.onOrganizationSelect - Called when user selects an organization
 * @param props.onSkip - Called when user chooses to register manually
 * @returns The rendered search component
 */
export const IrsOrganizationSearch: React.FC<IrsOrganizationSearchProps> = ({
  onOrganizationSelect,
  onSkip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { organizations, loading, hasMore, loadMore } = useIrsOrganizationSearch({
    searchTerm,
    filterState: '',
    onPlatformOnly: false,
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const hasSearchTerm = searchTerm.trim().length >= 2;
  const showNoResults = hasSearchTerm && !loading && organizations.length === 0;

  return (
    <div className="space-y-4">
      <Input
        label="Organization Name"
        placeholder="Search by organization name..."
        variant="fintech"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {!hasSearchTerm && !loading && (
        <p className="text-sm text-gray-500 text-center py-4">
          Search our database to find and claim your organization.
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {showNoResults && (
        <p className="text-sm text-gray-500 text-center py-4">
          No organizations found.
        </p>
      )}

      {organizations.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {organizations.map((org) => (
            <IrsOrganizationCard
              key={org.ein}
              organization={org}
              onSelect={onOrganizationSelect}
            />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={loadMore}>
            Load more results
          </Button>
        </div>
      )}

      <p className="text-sm text-center text-gray-500 pt-2">
        {"Can\u2019t find your organization? "}
        <button type="button" onClick={onSkip} className="font-medium text-indigo-600 hover:text-indigo-500">
          Register manually
        </button>
      </p>
    </div>
  );
};
