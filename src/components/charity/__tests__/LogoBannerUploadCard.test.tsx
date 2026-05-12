import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { supabase, resetMockState } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { LogoBannerUploadCard } from "../LogoBannerUploadCard";

const mockUseAuth = jest.mocked(useAuth);
const mockUseToast = jest.mocked(useToast);

const USER_ID = "user-1";

interface StorageResult {
  data: unknown;
  error: unknown;
}

interface StorageMock {
  upload: jest.Mock<(_path: string, _file: File) => Promise<StorageResult>>;
  getPublicUrl: jest.Mock<(_path: string) => { data: { publicUrl: string } }>;
}

function setStorageResult(result: StorageResult, publicUrl: string) {
  const storageMock: StorageMock = {
    upload: jest.fn(() => Promise.resolve(result)),
    getPublicUrl: jest.fn(() => ({ data: { publicUrl } })),
  };
  (supabase.storage.from as jest.Mock).mockReturnValue(storageMock);
  return storageMock;
}

function makeOwnerAuth() {
  return {
    user: { id: USER_ID } as ReturnType<typeof useAuth>["user"],
    loading: false,
    error: null,
    userType: null,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    loginWithApple: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    refreshSession: jest.fn(),
    register: jest.fn(),
    sendUsernameReminder: jest.fn(),
  } as const;
}

