import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  SelfReportedHoursInput,
  ActivityType,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_DESCRIPTIONS,
  MIN_HOURS_PER_RECORD,
  MAX_HOURS_PER_RECORD,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  calculateDaysUntilExpiration,
  isValidationExpired,
} from '@/types/selfReportedHours';
import { OrganizationAutocomplete } from './OrganizationAutocomplete';
import {
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react';

interface SelfReportedHoursFormProps {
  initialData?: Partial<SelfReportedHoursInput>;
  onSubmit: (input: SelfReportedHoursInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

type OrgMode = 'verified' | 'other';

// Common input classes for consistency
const INPUT_BASE_CLASSES = 'h-11 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-transparent';
const INPUT_WITH_ICON_CLASSES = `${INPUT_BASE_CLASSES} pl-10 pr-4`;
const INPUT_WITH_SUFFIX_CLASSES = `${INPUT_BASE_CLASSES} pl-10 pr-12`;

/**
 * Activity type dropdown sub-component
 */
interface ActivityTypeDropdownProps {
  value: ActivityType;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (type: ActivityType) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const ActivityTypeDropdown: React.FC<ActivityTypeDropdownProps> = ({
  value,
  isOpen,
  onToggle,
  onSelect,
  dropdownRef,
}) => {
  const handleSelect = useCallback((type: ActivityType) => {
    onSelect(type);
  }, [onSelect]);

  return (
    <div ref={dropdownRef} className="relative">
      <label id="activityTypeLabel" className="block text-sm font-medium text-gray-700 mb-2">
        Activity Type <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        aria-labelledby="activityTypeLabel"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={onToggle}
        className="w-full h-auto min-h-[2.75rem] flex items-center justify-between px-4 py-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-transparent"
      >
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-900">
            {ACTIVITY_TYPE_LABELS[value]}
          </span>
          <span className="block text-xs text-gray-500 mt-0.5">
            {ACTIVITY_TYPE_DESCRIPTIONS[value]}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div role="listbox" aria-labelledby="activityTypeLabel" className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 max-h-72 overflow-auto">
          {Object.values(ActivityType).map((type) => (
            <button
              key={type}
              type="button"
              role="option"
              aria-selected={value === type}
              onClick={() => handleSelect(type)}
              className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 first:rounded-t-xl last:rounded-b-xl ${
                value === type ? 'bg-emerald-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-900">
                  {ACTIVITY_TYPE_LABELS[type]}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {ACTIVITY_TYPE_DESCRIPTIONS[type]}
                </span>
              </div>
              {value === type && (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Organization selection sub-component
 */
interface OrganizationSelectorProps {
  orgMode: OrgMode;
  organizationName: string;
  organizationContactEmail: string;
  errors: Record<string, string>;
  onModeChange: (mode: OrgMode) => void;
  onOrgSelect: (org: { id: string; name: string } | null) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  orgMode,
  organizationName,
  organizationContactEmail,
  errors,
  onModeChange,
  onOrgSelect,
  onInputChange,
}) => {
  const handleVerifiedClick = useCallback(() => {
    onModeChange('verified');
  }, [onModeChange]);

  const handleOtherClick = useCallback(() => {
    onModeChange('other');
  }, [onModeChange]);

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700 mb-3">
        <span className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Organization <span className="text-red-500">*</span>
        </span>
      </legend>

      {/* Segmented Control */}
      <div className="inline-flex rounded-lg bg-gray-100 p-1 mb-4" role="radiogroup" aria-label="Organization type">
        <button
          type="button"
          role="radio"
          aria-checked={orgMode === 'verified'}
          onClick={handleVerifiedClick}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            orgMode === 'verified'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Platform Organization
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={orgMode === 'other'}
          onClick={handleOtherClick}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            orgMode === 'other'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Not Listed
        </button>
      </div>

      {orgMode === 'verified' ? (
        <OrganizationAutocomplete
          onSelect={onOrgSelect}
          error={errors.organization}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="organizationName"
                name="organizationName"
                value={organizationName}
                onChange={onInputChange}
                placeholder="Enter organization name"
                required
                className={`${INPUT_WITH_ICON_CLASSES} ${errors.organizationName ? 'border-red-300 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.organizationName && (
              <p className="mt-1.5 text-xs text-red-600">{errors.organizationName}</p>
            )}
          </div>
          <div>
            <label htmlFor="organizationContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="organizationContactEmail"
              type="email"
              name="organizationContactEmail"
              value={organizationContactEmail}
              onChange={onInputChange}
              placeholder="org@example.com"
              className={INPUT_BASE_CLASSES}
            />
            <p className="mt-2 text-xs text-gray-500">
              We may reach out to help onboard this organization
            </p>
          </div>
        </div>
      )}
    </fieldset>
  );
};

/**
 * Validation status preview sub-component
 */
interface ValidationPreviewProps {
  orgMode: OrgMode;
  hasOrganization: boolean;
  selectedOrgName: string | null;
  isExpired: boolean;
}

const ValidationPreview: React.FC<ValidationPreviewProps> = ({
  orgMode,
  hasOrganization,
  selectedOrgName,
  isExpired,
}) => {
  if (orgMode === 'verified' && hasOrganization && !isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg px-4 py-3">
        <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></span>
        This record will be submitted for validation{selectedOrgName ? ` to ${selectedOrgName}` : ''}
      </div>
    );
  }

  if (orgMode === 'verified' && isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Validation period has expired for this date
      </div>
    );
  }

  if (orgMode === 'other') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
        <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
        This record will be saved as unvalidated
      </div>
    );
  }

  return null;
};

/**
 * Form component for creating or editing self-reported volunteer hours
 * @param props - Component props
 * @returns JSX element
 */
export const SelfReportedHoursForm: React.FC<SelfReportedHoursFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<SelfReportedHoursInput>({
    activityDate: initialData?.activityDate || '',
    hours: initialData?.hours || 1,
    activityType: initialData?.activityType || ActivityType.DIRECT_SERVICE,
    description: initialData?.description || '',
    location: initialData?.location || '',
    organizationId: initialData?.organizationId,
    organizationName: initialData?.organizationName,
    organizationContactEmail: initialData?.organizationContactEmail,
  });

  const [orgMode, setOrgMode] = useState<OrgMode>(
    initialData?.organizationId ? 'verified' : 'other'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActivityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate days since activity for warning
  const daysInfo = useMemo(() => {
    if (!formData.activityDate) return { daysSince: 0, daysLeft: undefined, isExpired: false };
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(formData.activityDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysLeft = calculateDaysUntilExpiration(formData.activityDate);
    const expired = isValidationExpired(formData.activityDate);
    return { daysSince, daysLeft, isExpired: expired };
  }, [formData.activityDate]);

  const showExpirationWarning = daysInfo.daysLeft !== undefined && daysInfo.daysLeft <= 10 && !daysInfo.isExpired;

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'hours' ? Number.parseFloat(value) || 0 : value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const handleActivityTypeSelect = useCallback((type: ActivityType) => {
    setFormData((prev) => ({ ...prev, activityType: type }));
    setActivityDropdownOpen(false);
  }, []);

  const handleOrganizationSelect = useCallback((org: { id: string; name: string } | null) => {
    if (org) {
      setFormData((prev) => ({
        ...prev,
        organizationId: org.id,
        organizationName: undefined,
        organizationContactEmail: undefined,
      }));
      setSelectedOrgName(org.name);
    } else {
      setFormData((prev) => ({
        ...prev,
        organizationId: undefined,
      }));
      setSelectedOrgName(null);
    }
    if (errors.organization) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.organization;
        return next;
      });
    }
  }, [errors]);

  const handleOrgModeChange = useCallback((mode: OrgMode) => {
    setOrgMode(mode);
    setFormData((prev) => ({
      ...prev,
      organizationId: undefined,
      organizationName: mode === 'other' ? '' : undefined,
      organizationContactEmail: undefined,
    }));
    setSelectedOrgName(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.activityDate) {
      newErrors.activityDate = 'Activity date is required';
    } else if (new Date(formData.activityDate) > new Date()) {
      newErrors.activityDate = 'Date cannot be in the future';
    }

    if (formData.hours < MIN_HOURS_PER_RECORD || formData.hours > MAX_HOURS_PER_RECORD) {
      newErrors.hours = `Hours must be between ${MIN_HOURS_PER_RECORD} and ${MAX_HOURS_PER_RECORD}`;
    }

    if (!formData.description || formData.description.length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (orgMode === 'verified' && !formData.organizationId) {
      newErrors.organization = 'Please select an organization';
    }

    if (orgMode === 'other' && !formData.organizationName?.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, orgMode]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, onSubmit]);

  const today = new Date().toISOString().split('T')[0];
  const charCount = formData.description.length;

  const toggleDropdown = useCallback(() => {
    setActivityDropdownOpen(prev => !prev);
  }, []);

  // Character count status for description field
  const charCountStatus = useMemo(() => {
    if (charCount < MIN_DESCRIPTION_LENGTH) return 'text-amber-500';
    if (charCount > MAX_DESCRIPTION_LENGTH - 50) return 'text-amber-500';
    return 'text-gray-400';
  }, [charCount]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Date, Hours, Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Activity Date */}
            <div>
              <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="activityDate"
                  type="date"
                  name="activityDate"
                  value={formData.activityDate}
                  onChange={handleInputChange}
                  max={today}
                  required
                  className={`${INPUT_WITH_ICON_CLASSES} ${errors.activityDate ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.activityDate !== undefined && (
                <p className="mt-1.5 text-xs text-red-600">{errors.activityDate}</p>
              )}
              {showExpirationWarning && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Only {daysInfo.daysLeft} days left to request validation
                </p>
              )}
              {daysInfo.isExpired && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Hours logged more than 90 days ago cannot be validated
                </p>
              )}
            </div>

            {/* Hours */}
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
                Hours <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="hours"
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  min={MIN_HOURS_PER_RECORD}
                  max={MAX_HOURS_PER_RECORD}
                  step={0.5}
                  required
                  className={`${INPUT_WITH_SUFFIX_CLASSES} ${errors.hours ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  hrs
                </span>
              </div>
              {errors.hours !== undefined && (
                <p className="mt-1.5 text-xs text-red-600">{errors.hours}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="location"
                  name="location"
                  value={formData.location ?? ''}
                  onChange={handleInputChange}
                  placeholder="City or Remote"
                  className={INPUT_WITH_ICON_CLASSES}
                />
              </div>
            </div>
          </div>

          {/* Activity Type Dropdown */}
          <ActivityTypeDropdown
            value={formData.activityType}
            isOpen={activityDropdownOpen}
            onToggle={toggleDropdown}
            onSelect={handleActivityTypeSelect}
            dropdownRef={dropdownRef}
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-transparent ${
                  errors.description !== undefined ? 'border-red-300' : 'border-gray-200'
                }`}
                required
                minLength={MIN_DESCRIPTION_LENGTH}
                maxLength={MAX_DESCRIPTION_LENGTH}
                placeholder="Describe the activities you performed..."
              />
              {/* Character counter inside textarea */}
              <span className={`absolute bottom-3 right-3 text-xs pointer-events-none transition-colors ${charCountStatus}`}>
                {charCount}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            {errors.description !== undefined && (
              <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
            )}
            {charCount < MIN_DESCRIPTION_LENGTH && charCount > 0 && (
              <p className="mt-1.5 text-xs text-gray-500">
                {MIN_DESCRIPTION_LENGTH - charCount} more characters needed
              </p>
            )}
          </div>

          {/* Organization Selection */}
          <OrganizationSelector
            orgMode={orgMode}
            organizationName={formData.organizationName ?? ''}
            organizationContactEmail={formData.organizationContactEmail ?? ''}
            errors={errors}
            onModeChange={handleOrgModeChange}
            onOrgSelect={handleOrganizationSelect}
            onInputChange={handleInputChange}
          />

          {/* Validation Status Preview */}
          <div className="pt-2">
            <ValidationPreview
              orgMode={orgMode}
              hasOrganization={Boolean(formData.organizationId) || Boolean(selectedOrgName)}
              selectedOrgName={selectedOrgName}
              isExpired={daysInfo.isExpired}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 px-8 py-5 bg-gray-50/50 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={submitting || isLoading || (daysInfo.isExpired && orgMode === 'verified')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isEdit ? 'Updating...' : 'Logging...'}
              </span>
            ) : (
              isEdit ? 'Update Hours' : 'Log Hours'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SelfReportedHoursForm;
