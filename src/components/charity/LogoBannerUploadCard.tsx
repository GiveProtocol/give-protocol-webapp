import React, { useCallback, useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { Logger } from "@/utils/logger";

type Slot = "logo" | "banner";

interface LogoBannerUploadCardProps {
  ein: string;
  logoUrl: string | null | undefined;
  bannerImageUrl: string | null | undefined;
  claimedByUserId: string | null | undefined;
  onLogoUploaded: (_url: string | null) => void;
  onBannerUploaded: (_url: string | null) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STORAGE_BUCKET = "charity-assets";
const SLOT_COLUMN: Record<Slot, "logo_url" | "banner_image_url"> = {
  logo: "logo_url",
  banner: "banner_image_url",
};
const SLOT_LABEL: Record<Slot, string> = {
  logo: "Logo",
  banner: "Banner",
};

/**
 * Card that lets a claimed charity owner upload or replace their logo
 * and banner image. Stores files in the charity-assets bucket and
 * updates the corresponding column on charity_profiles.
 */
export const LogoBannerUploadCard: React.FC<LogoBannerUploadCardProps> = ({
  ein,
  logoUrl,
  bannerImageUrl,
  claimedByUserId,
  onLogoUploaded,
  onBannerUploaded,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isOwner = Boolean(
    user?.id && claimedByUserId && user.id === claimedByUserId,
  );

  const handleUpload = useCallback(
    async (file: File, slot: Slot) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        showToast(
          "error",
          "Invalid file type",
          "Please upload a JPEG, PNG, or WebP image.",
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast("error", "File too large", "Maximum file size is 5 MB.");
        return;
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${ein}/${slot}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        Logger.error("Charity asset upload failed", {
          error: uploadError,
          ein,
          slot,
        });
        showToast("error", "Upload failed", "Please try again.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      const column = SLOT_COLUMN[slot];
      const { error: updateError } = await supabase
        .from("charity_profiles")
        .update({ [column]: urlData.publicUrl })
        .eq("ein", ein);

      if (updateError) {
        Logger.error("Charity asset URL save failed", {
          error: updateError,
          ein,
          slot,
        });
        showToast("error", "Save failed", "Please try again.");
        return;
      }

      if (slot === "logo") {
        onLogoUploaded(urlData.publicUrl);
      } else {
        onBannerUploaded(urlData.publicUrl);
      }
      showToast("success", `${SLOT_LABEL[slot]} uploaded`);
    },
    [ein, showToast, onLogoUploaded, onBannerUploaded],
  );

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file, "logo");
    },
    [handleUpload],
  );

  const handleBannerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file, "banner");
    },
    [handleUpload],
  );

  const handleLogoClick = useCallback(() => {
    if (!isOwner) return;
    logoInputRef.current?.click();
  }, [isOwner]);

  const handleBannerClick = useCallback(() => {
    if (!isOwner) return;
    bannerInputRef.current?.click();
  }, [isOwner]);

  return (
    <Card hover={false} className="p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Logo & Banner</h3>
        <span className="text-xs text-gray-400">
          {isOwner ? "Click an image to replace it" : "Managed by owner"}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Logo</p>
          {logoUrl ? (
            <button
              type="button"
              onClick={handleLogoClick}
              disabled={!isOwner}
              className={`block ${isOwner ? "cursor-pointer" : "cursor-default"}`}
              aria-label="Replace logo"
            >
              <img
                src={logoUrl}
                alt="Organization logo"
                className="rounded-lg object-cover h-24 w-24"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogoClick}
              disabled={!isOwner}
              className={`h-24 w-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                isOwner
                  ? "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
                  : "border-gray-200 cursor-default"
              }`}
            >
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-400">
                {isOwner ? "Upload" : "No logo"}
              </span>
            </button>
          )}
          {isOwner && (
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Banner</p>
          {bannerImageUrl ? (
            <button
              type="button"
              onClick={handleBannerClick}
              disabled={!isOwner}
              className={`block w-full ${isOwner ? "cursor-pointer" : "cursor-default"}`}
              aria-label="Replace banner"
            >
              <img
                src={bannerImageUrl}
                alt="Organization banner"
                className="rounded-lg object-cover h-32 w-full"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBannerClick}
              disabled={!isOwner}
              className={`w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                isOwner
                  ? "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
                  : "border-gray-200 cursor-default"
              }`}
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-400">
                {isOwner ? "Upload banner" : "No banner"}
              </span>
            </button>
          )}
          {isOwner && (
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBannerChange}
            />
          )}
        </div>
      </div>
    </Card>
  );
};
