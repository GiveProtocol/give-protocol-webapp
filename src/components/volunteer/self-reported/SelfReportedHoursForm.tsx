import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  FileText,
  ChevronDown,
  Minus,
  Plus,
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
    setFormData((prev) => ({ ...prev, [name]: name === 'hours' ? Number.parseFloat(value) : value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const handleHoursIncrement = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      hours: Math.min(MAX_HOURS_PER_RECORD, prev.hours + 0.5),
    }));
  }, []);

  const handleHoursDecrement = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      hours: Math.max(MIN_HOURS_PER_RECORD, prev.hours - 0.5),
    }));
  }, []);

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
  const charsNeeded = MIN_DESCRIPTION_LENGTH - charCount;

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section 1: When & Where */}
        <div className="p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">When & Where</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Activity Date */}
            <div>
              <label htmlFor="activityDate" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="activityDate"
                type="date"
                name="activityDate"
                value={formData.activityDate}
                onChange={handleInputChange}
                max={today}
                required
                error={errors.activityDate}
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
              {/* Date validation warnings */}
              {showExpirationWarning && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Only {daysInfo.daysLeft} days left to request validation
                </p>
              )}
              {daysInfo.isExpired && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Hours logged more than 90 days ago cannot be validated
                </p>
              )}
            </div>

            {/* Hours with stepper */}
            <div>
              <label htmlFor="hours" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                Hours <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleHoursDecrement}
                  disabled={formData.hours <= MIN_HOURS_PER_RECORD}
                  className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
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
                  className="w-16 text-center border-gray-300 border-y py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10"
                />
                <button
                  type="button"
                  onClick={handleHoursIncrement}
                  disabled={formData.hours >= MAX_HOURS_PER_RECORD}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">{MIN_HOURS_PER_RECORD} – {MAX_HOURS_PER_RECORD} hours</p>
              {errors.hours && <p className="mt-1 text-xs text-red-600">{errors.hours}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                Location <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                placeholder="City or Remote"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: What */}
        <div className="p-5 bg-gray-50/50 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">What</h4>

          {/* Activity Type - Custom Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <FileText className="w-4 h-4 text-gray-400" />
              Activity Type <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setActivityDropdownOpen(!activityDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <div className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 truncate">
                  {ACTIVITY_TYPE_LABELS[formData.activityType]}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {ACTIVITY_TYPE_DESCRIPTIONS[formData.activityType]}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform ${activityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {activityDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto">
                {Object.values(ActivityType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleActivityTypeSelect(type)}
                    className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-start gap-3 ${
                      formData.activityType === type ? 'bg-emerald-50' : ''
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
                    {formData.activityType === type && (
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`block w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              minLength={MIN_DESCRIPTION_LENGTH}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Describe the activities you performed..."
            />
            <div className="mt-1.5 text-xs text-right">
              {charCount < MIN_DESCRIPTION_LENGTH ? (
                <span className="text-amber-600">{charsNeeded} more characters needed</span>
              ) : (
                <span className="text-gray-500">{charCount}/{MAX_DESCRIPTION_LENGTH}</span>
              )}
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Section 3: Who */}
        <div className="p-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Who</h4>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
              <Building2 className="w-4 h-4 text-gray-400" />
              Organization <span className="text-red-500">*</span>
            </label>

            {/* Segmented Control */}
            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50 mb-4">
              <button
                type="button"
                onClick={() => handleOrgModeChange('verified')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  orgMode === 'verified'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Platform Organization
              </button>
              <button
                type="button"
                onClick={() => handleOrgModeChange('other')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  orgMode === 'other'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Not Listed
              </button>
            </div>

            {orgMode === 'verified' ? (
              <OrganizationAutocomplete
                onSelect={handleOrganizationSelect}
                error={errors.organization}
              />
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                    error={errors.organizationName}
                    required
                    className="focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="organizationContactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <Input
                    id="organizationContactEmail"
                    type="email"
                    name="organizationContactEmail"
                    value={formData.organizationContactEmail || ''}
                    onChange={handleInputChange}
                    placeholder="org@example.com"
                    className="focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    We may reach out to help onboard this organization
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Status Preview */}
          <div className="pt-2">
            {orgMode === 'verified' && (formData.organizationId || selectedOrgName) && !daysInfo.isExpired && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></span>
                This record will be submitted for validation{selectedOrgName ? ` to ${selectedOrgName}` : ''}
              </p>
            )}
            {orgMode === 'verified' && daysInfo.isExpired && (
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Validation period has expired for this date
              </p>
            )}
            {orgMode === 'other' && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                This record will be saved as unvalidated
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/30">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={submitting || isLoading || (daysInfo.isExpired && orgMode === 'verified')}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
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
