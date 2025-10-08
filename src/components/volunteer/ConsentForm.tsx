import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Mail } from "lucide-react";

interface ConsentFormProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({
  onAccept,
  onDecline,
}) => {
  const [essentialProcessing, setEssentialProcessing] = useState(false);
  const [ageConfirmation, setAgeConfirmation] = useState(false);
  const [privacyNotice, setPrivacyNotice] = useState(false);
  const [internationalTransfers, setInternationalTransfers] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAccept = useCallback(() => {
    // Validate required checkboxes
    if (!essentialProcessing) {
      setValidationError("Essential Processing consent is required to proceed");
      return;
    }

    if (!ageConfirmation || !privacyNotice) {
      setValidationError(
        "You must confirm your age and that you have read the Privacy Notice",
      );
      return;
    }

    // Clear any validation errors and proceed
    setValidationError(null);
    onAccept();
  }, [essentialProcessing, ageConfirmation, privacyNotice, onAccept]);

  const handleEssentialProcessingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEssentialProcessing(e.target.checked);
      if (
        e.target.checked &&
        validationError?.includes("Essential Processing")
      ) {
        setValidationError(null);
      }
    },
    [validationError],
  );

  const handleInternationalTransfersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternationalTransfers(e.target.checked);
    },
    [],
  );

  const handleAgeConfirmationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAgeConfirmation(e.target.checked);
      if (
        e.target.checked &&
        privacyNotice &&
        validationError?.includes("confirm your age")
      ) {
        setValidationError(null);
      }
    },
    [privacyNotice, validationError],
  );

  const handlePrivacyNoticeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrivacyNotice(e.target.checked);
      if (
        e.target.checked &&
        ageConfirmation &&
        validationError?.includes("confirm your age")
      ) {
        setValidationError(null);
      }
    },
    [ageConfirmation, validationError],
  );

  const handleBackdropClick = useCallback(() => {
    onDecline();
  }, [onDecline]);

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onDecline();
      }
    },
    [onDecline],
  );

  const isSubmitDisabled =
    !essentialProcessing || !ageConfirmation || !privacyNotice;

  return (
    <>
      <button
        className="fixed inset-0 bg-black bg-opacity-50 z-50 cursor-default"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        tabIndex={0}
        aria-label="Close modal"
        type="button"
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-4xl w-[95%] max-h-[90vh] overflow-hidden z-50">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 text-center">
          <h1 className="text-3xl font-light mb-2">
            Volunteer Opportunity Application
          </h1>
          <p className="text-lg opacity-90">
            Help create sustainable impact through verified contributions
          </p>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Volunteer Application Consent
          </h2>

          <p className="mb-6 text-gray-700 leading-relaxed">
            By completing and submitting this form, I consent to GIVE
            PROTOCOL collecting, processing, and storing my personal
            information as described in the Volunteer Application Privacy
            Notice, which I have read and understood.
          </p>

          <p className="font-semibold text-gray-900 mb-3">
            I understand that:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700 mb-6">
                <li>
                  My personal information will be processed for the purposes of
                  evaluating my volunteer application, managing volunteer
                  assignments, and related activities.
                </li>
                <li>
                  GIVE PROTOCOL may collect various categories of my personal
                  information, including identity information, contact details,
                  background information, availability, references, and where
                  relevant and permitted by law, certain special categories of
                  data.
                </li>
                <li>
                  My personal information may be shared with authorized
                  personnel within the charity organization offering the
                  volunteer opportunity, service providers, and third parties as
                  outlined in the Privacy Notice.
                </li>
                <li>
                  My personal information may be transferred internationally
                  with appropriate safeguards in place.
                </li>
                <li>
                  I have certain rights regarding my personal information, which
                  vary depending on my location, including the rights to access,
                  rectify, delete, restrict processing, data portability, and
                  object to processing.
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  I can withdraw my consent at any time by contacting{" "}
                  <a
                    href="mailto:legal@giveprotocol.io"
                    className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    legal@giveprotocol.io <Mail className="h-3 w-3" aria-hidden="true" />
                  </a>
                  , though this will not affect the lawfulness of processing
                  based on my consent before withdrawal. Withdrawing consent may
                  impact the organization&apos;s ability to consider my
                  volunteer application.
                </li>
          </ol>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <p className="font-semibold text-gray-900 mb-4">
              SPECIFIC CONSENTS
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Please review and indicate your consent to each of the
              following:
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-4 border-l-4 border-indigo-600 space-y-6">
                  <label
                    htmlFor="essential-processing"
                    aria-label="Essential processing consent"
                    className="flex items-start hover:bg-white rounded-lg p-4 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="essential-processing"
                      checked={essentialProcessing}
                      onChange={handleEssentialProcessingChange}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-4">
                      <strong className="font-semibold text-gray-900">
                        Essential Processing (Required):
                      </strong>
                      <p className="text-gray-700 mt-1">
                        I consent to GIVE PROTOCOL collecting and processing my
                        personal information for the purpose of evaluating my
                        volunteer application and, if successful, managing my
                        volunteer engagement.
                      </p>
                      <p className="text-gray-500 italic text-sm mt-2">
                        Note: This consent is necessary to process your
                        volunteer application. If you do not provide this
                        consent, we will not be able to consider your
                        application.
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="international-transfers"
                    aria-label="International transfers consent"
                    className="flex items-start hover:bg-white rounded-lg p-4 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="international-transfers"
                      checked={internationalTransfers}
                      onChange={handleInternationalTransfersChange}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-4">
                      <strong className="font-semibold text-gray-900">
                        International Transfers (if applicable):
                      </strong>
                      <p className="text-gray-700 mt-1">
                        I consent to GIVE PROTOCOL transferring my personal
                        information to countries outside my country of
                        residence, including countries that may not provide the
                        same level of data protection, with appropriate
                        safeguards in place as described in the Privacy Notice.
                      </p>
                    </div>
                  </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="font-semibold text-gray-900 mb-4">ACKNOWLEDGMENT</p>

            <label
              htmlFor="age-confirmation"
              aria-label="Age confirmation"
              className="flex items-start mb-4 hover:bg-gray-50 rounded-lg p-4 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                id="age-confirmation"
                checked={ageConfirmation}
                onChange={handleAgeConfirmationChange}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-4">
                <strong className="font-semibold text-gray-900">
                  Age Confirmation:
                </strong>
                <p className="text-gray-700 mt-1">
                  I confirm that I am at least 16 years of age.
                </p>
                <p className="text-gray-500 italic text-sm mt-1">
                  (If you are under 16 years of age, parental or guardian
                  consent is required)
                </p>
              </div>
            </label>

            <label
              htmlFor="privacy-notice"
              aria-label="Privacy notice acknowledgment"
              className="flex items-start hover:bg-gray-50 rounded-lg p-4 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                id="privacy-notice"
                checked={privacyNotice}
                onChange={handlePrivacyNoticeChange}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-4">
                <strong className="font-semibold text-gray-900">
                  Privacy Notice:
                </strong>
                <p className="text-gray-700 mt-1">
                  I confirm that I have read and understood the Privacy
                  Notice.
                </p>
              </div>
            </label>
          </div>

          {validationError && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-700">{validationError}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onDecline}
              className="px-8 py-3"
            >
              Do Not Accept
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isSubmitDisabled}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Accept and Continue
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By submitting this application, you acknowledge that you have read
              and understood Give Protocol&apos;s privacy policy and volunteer
              guidelines. Your data will be processed in accordance with
              applicable data protection regulations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