function fileOfType(type: string, name = "x.png", size = 1024): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("LogoBannerUploadCard", () => {
  let onLogoUploaded: jest.Mock<(_url: string | null) => void>;
  let onBannerUploaded: jest.Mock<(_url: string | null) => void>;
  let showToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockState();
    mockUseAuth.mockReturnValue(makeOwnerAuth());
    showToast = jest.fn();
    mockUseToast.mockReturnValue({ showToast });
    onLogoUploaded = jest.fn();
    onBannerUploaded = jest.fn();
  });

  const renderCard = (overrides: Partial<{
    logoUrl: string | null;
    bannerImageUrl: string | null;
    claimedByUserId: string | null;
  }> = {}) =>
    render(
      <LogoBannerUploadCard
        ein="12-3456789"
        logoUrl={overrides.logoUrl ?? null}
        bannerImageUrl={overrides.bannerImageUrl ?? null}
        claimedByUserId={overrides.claimedByUserId ?? USER_ID}
        onLogoUploaded={onLogoUploaded}
        onBannerUploaded={onBannerUploaded}
      />,
    );

  it("renders heading and upload prompts for the owner with no images", () => {
    renderCard();
    expect(screen.getByText(/logo & banner/i)).toBeInTheDocument();
    expect(screen.getByText(/click an image to replace it/i)).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Upload banner")).toBeInTheDocument();
  });

  it("shows existing logo and banner images when URLs are provided", () => {
    renderCard({
      logoUrl: "https://example.com/logo.png",
      bannerImageUrl: "https://example.com/banner.png",
    });

    const logo = screen.getByAltText("Organization logo") as HTMLImageElement;
    const banner = screen.getByAltText("Organization banner") as HTMLImageElement;
    expect(logo.src).toBe("https://example.com/logo.png");
    expect(banner.src).toBe("https://example.com/banner.png");
  });

  it("renders read-only state and no file inputs when viewer is not the owner", () => {
    renderCard({ claimedByUserId: "someone-else" });
    expect(screen.getByText(/managed by owner/i)).toBeInTheDocument();
    expect(screen.getByText("No logo")).toBeInTheDocument();
    expect(screen.getByText("No banner")).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("non-owner placeholder buttons do nothing when clicked", () => {
    renderCard({ claimedByUserId: "someone-else" });
    fireEvent.click(screen.getByText("No logo"));
    fireEvent.click(screen.getByText("No banner"));
    expect(onLogoUploaded).not.toHaveBeenCalled();
    expect(onBannerUploaded).not.toHaveBeenCalled();
  });

  it("uploads a logo file, updates charity_profiles and notifies parent", async () => {
    const storage = setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/logo.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const logoInput = fileInputs[0] as HTMLInputElement;
    fireEvent.change(logoInput, {
      target: { files: [fileOfType("image/png")] },
    });

    await waitFor(() => {
      expect(onLogoUploaded).toHaveBeenCalledWith("https://cdn.test/logo.png");
    });
    expect(supabase.storage.from).toHaveBeenCalledWith("charity-assets");
    expect(storage.upload).toHaveBeenCalledWith(
      "12-3456789/logo.png",
      expect.any(File),
      { cacheControl: "3600", upsert: true },
    );
    expect(showToast).toHaveBeenCalledWith("success", "Logo uploaded");
  });

  it("uploads a banner file and notifies parent", async () => {
    setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/banner.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const bannerInput = fileInputs[1] as HTMLInputElement;
    fireEvent.change(bannerInput, {
      target: { files: [fileOfType("image/jpeg", "b.jpg")] },
    });

    await waitFor(() => {
      expect(onBannerUploaded).toHaveBeenCalledWith(
        "https://cdn.test/banner.png",
      );
    });
    expect(showToast).toHaveBeenCalledWith("success", "Banner uploaded");
  });

  it("rejects invalid file types and does not call the storage API", async () => {
    const storage = setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/x.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], {
      target: { files: [fileOfType("application/pdf", "x.pdf")] },
    });

    await Promise.resolve();
    expect(storage.upload).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "error",
      "Invalid file type",
      expect.stringMatching(/JPEG, PNG, or WebP/),
    );
    expect(onLogoUploaded).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5 MB", async () => {
    const storage = setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/x.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], {
      target: {
        files: [fileOfType("image/png", "big.png", 6 * 1024 * 1024)],
      },
    });

    await Promise.resolve();
    expect(storage.upload).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "error",
      "File too large",
      expect.stringMatching(/5 MB/),
    );
  });

  it("shows an error toast and skips the callback when upload fails", async () => {
    setStorageResult(
      { data: null, error: { message: "boom" } },
      "https://cdn.test/x.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], {
      target: { files: [fileOfType("image/png")] },
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "error",
        "Upload failed",
        "Please try again.",
      );
    });
    expect(onLogoUploaded).not.toHaveBeenCalled();
  });

  it("clicking the owner placeholders opens the corresponding file input", () => {
    setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/x.png",
    );
    renderCard();
    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    const logoClick = jest.spyOn(fileInputs[0], "click");
    const bannerClick = jest.spyOn(fileInputs[1], "click");

    fireEvent.click(screen.getByText("Upload"));
    fireEvent.click(screen.getByText("Upload banner"));

    expect(logoClick).toHaveBeenCalled();
    expect(bannerClick).toHaveBeenCalled();
  });

  it("clicking existing logo/banner images opens the corresponding file input", () => {
    setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/x.png",
    );
    renderCard({
      logoUrl: "https://example.com/logo.png",
      bannerImageUrl: "https://example.com/banner.png",
    });
    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    const logoClick = jest.spyOn(fileInputs[0], "click");
    const bannerClick = jest.spyOn(fileInputs[1], "click");

    fireEvent.click(screen.getByRole("button", { name: /replace logo/i }));
    fireEvent.click(screen.getByRole("button", { name: /replace banner/i }));

    expect(logoClick).toHaveBeenCalled();
    expect(bannerClick).toHaveBeenCalled();
  });

  it("shows an error toast when updating charity_profiles row fails", async () => {
    setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/logo.png",
    );
    // setMockResult for charity_profiles will be returned by the .update().eq() chain.
    // The supabase mock resolves any chain to the configured table result.
    const { setMockResult } = await import("@/lib/supabase");
    setMockResult("charity_profiles", {
      data: null,
      error: { message: "db boom" },
    });

    renderCard();
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], {
      target: { files: [fileOfType("image/png")] },
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "error",
        "Save failed",
        "Please try again.",
      );
    });
    expect(onLogoUploaded).not.toHaveBeenCalled();
  });

  it("ignores change events that contain no file", () => {
    setStorageResult(
      { data: { path: "p" }, error: null },
      "https://cdn.test/x.png",
    );
    renderCard();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], { target: { files: [] } });
    fireEvent.change(fileInputs[1], { target: { files: [] } });

    expect(onLogoUploaded).not.toHaveBeenCalled();
    expect(onBannerUploaded).not.toHaveBeenCalled();
  });
});
