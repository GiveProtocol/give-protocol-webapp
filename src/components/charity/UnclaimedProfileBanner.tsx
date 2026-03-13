import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { submitRemovalRequest } from '@/services/irsDataService';
import { useToast } from '@/hooks/useToast';

interface UnclaimedProfileBannerProps {
  ein: string;
}

/**
 * Dismissible banner shown at the top of unclaimed charity profiles.
 * Offers "Claim this profile" and "Request removal" actions.
 * @param props - Component props
 * @param props.ein - The charity's EIN
 * @returns The rendered banner or null if dismissed
 */
export const UnclaimedProfileBanner: React.FC<UnclaimedProfileBannerProps> = ({ ein }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [removalReason, setRemovalReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const handleClaim = useCallback(() => {
    navigate(`/claim/${ein}`);
  }, [navigate, ein]);

  const handleOpenRemoval = useCallback(() => {
    setShowRemovalModal(true);
  }, []);

  const handleCloseRemoval = useCallback(() => {
    setShowRemovalModal(false);
    setRemovalReason('');
  }, []);

  const handleRemovalReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setRemovalReason(e.target.value);
    },
    [],
  );

  const handleSubmitRemoval = useCallback(async () => {
    if (!removalReason.trim()) return;
    setSubmitting(true);
    const success = await submitRemovalRequest(ein, removalReason.trim());
    setSubmitting(false);
    if (success) {
      showToast('success', 'Request submitted', 'We will review your removal request.');
      handleCloseRemoval();
    } else {
      showToast('error', 'Failed to submit', 'Please try again later.');
    }
  }, [ein, removalReason, showToast, handleCloseRemoval]);

  if (dismissed) return null;

  return (
    <>
      <div className="relative rounded-lg bg-emerald-50 border border-emerald-300 p-4 md:p-5">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <Building2 aria-hidden="true" className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900 text-sm">
              Are you affiliated with this organization?
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Claim this profile to manage it, add your mission and photos, and start
              receiving donations — or request removal if it&apos;s listed in error.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <Button size="sm" onClick={handleClaim}>
                Claim this profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleOpenRemoval}>
                Request removal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRemovalModal}
        onClose={handleCloseRemoval}
        title="Request Profile Removal"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Explain why this organization should be removed from Give Protocol.
          </p>
          <textarea
            value={removalReason}
            onChange={handleRemovalReasonChange}
            placeholder="Please describe your reason..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCloseRemoval}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitRemoval}
              disabled={submitting || !removalReason.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit request'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
