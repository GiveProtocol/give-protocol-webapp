import React, { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CharityDetails } from "@/types/charity";

interface ProfileFormProps {
  profile: Partial<CharityDetails>;
  onSubmit: (_data: CharityDetails) => Promise<void>;
  loading: boolean;
  error?: string;
}

/**
 * ProfileForm component renders a form for editing charity profile details and handles submission.
 *
 * @param {Partial<CharityDetails>} profile - Initial profile data.
 * @param {(data: CharityDetails) => Promise<void>} onSubmit - Callback invoked with profile data on submit.
 * @param {boolean} loading - Indicates if form submission is in progress.
 * @param {string} [error] - Error message to display.
 * @returns {JSX.Element} The ProfileForm component.
 */
const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSubmit,
  loading,
  error,
}) => {
  const [formData, setFormData] = React.useState<CharityDetails>({
    name: profile.name || "",
    description: profile.description || "",
    category: profile.category || "",
    image_url: profile.image_url || "",
  });

  /**
   * Handle changes to the name input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event for the name input.
   */
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, name: e.target.value }));
    },
    [],
  );

  /**
   * Handle changes to the description textarea field.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Change event for the description textarea.
   */
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, description: e.target.value }));
    },
    [],
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, category: e.target.value }));
    },
    [],
  );

  const handleImageUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, image_url: e.target.value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(formData);
    },
    [formData, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}
      <Input
        label="Charity Name"
        value={formData.name}
        onChange={handleNameChange}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description{" "}
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50 mt-1"
            required
          />
        </label>
      </div>
      <Input
        label="Category"
        value={formData.category}
        onChange={handleCategoryChange}
        required
      />
      <Input
        label="Image URL"
        type="url"
        value={formData.image_url}
        onChange={handleImageUrlChange}
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
