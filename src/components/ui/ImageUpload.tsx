import React, { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import {
  useImageUpload,
  IMAGE_UPLOAD_CONFIG,
  validateImageFile,
} from "@/hooks/useImageUpload";

interface ImageUploadProps {
  /** Current image URL if already uploaded */
  value?: string;
  /** Callback when image is uploaded successfully with URL and storage path */
  onChange: (_url: string | null, _path: string | null) => void;
  /** Folder path for organizing uploads (e.g., 'opportunities/charity-123') */
  folder: string;
  /** Label for the upload field */
  label?: string;
  /** Help text shown below the upload area */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Image upload component with drag-and-drop support
 * Validates file size and type before upload
 * Stores images in Supabase Storage
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   value={formData.imageUrl}
 *   onChange={(url, path) => setFormData({ imageUrl: url, imagePath: path })}
 *   folder={`opportunities/${charityId}`}
 *   label="Header Image"
 *   required
 * />
 * ```
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder,
  label = "Upload Image",
  helpText,
  required = false,
  error: externalError,
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const {
    uploading,
    error: uploadError,
    uploadImage,
    deleteImage,
    clearError,
  } = useImageUpload();

  const handleFileSelect = useCallback(
    async (file: File) => {
      clearError();

      // Validate before upload
      const validationError = validateImageFile(file);
      if (validationError) {
        return;
      }

      // Create preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload to storage
      const result = await uploadImage(file, folder);

      if (result) {
        // Clean up local preview
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(result.url);
        setCurrentPath(result.path);
        onChange(result.url, result.path);
      } else {
        // Revert preview on error
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(value ?? null);
      }
    },
    [folder, uploadImage, onChange, value, clearError],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [disabled, uploading, handleFileSelect],
  );

  const handleRemove = useCallback(async () => {
    if (currentPath) {
      await deleteImage(currentPath);
    }
    setPreviewUrl(null);
    setCurrentPath(null);
    onChange(null, null);
  }, [currentPath, deleteImage, onChange]);

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleRemove();
    },
    [handleRemove],
  );

  const displayError = externalError || uploadError?.message;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        className={`
          relative w-full border-2 border-dashed rounded-lg transition-colors text-left
          ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer hover:border-indigo-400"}
          ${displayError ? "border-red-300" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES.join(",")}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="hidden"
          aria-label={label}
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {!uploading && !disabled && (
              <input
                type="button"
                onClick={handleRemoveClick}
                className="absolute top-2 right-2 p-1.5 w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center"
                title="Remove image"
                value="✕"
                aria-label="Remove image"
              />
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            {uploading ? (
              <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
            ) : (
              <div className="space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  {isDragging ? (
                    <ImageIcon className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <Upload className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-indigo-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </div>
                <p className="text-xs text-gray-500">
                  {IMAGE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(
                    ", ",
                  ).toUpperCase()}{" "}
                  up to {IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE_DISPLAY}
                </p>
                <p className="text-xs text-gray-400">
                  Recommended:{" "}
                  {IMAGE_UPLOAD_CONFIG.RECOMMENDED_DIMENSIONS.width}x
                  {IMAGE_UPLOAD_CONFIG.RECOMMENDED_DIMENSIONS.height}px
                </p>
              </div>
            )}
          </div>
        )}
      </button>

      {displayError && (
        <div className="mt-2 flex items-start text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {helpText && !displayError && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default ImageUpload;
