import React, { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/Button";
import { Logger } from "@/utils/logger";
import {
  validateEmail,
  validateName,
  validatePhoneNumber,
} from "@/utils/validation";
import { AlertCircle, X, Mail } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface VolunteerApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
  charityId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type AgeRange =
  | "under-18"
  | "18-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55-64"
  | "65+";
type CommitmentType = "one-time" | "short-term" | "long-term";

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  timezone: string;
  ageRange: AgeRange | "";

  // Skills & Experience
  skills: string[];
  commitmentType: CommitmentType;
  experience: string;

  // Consent
  essentialProcessing: boolean;
  internationalTransfers: boolean;
  ageConfirmation: boolean;
  privacyNotice: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  location: "",
  timezone: "",
  ageRange: "",
  skills: [],
  commitmentType: "one-time",
  experience: "",
  essentialProcessing: false,
  internationalTransfers: false,
  ageConfirmation: false,
  privacyNotice: false,
};

export const VolunteerApplicationForm: React.FC<
  VolunteerApplicationFormProps
> = ({
  opportunityId,
  opportunityTitle: _opportunityTitle,
  charityId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { showToast } = useToast();
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const [showSkillPlaceholder, setShowSkillPlaceholder] = useState(true);

  // Initialize form with user profile data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
      }));
    }
  }, [profile]);

  // Update placeholder visibility
  useEffect(() => {
    setShowSkillPlaceholder(
      formData.skills.length === 0 && currentSkillInput.length === 0,
    );
  }, [formData.skills.length, currentSkillInput.length]);

  // Form field handlers
  const handleFieldChange = useCallback(
    (field: keyof FormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear validation error for the field
        if (validationErrors[field]) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            // Delete the error property
            const { [field]: _, ...rest } = newErrors;
            return rest;
          });
        }
      },
    [validationErrors],
  );

  const handleCheckboxChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.checked }));

      // Clear consent validation errors
      if (validationErrors.consent) {
        setValidationErrors((prev) => {
          const { consent: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors],
  );

  // Skill tag handlers
  const handleSkillInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentSkillInput(e.target.value);
    },
    [],
  );

  const addSkill = useCallback(
    (skillText: string) => {
      const trimmed = skillText.trim();
      if (trimmed && !formData.skills.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, trimmed],
        }));
        setCurrentSkillInput("");

        // Clear skills validation error
        if (validationErrors.skills) {
          setValidationErrors((prev) => {
            const { skills: _, ...rest } = prev;
            return rest;
          });
        }
      }
    },
    [formData.skills, validationErrors],
  );

  const removeSkill = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const createRemoveSkillHandler = useCallback(
    (index: number) => {
      return (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        removeSkill(index);
      };
    },
    [removeSkill],
  );

  const handleSkillInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addSkill(currentSkillInput);
      } else if (
        e.key === "Backspace" &&
        currentSkillInput === "" &&
        formData.skills.length > 0
      ) {
        removeSkill(formData.skills.length - 1);
      }
    },
    [currentSkillInput, formData.skills.length, addSkill, removeSkill],
  );

  const focusSkillInput = useCallback(() => {
    tagInputRef.current?.focus();
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!validateName(formData.firstName)) {
      errors.firstName = "Please enter a valid first name";
    }
    if (!validateName(formData.lastName)) {
      errors.lastName = "Please enter a valid last name";
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.experience.trim()) {
      errors.experience = "Please describe your relevant experience";
    }
    if (formData.skills.length === 0) {
      errors.skills = "Please add at least one skill";
    }
    if (!formData.ageRange) {
      errors.ageRange = "Please select your age range";
    }

    // Consent validation
    if (
      !formData.essentialProcessing ||
      !formData.ageConfirmation ||
      !formData.privacyNotice
    ) {
      errors.consent = "You must agree to all required consent items";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (!user || !profile) {
        showToast("error", "Please log in to submit an application");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.from("volunteer_applications").insert({
          opportunity_id: opportunityId,
          applicant_id: user.id,
          charity_id: charityId,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone_number: formData.phoneNumber || null,
          location: formData.location || null,
          timezone: formData.timezone || null,
          age_range: formData.ageRange || null,
          commitment_type: formData.commitmentType,
          experience: formData.experience,
          skills: formData.skills,
          interests: [],
          certifications: [],
          availability: {
            days: [],
            times: [],
          },
          consent_given: true,
          international_transfers_consent: formData.internationalTransfers,
        });

        if (error) throw error;

        Logger.info("Volunteer application submitted", {
          opportunityId,
          userId: user.id,
        });

        showToast("success", "Application submitted successfully!");
        onSuccess?.();
        onClose();
      } catch (error) {
        Logger.error("Failed to submit volunteer application", error);
        showToast("error", "Failed to submit application. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      validateForm,
      user,
      profile,
      opportunityId,
      charityId,
      showToast,
      onSuccess,
      onClose,
    ],
  );

  const handleBackdropClick = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [loading, onClose],
  );

  const handleSkillContainerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        focusSkillInput();
      }
    },
    [focusSkillInput],
  );

  const inputClasses =
    "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-600/10 transition-all duration-200";
  const textareaClasses =
    "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-600/10 transition-all duration-200 resize-vertical min-h-[100px]";
  const selectClasses =
    "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-600/10 transition-all duration-200 bg-white";

  return (
    <>
      <button
        className="fixed inset-0 bg-black bg-opacity-50 z-50 w-full h-full border-0 p-0 m-0 cursor-default"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Close modal"
        type="button"
      />
      <dialog
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-4xl w-[95%] max-h-[90vh] overflow-hidden z-50 p-0 m-0"
        open
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
          <h1 id="modal-title" className="text-3xl font-light mb-2">
            Volunteer Opportunity Application
          </h1>
          <p className="text-lg opacity-90">
            Help create sustainable impact through verified contributions
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>{" "}
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleFieldChange("firstName")}
                  className={inputClasses}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleFieldChange("lastName")}
                  className={inputClasses}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFieldChange("email")}
                  className={inputClasses}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleFieldChange("phoneNumber")}
                  className={inputClasses}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location/City
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={handleFieldChange("location")}
                  className={inputClasses}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Zone
                </label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={handleFieldChange("timezone")}
                  className={selectClasses}
                >
                  <option value="">Select Time Zone</option>
                  <option value="UTC-12">UTC-12 (Baker Island)</option>
                  <option value="UTC-11">UTC-11 (Hawaii-Aleutian)</option>
                  <option value="UTC-10">UTC-10 (Hawaii)</option>
                  <option value="UTC-9">UTC-9 (Alaska)</option>
                  <option value="UTC-8">UTC-8 (Pacific Time)</option>
                  <option value="UTC-7">UTC-7 (Mountain Time)</option>
                  <option value="UTC-6">UTC-6 (Central Time)</option>
                  <option value="UTC-5">UTC-5 (Eastern Time)</option>
                  <option value="UTC-4">UTC-4 (Atlantic Time)</option>
                  <option value="UTC-3">UTC-3 (Argentina, Brazil)</option>
                  <option value="UTC-2">UTC-2 (South Georgia)</option>
                  <option value="UTC-1">UTC-1 (Azores)</option>
                  <option value="UTC+0">UTC+0 (GMT/London)</option>
                  <option value="UTC+1">UTC+1 (Central Europe)</option>
                  <option value="UTC+2">UTC+2 (Eastern Europe)</option>
                  <option value="UTC+3">UTC+3 (Moscow, East Africa)</option>
                  <option value="UTC+4">UTC+4 (Gulf States)</option>
                  <option value="UTC+5">UTC+5 (Pakistan)</option>
                  <option value="UTC+5.5">UTC+5:30 (India)</option>
                  <option value="UTC+6">UTC+6 (Bangladesh)</option>
                  <option value="UTC+7">UTC+7 (Southeast Asia)</option>
                  <option value="UTC+8">UTC+8 (China, Singapore)</option>
                  <option value="UTC+9">UTC+9 (Japan, Korea)</option>
                  <option value="UTC+9.5">UTC+9:30 (Central Australia)</option>
                  <option value="UTC+10">UTC+10 (Eastern Australia)</option>
                  <option value="UTC+11">UTC+11 (Solomon Islands)</option>
                  <option value="UTC+12">UTC+12 (New Zealand)</option>
                  <option value="UTC+13">UTC+13 (Tonga)</option>
                  <option value="UTC+14">UTC+14 (Line Islands)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="ageRange"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Age Range <span className="text-red-500">*</span>
                </label>
                <select
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={handleFieldChange("ageRange")}
                  className={selectClasses}
                  required
                >
                  <option value="">Select Age Range</option>
                  <option value="under-18">Under 18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
                {validationErrors.ageRange && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.ageRange}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skills & Interests Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>{" "}
              Skills & Interests
            </h2>

            <div className="mb-4">
              <label
                htmlFor="skillInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Skills and Areas of Interest{" "}
                <span className="text-red-500">*</span>
              </label>
              <button
                className="relative border-2 border-gray-200 rounded-xl p-4 bg-gray-50 cursor-text transition-all duration-200 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-600/10 w-full text-left min-h-[100px]"
                onClick={focusSkillInput}
                onKeyDown={handleSkillContainerKeyDown}
                aria-label="Click to add skills"
                type="button"
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={skill}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-fadeIn"
                    >
                      <span className="text-sm">{skill}</span>
                      <button
                        type="button"
                        onClick={createRemoveSkillHandler(index)}
                        className="bg-white/20 hover:bg-white/30 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    id="skillInput"
                    ref={tagInputRef}
                    type="text"
                    value={currentSkillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillInputKeyDown}
                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 pt-6"
                    placeholder="Type a skill and press Enter..."
                  />
                  {showSkillPlaceholder && (
                    <div className="absolute top-0 left-0 text-gray-400 italic pointer-events-none text-sm">
                      Start typing your skills (e.g., &ldquo;Python
                      programming&rdquo;, &ldquo;Public speaking&rdquo;,
                      &ldquo;Grant writing&rdquo;)
                    </div>
                  )}
                </div>
              </button>
              {validationErrors.skills && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.skills}
                </p>
              )}
            </div>

            <div className="mb-4">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Commitment Level <span className="text-red-500">*</span>
                </legend>
                <div className="grid md:grid-cols-3 gap-3">
                  <label
                    htmlFor="commitment-one-time"
                    aria-label="One-time commitment level"
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      formData.commitmentType === "one-time"
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      id="commitment-one-time"
                      type="radio"
                      name="commitmentType"
                      value="one-time"
                      checked={formData.commitmentType === "one-time"}
                      onChange={handleFieldChange("commitmentType")}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 mb-1">
                        One-time
                      </div>
                      <div className="text-sm text-gray-600">
                        Single project or short-duration tasks
                      </div>
                    </div>
                  </label>
                  <label
                    htmlFor="commitment-short-term"
                    aria-label="Short-term commitment level"
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      formData.commitmentType === "short-term"
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      id="commitment-short-term"
                      type="radio"
                      name="commitmentType"
                      value="short-term"
                      checked={formData.commitmentType === "short-term"}
                      onChange={handleFieldChange("commitmentType")}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 mb-1">
                        Short-Term
                      </div>
                      <div className="text-sm text-gray-600">
                        Few weeks to a few months
                      </div>
                    </div>
                  </label>
                  <label
                    htmlFor="commitment-long-term"
                    aria-label="Long-term commitment level"
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      formData.commitmentType === "long-term"
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      id="commitment-long-term"
                      type="radio"
                      name="commitmentType"
                      value="long-term"
                      checked={formData.commitmentType === "long-term"}
                      onChange={handleFieldChange("commitmentType")}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 mb-1">
                        Long-Term
                      </div>
                      <div className="text-sm text-gray-600">
                        Ongoing commitment of several months or more
                      </div>
                    </div>
                  </label>
                </div>
              </fieldset>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tell us about your relevant experience{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="experience"
                value={formData.experience}
                onChange={handleFieldChange("experience")}
                className={textareaClasses}
                placeholder="Describe your background, skills, and what motivates you to volunteer with Give Protocol..."
                required
              />
              {validationErrors.experience && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.experience}
                </p>
              )}
            </div>
          </div>

          {/* Consent & Agreement Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>{" "}
              Consent & Agreement
            </h2>

            <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-indigo-600">
              <h3 className="font-semibold text-gray-900 mb-4">
                Volunteer Application Consent
              </h3>

              <div className="mb-4 text-gray-700 leading-relaxed">
                <p>
                  By completing and submitting this form, I consent to GIVE
                  PROTOCOL collecting, processing, and storing my personal
                  information as described in the Volunteer Application Privacy
                  Notice, which I have read and understood.
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-900 mb-3">
                  I understand that:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
                  <li>
                    My personal information will be processed for the purposes
                    of evaluating my volunteer application, managing volunteer
                    assignments, and related activities.
                  </li>
                  <li>
                    GIVE PROTOCOL may collect various categories of my personal
                    information, including identity information, contact
                    details, background information, availability, references,
                    and where relevant and permitted by law, certain special
                    categories of data.
                  </li>
                  <li>
                    My personal information may be shared with authorized
                    personnel within the charity organization offering the
                    volunteer opportunity, service providers, and third parties
                    as outlined in the Privacy Notice.
                  </li>
                  <li>
                    My personal information may be transferred internationally
                    with appropriate safeguards in place.
                  </li>
                  <li>
                    I have certain rights regarding my personal information,
                    which vary depending on my location, including the rights to
                    access, rectify, delete, restrict processing, data
                    portability, and object to processing.
                  </li>
                  <li>
                    I can withdraw my consent at any time by contacting
                    <span>
                      {" "}
                      <a
                        href="mailto:legal@giveprotocol.io"
                        className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        legal@giveprotocol.io <Mail className="w-3 h-3" />
                      </a>
                    </span>
                    , though this will not affect the lawfulness of processing
                    based on my consent before withdrawal. Withdrawing consent
                    may impact the organization&apos;s ability to consider my
                    volunteer application.
                  </li>
                </ol>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900 mb-3">
                  SPECIFIC CONSENTS
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Please review and indicate your consent to each of the
                  following:
                </p>

                <div className="space-y-3">
                  <label
                    htmlFor="essential-processing"
                    aria-label="Essential processing consent"
                    className="flex items-start hover:bg-white rounded-lg p-3 transition-colors cursor-pointer"
                  >
                    <input
                      id="essential-processing"
                      type="checkbox"
                      checked={formData.essentialProcessing}
                      onChange={handleCheckboxChange("essentialProcessing")}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <strong className="font-semibold text-gray-900">
                        Essential Processing (Required):
                      </strong>
                      <p className="text-gray-700 text-sm mt-1">
                        I consent to GIVE PROTOCOL collecting and processing my
                        personal information for the purpose of evaluating my
                        volunteer application and, if successful, managing my
                        volunteer engagement.
                      </p>
                      <p className="text-gray-500 italic text-xs mt-1">
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
                    className="flex items-start hover:bg-white rounded-lg p-3 transition-colors cursor-pointer"
                  >
                    <input
                      id="international-transfers"
                      type="checkbox"
                      checked={formData.internationalTransfers}
                      onChange={handleCheckboxChange("internationalTransfers")}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <strong className="font-semibold text-gray-900">
                        International Transfers (if applicable):
                      </strong>
                      <p className="text-gray-700 text-sm mt-1">
                        I consent to GIVE PROTOCOL transferring my personal
                        information to countries outside my country of
                        residence, including countries that may not provide the
                        same level of data protection, with appropriate
                        safeguards in place as described in the Privacy Notice.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="font-semibold text-gray-900 mb-3">
                  ACKNOWLEDGMENT
                </p>

                <label
                  htmlFor="age-confirmation"
                  aria-label="Age confirmation"
                  className="flex items-start mb-3 hover:bg-white rounded-lg p-3 transition-colors cursor-pointer"
                >
                  <input
                    id="age-confirmation"
                    type="checkbox"
                    checked={formData.ageConfirmation}
                    onChange={handleCheckboxChange("ageConfirmation")}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <strong className="font-semibold text-gray-900">
                      Age Confirmation:
                    </strong>
                    <p className="text-gray-700 text-sm mt-1">
                      I confirm that I am at least 16 years of age.
                    </p>
                    <p className="text-gray-500 italic text-xs mt-1">
                      (If you are under 16 years of age, parental or guardian
                      consent is required)
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="privacy-notice"
                  aria-label="Privacy notice acknowledgment"
                  className="flex items-start hover:bg-white rounded-lg p-3 transition-colors cursor-pointer"
                >
                  <input
                    id="privacy-notice"
                    type="checkbox"
                    checked={formData.privacyNotice}
                    onChange={handleCheckboxChange("privacyNotice")}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <strong className="font-semibold text-gray-900">
                      Privacy Notice:
                    </strong>
                    <p className="text-gray-700 text-sm mt-1">
                      I confirm that I have read and understood the Privacy
                      Notice.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {validationErrors.consent && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700">{validationErrors.consent}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Volunteer Application"}
            </Button>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>
                By submitting this application, you acknowledge that you have
                read and understood Give Protocol&apos;s privacy policy and
                volunteer guidelines. Your data will be processed in accordance
                with applicable data protection regulations.
              </p>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
};
