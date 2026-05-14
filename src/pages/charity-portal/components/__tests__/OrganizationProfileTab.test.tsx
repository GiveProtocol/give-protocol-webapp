import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { setMockResult, resetMockState } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCharityProfileAssets,
  fetchCharityProfileAssetsByEin,
} from "@/services/charityProfileService";
import { OrganizationProfileTab } from "../OrganizationProfileTab";

const mockUseAuth = jest.mocked(useAuth);
const mockFetchCharityProfileAssets = jest.mocked(fetchCharityProfileAssets);
const mockFetchByEin = jest.mocked(fetchCharityProfileAssetsByEin);

const USER_ID = "user-abc";

const ownerAuthState = {
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

describe("OrganizationProfileTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockState();
    mockUseAuth.mockReturnValue(ownerAuthState);
    setMockResult("profiles", { data: { meta: null }, error: null });
    mockFetchCharityProfileAssets.mockResolvedValue({
      ein: "12-3456789",
      logoUrl: null,
      bannerImageUrl: null,
      claimedByUserId: USER_ID,
    });
    mockFetchByEin.mockResolvedValue(null);
  });

  it("renders OrganizationProfileForm after loading", async () => {
    render(<OrganizationProfileTab profileId="profile-123" />);
    const saveBtn = await screen.findByRole("button", {
      name: /save changes/i,
    });
    expect(saveBtn).toBeInTheDocument();
  });

  it("renders LogoBannerUploadCard when charity_profiles row exists for the user", async () => {
    render(<OrganizationProfileTab profileId="profile-123" />);
    await waitFor(() => {
      expect(screen.getByText(/logo & banner/i)).toBeInTheDocument();
    });
  });

  it("does not render LogoBannerUploadCard when no charity_profiles row", async () => {
    mockFetchCharityProfileAssets.mockResolvedValue(null);
    render(<OrganizationProfileTab profileId="profile-123" />);
    await screen.findByRole("button", { name: /save changes/i });
    expect(screen.queryByText(/logo & banner/i)).not.toBeInTheDocument();
  });

  it("falls back to EIN lookup when claimed_by returns nothing", async () => {
    mockFetchCharityProfileAssets.mockResolvedValue(null);
    mockFetchByEin.mockResolvedValue({
      ein: "98-7654321",
      logoUrl: null,
      bannerImageUrl: null,
      claimedByUserId: null,
    });
    mockUseAuth.mockReturnValue({
      ...ownerAuthState,
      user: {
        id: USER_ID,
        user_metadata: { ein: "98-7654321" },
      } as ReturnType<typeof useAuth>["user"],
    });
    render(<OrganizationProfileTab profileId="profile-123" />);
    await waitFor(() => {
      expect(screen.getByText(/logo & banner/i)).toBeInTheDocument();
    });
    expect(mockFetchByEin).toHaveBeenCalledWith("98-7654321");
  });

  it("does not render LogoBannerUploadCard when no user is logged in", async () => {
    mockUseAuth.mockReturnValue({
      ...ownerAuthState,
      user: null,
    });
    render(<OrganizationProfileTab profileId="profile-123" />);
    await screen.findByRole("button", { name: /save changes/i });
    expect(screen.queryByText(/logo & banner/i)).not.toBeInTheDocument();
    expect(mockFetchCharityProfileAssets).not.toHaveBeenCalled();
  });
});
